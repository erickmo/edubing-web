/**
 * TDD tests untuk LoginForm, RegisterForm, dan safe_redirect.
 * Dijalankan SEBELUM implementasi — semua tes harus GAGAL dulu.
 *
 * Strategy:
 * - Mock auth.ts dan useSession store sepenuhnya via vi.hoisted().
 * - TurnstileWidget di-mock agar bisa trigger onVerify secara programatik.
 * - Render di MemoryRouter dengan catch-route untuk verifikasi navigasi.
 */

import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ─── Hoisted mock variables (dideklarasikan sebelum vi.mock hoisting) ─────────
const {
  mockLogin,
  mockRegister,
  mockGetLoggedUser,
  mockGetCsrfToken,
  mockSetSession,
  mockSetStatus,
} = vi.hoisted(() => ({
  mockLogin: vi.fn(),
  mockRegister: vi.fn(),
  mockGetLoggedUser: vi.fn(),
  mockGetCsrfToken: vi.fn(() => "csrf-tok-123"),
  mockSetSession: vi.fn(),
  mockSetStatus: vi.fn(),
}));

// State session yang bisa diubah per test
let sessionStatus = "guest";

// ─── Mocks ───────────────────────────────────────────────────────────────────

// Mock auth.ts
vi.mock("../../../lib/frappe/auth", () => ({
  login: mockLogin,
  register: mockRegister,
  getLoggedUser: mockGetLoggedUser,
  getCsrf: vi.fn().mockResolvedValue("csrf-tok"),
}));

vi.mock("../../../lib/frappe/client", () => ({
  getCsrfToken: mockGetCsrfToken,
  setCsrfToken: vi.fn(),
  FrappeError: class FrappeError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "FrappeError";
    }
  },
}));

// Simpan callback onVerify agar bisa di-trigger dari test
let capturedOnVerify: ((token: string) => void) | null = null;

vi.mock("../TurnstileWidget", () => ({
  TurnstileWidget: ({
    onVerify,
    onExpire,
  }: {
    onVerify: (token: string) => void;
    onExpire?: () => void;
  }) => {
    capturedOnVerify = onVerify;
    return (
      <div data-testid="turnstile-widget">
        <button
          type="button"
          data-testid="simulate-verify"
          onClick={() => onVerify("test-token-abc")}
        >
          Verify
        </button>
        {onExpire && (
          <button
            type="button"
            data-testid="simulate-expire"
            onClick={() => onExpire()}
          >
            Expire
          </button>
        )}
      </div>
    );
  },
}));

// Mock useSession
vi.mock("../../../store/session", () => ({
  useSession: (selector: (s: unknown) => unknown) => {
    const state = {
      status: sessionStatus,
      set_session: mockSetSession,
      set_status: mockSetStatus,
    };
    return selector(state);
  },
}));

// ─── Imports setelah mock ─────────────────────────────────────────────────────

import { LoginForm } from "../LoginForm";
import { RegisterForm } from "../RegisterForm";
import { safe_redirect } from "../../../lib/auth/redirect";
import { FrappeError } from "../../../lib/frappe/client";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Catch component untuk verifikasi navigasi. */
function LocationCapture() {
  const loc = useLocation();
  return (
    <div data-testid="nav-target">
      {loc.pathname}
      {loc.search}
    </div>
  );
}

function renderLoginForm(initialPath = "/masuk") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/masuk" element={<LoginForm />} />
        <Route path="*" element={<LocationCapture />} />
      </Routes>
    </MemoryRouter>,
  );
}

function renderRegisterForm(initialPath = "/daftar") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/daftar" element={<RegisterForm />} />
        <Route path="*" element={<LocationCapture />} />
      </Routes>
    </MemoryRouter>,
  );
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("safe_redirect", () => {
  it('mengembalikan "/akun" jika param null', () => {
    expect(safe_redirect(null)).toBe("/akun");
  });

  it('mengembalikan "/akun" jika param kosong', () => {
    expect(safe_redirect("")).toBe("/akun");
  });

  it('memperbolehkan path dalam app seperti "/checkout/x"', () => {
    expect(safe_redirect("/checkout/x")).toBe("/checkout/x");
  });

  it('memperbolehkan path dalam app seperti "/akun"', () => {
    expect(safe_redirect("/akun")).toBe("/akun");
  });

  it('memblokir URL eksternal "http://evil.com" → "/akun"', () => {
    expect(safe_redirect("http://evil.com")).toBe("/akun");
  });

  it('memblokir protocol-relative "//evil.com" → "/akun"', () => {
    expect(safe_redirect("//evil.com")).toBe("/akun");
  });

  it('memblokir HTTPS eksternal → "/akun"', () => {
    expect(safe_redirect("https://evil.com/steal")).toBe("/akun");
  });
});

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStatus = "guest";
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("merender field email dan password", () => {
    renderLoginForm();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/kata sandi/i)).toBeInTheDocument();
  });

  it("submit berhasil: memanggil login() lalu getLoggedUser() lalu navigasi ke redirect", async () => {
    mockLogin.mockResolvedValueOnce(undefined);
    mockGetLoggedUser.mockResolvedValueOnce("user@test.com");

    renderLoginForm("/masuk?redirect=%2Fakun");

    await userEvent.type(screen.getByLabelText(/email/i), "user@test.com");
    await userEvent.type(screen.getByLabelText(/kata sandi/i), "password123");

    fireEvent.submit(screen.getByRole("button", { name: /masuk/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("user@test.com", "password123");
    });
    await waitFor(() => {
      expect(mockGetLoggedUser).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(mockSetSession).toHaveBeenCalledWith(
        "user@test.com",
        null,
        "csrf-tok-123",
      );
    });
    await waitFor(() => {
      expect(screen.getByTestId("nav-target")).toHaveTextContent("/akun");
    });
  });

  it("FrappeError: menampilkan pesan error dan TIDAK navigasi", async () => {
    const errMsg = "Email atau kata sandi salah";
    mockLogin.mockRejectedValueOnce(new FrappeError(errMsg));

    renderLoginForm();

    await userEvent.type(screen.getByLabelText(/email/i), "wrong@test.com");
    await userEvent.type(screen.getByLabelText(/kata sandi/i), "wrongpass");

    fireEvent.submit(screen.getByRole("button", { name: /masuk/i }));

    await waitFor(() => {
      expect(screen.getByText(errMsg)).toBeInTheDocument();
    });

    // Tidak ada navigasi
    expect(screen.queryByTestId("nav-target")).not.toBeInTheDocument();
  });

  it("redirect default ke /akun jika tidak ada param redirect", async () => {
    mockLogin.mockResolvedValueOnce(undefined);
    mockGetLoggedUser.mockResolvedValueOnce("user@test.com");

    renderLoginForm("/masuk");

    await userEvent.type(screen.getByLabelText(/email/i), "user@test.com");
    await userEvent.type(screen.getByLabelText(/kata sandi/i), "password123");

    fireEvent.submit(screen.getByRole("button", { name: /masuk/i }));

    await waitFor(() => {
      expect(screen.getByTestId("nav-target")).toHaveTextContent("/akun");
    });
  });
});

describe("RegisterForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStatus = "guest";
    capturedOnVerify = null;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("tombol submit DISABLED saat belum ada Turnstile token", async () => {
    renderRegisterForm();

    const submitBtn = screen.getByRole("button", { name: /daftar/i });
    expect(submitBtn).toBeDisabled();
  });

  it("tombol submit ENABLED setelah Turnstile onVerify dipanggil", async () => {
    renderRegisterForm();

    // Isi semua field wajib
    await userEvent.type(screen.getByLabelText(/nama lengkap/i), "Tes Pengguna");
    await userEvent.type(screen.getByLabelText(/email/i), "tes@email.com");
    await userEvent.type(screen.getByLabelText(/nomor hp/i), "08123456789");
    await userEvent.type(screen.getByLabelText(/^kata sandi$/i), "password123");
    await userEvent.type(
      screen.getByLabelText(/konfirmasi kata sandi/i),
      "password123",
    );

    // Sebelum verify — masih disabled
    expect(screen.getByRole("button", { name: /daftar/i })).toBeDisabled();

    // Simulasi Turnstile verify
    act(() => {
      capturedOnVerify?.("test-token-abc");
    });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /daftar/i })).not.toBeDisabled();
    });
  });

  it("submit memanggil register() dengan captcha_token dan navigasi setelah berhasil", async () => {
    mockRegister.mockResolvedValueOnce({
      student: "STU-001",
      csrf_token: "new-csrf",
    });

    renderRegisterForm("/daftar?redirect=%2Fakun");

    await userEvent.type(screen.getByLabelText(/nama lengkap/i), "Tes Pengguna");
    await userEvent.type(screen.getByLabelText(/email/i), "tes@email.com");
    await userEvent.type(screen.getByLabelText(/nomor hp/i), "08123456789");
    await userEvent.type(screen.getByLabelText(/^kata sandi$/i), "password123");
    await userEvent.type(
      screen.getByLabelText(/konfirmasi kata sandi/i),
      "password123",
    );

    // Simulasi Turnstile verify
    act(() => {
      capturedOnVerify?.("test-token-abc");
    });

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /daftar/i }),
      ).not.toBeDisabled();
    });

    fireEvent.submit(screen.getByRole("button", { name: /daftar/i }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "tes@email.com",
          captcha_token: "test-token-abc",
        }),
      );
    });

    await waitFor(() => {
      expect(mockSetSession).toHaveBeenCalledWith("tes@email.com", "STU-001", "new-csrf");
    });

    await waitFor(() => {
      expect(screen.getByTestId("nav-target")).toHaveTextContent("/akun");
    });
  });

  it("FrappeError: menampilkan pesan error dan mereset Turnstile token", async () => {
    const errMsg = "Verifikasi CAPTCHA gagal";
    mockRegister.mockRejectedValueOnce(new FrappeError(errMsg));

    renderRegisterForm();

    await userEvent.type(screen.getByLabelText(/nama lengkap/i), "Tes Pengguna");
    await userEvent.type(screen.getByLabelText(/email/i), "tes@email.com");
    await userEvent.type(screen.getByLabelText(/nomor hp/i), "08123456789");
    await userEvent.type(screen.getByLabelText(/^kata sandi$/i), "password123");
    await userEvent.type(
      screen.getByLabelText(/konfirmasi kata sandi/i),
      "password123",
    );

    // Simulasi Turnstile verify
    act(() => {
      capturedOnVerify?.("test-token-abc");
    });

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /daftar/i }),
      ).not.toBeDisabled();
    });

    fireEvent.submit(screen.getByRole("button", { name: /daftar/i }));

    await waitFor(() => {
      expect(screen.getByText(errMsg)).toBeInTheDocument();
    });

    // Token direset — tombol kembali disabled
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /daftar/i })).toBeDisabled();
    });
  });
});
