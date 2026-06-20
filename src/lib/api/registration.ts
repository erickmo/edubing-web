/**
 * Tipe data, fungsi API, dan mesin state (reducer) untuk alur checkout event.
 *
 * Reducer adalah pure function — tidak ada efek samping, mudah diuji.
 * Fungsi API menggunakan frappeCall dengan endpoint yang sudah diverifikasi.
 */
import { frappeCall } from "../frappe/client";

// ─── Tipe API ─────────────────────────────────────────────────────────────────

/** Hasil dari endpoint register_for_event. */
export interface RegisterResult {
  /** true = perlu pembayaran; false = event gratis, langsung terdaftar. */
  paid: boolean;
  /** Nama dokumen Registration di Frappe (primary key). */
  registration: string;
  /** Nama dokumen Order (ada jika paid === true). */
  order_name?: string;
  /** Token Midtrans Snap (ada jika gateway = midtrans dan paid = true). */
  snap_token?: string;
  /** URL redirect Xendit (ada jika gateway = xendit dan paid = true). */
  redirect_url?: string;
}

/** Status polling dari endpoint checkout_status. */
export interface CheckoutStatus {
  registration_status: string;
  order_status: string | null;
}

// ─── Fungsi API ───────────────────────────────────────────────────────────────

const METHOD_REGISTER = "vernon_edubing.eb_event.api.checkout.register_for_event";
const METHOD_STATUS = "vernon_edubing.eb_event.api.checkout.checkout_status";

/**
 * Daftarkan pengguna ke event.
 * @param event_name - Nama dokumen event di Frappe (bukan route/slug).
 * @param gateway_provider - "midtrans" untuk Snap, "xendit" untuk redirect.
 */
export function registerForEvent(
  event_name: string,
  gateway_provider: "midtrans" | "xendit",
): Promise<RegisterResult> {
  return frappeCall<RegisterResult>(METHOD_REGISTER, {
    event: event_name,
    gateway_provider,
  });
}

/**
 * Cek status pendaftaran dan pembayaran.
 * @param registration - Nama dokumen Registration di Frappe.
 */
export function checkoutStatus(registration: string): Promise<CheckoutStatus> {
  return frappeCall<CheckoutStatus>(METHOD_STATUS, { registration });
}

// ─── Mesin state checkout (funnel) ───────────────────────────────────────────

/** Seluruh fase yang mungkin dalam alur checkout. */
export type FunnelState =
  | { phase: "idle" }
  | { phase: "registering" }
  | { phase: "paying"; registration: string }
  | { phase: "polling"; registration: string }
  | { phase: "success" }
  | { phase: "failed"; message: string };

/** Event yang memicu transisi state. */
export type FunnelEvent =
  | { type: "REGISTER_START" }
  | { type: "REGISTERED_FREE" }
  | { type: "PAY_START"; registration: string }
  | { type: "POLL_START"; registration: string }
  | { type: "SETTLED" }
  | { type: "FAIL"; message: string }
  | { type: "RESET" };

/**
 * Pure reducer untuk mesin state checkout.
 *
 * Transisi yang didefinisikan:
 * - idle       + REGISTER_START  → registering
 * - registering + REGISTERED_FREE → success
 * - registering + PAY_START       → paying
 * - paying     + POLL_START       → polling
 * - polling    + SETTLED          → success
 * - any        + FAIL             → failed
 * - failed/success + RESET        → idle
 * - lainnya                       → state tidak berubah
 */
export function funnelReducer(
  state: FunnelState,
  event: FunnelEvent,
): FunnelState {
  // FAIL dan RESET berlaku dari fase mana saja
  if (event.type === "FAIL") {
    return { phase: "failed", message: event.message };
  }
  if (event.type === "RESET") {
    return { phase: "idle" };
  }

  switch (state.phase) {
    case "idle":
      if (event.type === "REGISTER_START") return { phase: "registering" };
      return state;

    case "registering":
      if (event.type === "REGISTERED_FREE") return { phase: "success" };
      if (event.type === "PAY_START") {
        return { phase: "paying", registration: event.registration };
      }
      return state;

    case "paying":
      if (event.type === "POLL_START") {
        return { phase: "polling", registration: event.registration };
      }
      return state;

    case "polling":
      if (event.type === "SETTLED") return { phase: "success" };
      return state;

    case "success":
    case "failed":
      return state;

    default:
      return state;
  }
}
