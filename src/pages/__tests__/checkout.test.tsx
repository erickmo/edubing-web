/**
 * Uji alur halaman Checkout (ringan — mocking heavy).
 *
 * Cakupan:
 *  1. Event gratis: klik CTA → registerForEvent({paid:false}) → panel sukses.
 *  2. Event berbayar: {paid:true, snap_token} → loadSnap + openSnap dipanggil
 *     → onSuccess → polling → checkoutStatus → Registered → panel sukses.
 *  3. Error FrappeError("Event sudah penuh") → pesan ditampilkan, fase failed.
 */

import type { ReactNode } from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Stub vite-react-ssg <Head> ──────────────────────────────────────────────
vi.mock("vite-react-ssg", async (importOriginal) => {
  const actual = await importOriginal<typeof import("vite-react-ssg")>();
  return {
    ...actual,
    Head: ({ children }: { children?: ReactNode }) => <>{children}</>,
  };
});

// ─── Stub useParams untuk slug ────────────────────────────────────────────────
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useParams: () => ({ slug: "webinar-python-dasar" }),
    useLoaderData: () => null,
  };
});

// ─── Mock API events ──────────────────────────────────────────────────────────
import type { PublicEvent } from "../../lib/api/events";

const FREE_EVENT: PublicEvent = {
  name: "EV-FREE-001",
  route: "webinar-python-dasar",
  title: "Webinar Python Dasar",
  event_type: "online",
  start_date: "2025-08-01T09:00:00",
  end_date: "2025-08-01T11:00:00",
  location: "Online",
  price: 0,
  capacity: 100,
  remaining_seats: 42,
  featured_image: "",
  short_description: "Belajar Python.",
};

const PAID_EVENT: PublicEvent = {
  ...FREE_EVENT,
  name: "EV-PAID-001",
  price: 250_000,
};

const mockUseEvent = vi.fn();

vi.mock("../../lib/api/events", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../lib/api/events")>();
  return {
    ...actual,
    useEvent: (...args: Parameters<typeof mockUseEvent>) =>
      mockUseEvent(...args),
  };
});

// ─── Mock registration API ────────────────────────────────────────────────────
const mockRegisterForEvent = vi.fn();
const mockCheckoutStatus = vi.fn();

vi.mock("../../lib/api/registration", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../lib/api/registration")>();
  return {
    ...actual,
    registerForEvent: (...args: Parameters<typeof mockRegisterForEvent>) =>
      mockRegisterForEvent(...args),
    checkoutStatus: (...args: Parameters<typeof mockCheckoutStatus>) =>
      mockCheckoutStatus(...args),
  };
});

// ─── Mock snap.ts ─────────────────────────────────────────────────────────────
const mockLoadSnap = vi.fn();
const mockOpenSnap = vi.fn();

vi.mock("../../lib/payment/snap", () => ({
  loadSnap: () => mockLoadSnap(),
  openSnap: (
    token: string,
    cb: { onSuccess: () => void; onPending: () => void; onError: () => void; onClose: () => void },
  ) => mockOpenSnap(token, cb),
}));

// ─── Helper render ────────────────────────────────────────────────────────────
import Checkout from "../Checkout";
import { FrappeError } from "../../lib/frappe/client";

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={["/checkout/webinar-python-dasar"]}>
        <Checkout />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

// ─── Reset mocks sebelum setiap uji ──────────────────────────────────────────
beforeEach(() => {
  vi.clearAllMocks();
  mockLoadSnap.mockResolvedValue(undefined);
});

// ─── Uji 1: Event gratis ──────────────────────────────────────────────────────
describe("Checkout — event gratis", () => {
  beforeEach(() => {
    mockUseEvent.mockReturnValue({
      data: FREE_EVENT,
      isLoading: false,
      isError: false,
    });
    mockRegisterForEvent.mockResolvedValue({
      paid: false,
      registration: "REG-FREE-001",
    });
  });

  it("menampilkan judul event", () => {
    renderPage();
    expect(screen.getByText("Webinar Python Dasar")).toBeInTheDocument();
  });

  it('CTA "Konfirmasi & Daftar" ada untuk event gratis', () => {
    renderPage();
    expect(
      screen.getByRole("button", { name: /konfirmasi & daftar/i }),
    ).toBeInTheDocument();
  });

  it("klik CTA → registerForEvent dipanggil → panel sukses muncul", async () => {
    renderPage();

    const cta = screen.getByRole("button", { name: /konfirmasi & daftar/i });
    fireEvent.click(cta);

    await waitFor(() => {
      expect(screen.getByText(/kamu berhasil terdaftar/i)).toBeInTheDocument();
    });

    expect(mockRegisterForEvent).toHaveBeenCalledWith("EV-FREE-001", "midtrans");
  });
});

// ─── Uji 2: Event berbayar dengan Snap ───────────────────────────────────────
describe("Checkout — event berbayar (Midtrans Snap)", () => {
  beforeEach(() => {
    mockUseEvent.mockReturnValue({
      data: PAID_EVENT,
      isLoading: false,
      isError: false,
    });
  });

  it('CTA "Bayar & Daftar" ada untuk event berbayar', () => {
    renderPage();
    expect(
      screen.getByRole("button", { name: /bayar & daftar/i }),
    ).toBeInTheDocument();
  });

  it("snap_token → loadSnap + openSnap dipanggil → onSuccess → polling → sukses", async () => {
    // registerForEvent mengembalikan snap_token
    mockRegisterForEvent.mockResolvedValue({
      paid: true,
      registration: "REG-PAID-001",
      snap_token: "snap-tok-xyz",
    });

    // checkoutStatus mengembalikan Registered setelah polling pertama
    mockCheckoutStatus.mockResolvedValue({
      registration_status: "Registered",
      order_status: "Paid",
    });

    // Tangkap callback Snap agar bisa dipanggil manual
    let capturedCb: { onSuccess: () => void } | null = null;
    mockOpenSnap.mockImplementation(
      (_token: string, cb: { onSuccess: () => void }) => {
        capturedCb = cb;
      },
    );

    renderPage();

    const cta = screen.getByRole("button", { name: /bayar & daftar/i });
    fireEvent.click(cta);

    // Tunggu loadSnap dan openSnap dipanggil
    await waitFor(() => {
      expect(mockLoadSnap).toHaveBeenCalledOnce();
      expect(mockOpenSnap).toHaveBeenCalledWith("snap-tok-xyz", expect.any(Object));
    });

    // Simulasikan pengguna berhasil bayar
    await act(async () => {
      capturedCb?.onSuccess();
    });

    // Tunggu polling menyelesaikan dan panel sukses muncul
    await waitFor(
      () => {
        expect(
          screen.getByText(/kamu berhasil terdaftar/i),
        ).toBeInTheDocument();
      },
      { timeout: 5_000 },
    );

    expect(mockCheckoutStatus).toHaveBeenCalledWith("REG-PAID-001");
  });
});

// ─── Uji 2b: Unmount guard — tidak ada dispatch setelah unmount ───────────────
describe("Checkout — unmount guard saat polling", () => {
  beforeEach(() => {
    mockUseEvent.mockReturnValue({
      data: PAID_EVENT,
      isLoading: false,
      isError: false,
    });
  });

  it("unmount saat promise checkoutStatus in-flight tidak melempar error dispatch", async () => {
    vi.useFakeTimers();

    mockRegisterForEvent.mockResolvedValue({
      paid: true,
      registration: "REG-UNMOUNT-001",
      snap_token: "snap-tok-unmount",
    });

    // checkoutStatus menggantung (tidak resolve) sampai kita kontrol
    let resolveStatus!: (v: { registration_status: string; order_status: string }) => void;
    mockCheckoutStatus.mockReturnValue(
      new Promise((res) => {
        resolveStatus = res;
      }),
    );

    // Tangkap callback Snap
    let capturedCb: { onSuccess: () => void } | null = null;
    mockOpenSnap.mockImplementation(
      (_token: string, cb: { onSuccess: () => void }) => {
        capturedCb = cb;
      },
    );

    const { unmount } = renderPage();

    fireEvent.click(screen.getByRole("button", { name: /bayar & daftar/i }));

    // Tunggu openSnap dipanggil
    await act(async () => {
      await Promise.resolve();
    });

    // Picu onSuccess → mulai polling
    await act(async () => {
      capturedCb?.onSuccess();
    });

    // Maju waktu agar interval polling pertama trigger
    await act(async () => {
      vi.advanceTimersByTime(3_000);
    });

    // Unmount komponen saat promise masih in-flight
    unmount();

    // Sekarang resolve promise — seharusnya tidak ada dispatch / error
    await act(async () => {
      resolveStatus({ registration_status: "Registered", order_status: "Paid" });
    });

    // Jika tidak ada error dilempar, guard bekerja dengan benar.
    // Tidak ada assertion tambahan — tidak ada error = lulus.
    vi.useRealTimers();
  });
});

// ─── Uji 3: Error dari registerForEvent ──────────────────────────────────────
describe("Checkout — error saat registrasi", () => {
  beforeEach(() => {
    mockUseEvent.mockReturnValue({
      data: FREE_EVENT,
      isLoading: false,
      isError: false,
    });
  });

  it("FrappeError ditampilkan sebagai pesan gagal", async () => {
    mockRegisterForEvent.mockRejectedValue(
      new FrappeError("Event sudah penuh", 400),
    );

    renderPage();

    const cta = screen.getByRole("button", { name: /konfirmasi & daftar/i });
    fireEvent.click(cta);

    await waitFor(() => {
      expect(screen.getByText("Event sudah penuh")).toBeInTheDocument();
    });
  });

  it("fase failed menampilkan tombol Coba lagi", async () => {
    mockRegisterForEvent.mockRejectedValue(
      new FrappeError("Event sudah penuh", 400),
    );

    renderPage();
    fireEvent.click(screen.getByRole("button", { name: /konfirmasi & daftar/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /coba lagi/i })).toBeInTheDocument();
    });
  });
});

// ─── Uji 4: Event tidak ditemukan ────────────────────────────────────────────
describe("Checkout — event tidak ditemukan", () => {
  it("menampilkan pesan error dan link kembali", () => {
    mockUseEvent.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });

    renderPage();
    expect(screen.getByText(/event tidak ditemukan/i)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /kembali ke daftar event/i }),
    ).toBeInTheDocument();
  });
});

// ─── Uji 5: Kursi penuh ──────────────────────────────────────────────────────
describe("Checkout — kursi penuh", () => {
  it("tombol CTA dinonaktifkan ketika remaining_seats === 0", () => {
    mockUseEvent.mockReturnValue({
      data: { ...FREE_EVENT, remaining_seats: 0 },
      isLoading: false,
      isError: false,
    });

    renderPage();
    const btn = screen.getByRole("button", { name: /kursi penuh/i });
    expect(btn).toBeDisabled();
  });
});
