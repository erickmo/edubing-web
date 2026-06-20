/**
 * Integrasi Midtrans Snap.js — muat skrip sekali dan buka token pembayaran.
 *
 * Modul ini hanya boleh dijalankan di sisi klien (browser).
 * Menggunakan VITE_MIDTRANS_CLIENT_KEY (client key, BUKAN server key).
 */

/** URL skrip Snap.js (default: sandbox). */
const SNAP_URL =
  import.meta.env.VITE_MIDTRANS_SNAP_URL ??
  "https://app.sandbox.midtrans.com/snap/snap.js";

/** Client key Midtrans dari environment variable. */
const SNAP_CLIENT_KEY = import.meta.env.VITE_MIDTRANS_CLIENT_KEY as
  | string
  | undefined;

/** ID elemen skrip Snap untuk menghindari pemuatan ganda. */
const SNAP_SCRIPT_ID = "midtrans-snap-js";

/** Waktu tunggu maksimal pemuatan skrip (ms). */
const SNAP_LOAD_TIMEOUT_MS = 10_000;

/** Promise yang sedang berjalan agar loadSnap() tidak duplikat. */
let loadPromise: Promise<void> | null = null;

/**
 * Muat Snap.js satu kali ke dalam DOM.
 * Memanggil fungsi ini beberapa kali hanya akan menunggu satu pemuatan.
 *
 * @throws Error jika VITE_MIDTRANS_CLIENT_KEY tidak dikonfigurasi.
 * @throws Error jika skrip gagal dimuat atau melebihi batas waktu.
 */
export function loadSnap(): Promise<void> {
  if (loadPromise !== null) return loadPromise;

  loadPromise = new Promise<void>((resolve, reject) => {
    if (!SNAP_CLIENT_KEY) {
      reject(
        new Error(
          "VITE_MIDTRANS_CLIENT_KEY belum dikonfigurasi. Hubungi administrator.",
        ),
      );
      return;
    }

    // Jika sudah ada (mis. SSR hydration dua kali) langsung resolve.
    if (document.getElementById(SNAP_SCRIPT_ID)) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.id = SNAP_SCRIPT_ID;
    script.src = SNAP_URL;
    script.setAttribute("data-client-key", SNAP_CLIENT_KEY);

    const timer = setTimeout(() => {
      script.remove();
      loadPromise = null;
      reject(new Error("Skrip Midtrans Snap gagal dimuat (timeout)."));
    }, SNAP_LOAD_TIMEOUT_MS);

    script.onload = () => {
      clearTimeout(timer);
      resolve();
    };

    script.onerror = () => {
      clearTimeout(timer);
      script.remove();
      loadPromise = null;
      reject(new Error("Skrip Midtrans Snap gagal dimuat."));
    };

    document.head.appendChild(script);
  });

  return loadPromise;
}

/** Callback yang diteruskan ke window.snap.pay(). */
export interface SnapCallbacks {
  /** Pembayaran berhasil dikonfirmasi oleh Midtrans. */
  onSuccess: () => void;
  /** Pembayaran masih pending (belum dikonfirmasi). */
  onPending: () => void;
  /** Terjadi kesalahan saat pembayaran. */
  onError: (e: unknown) => void;
  /** Pengguna menutup popup Snap tanpa menyelesaikan. */
  onClose: () => void;
}

/** Tipe window dengan Snap yang sudah dimuat. */
interface WindowWithSnap extends Window {
  snap: {
    pay: (token: string, callbacks: SnapCallbacks) => void;
  };
}

/**
 * Buka popup Snap dengan token yang diberikan.
 * Pastikan loadSnap() sudah selesai sebelum memanggil ini.
 *
 * @param token - Snap token dari backend (server key Midtrans).
 * @param cb - Callback untuk berbagai hasil pembayaran.
 */
export function openSnap(token: string, cb: SnapCallbacks): void {
  (window as unknown as WindowWithSnap).snap.pay(token, cb);
}
