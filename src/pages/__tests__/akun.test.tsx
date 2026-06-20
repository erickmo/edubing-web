/**
 * Uji halaman Akun — registrasi saya, status pembayaran, batalkan.
 *
 * Cakupan:
 *  1. Menampilkan 2 baris registrasi (Registered + Pending) dengan badge status.
 *  2. Klik "Batalkan" pada baris Registered → mutasi cancel dipanggil dengan id.
 *  3. Baris Pending menampilkan "Lanjutkan pembayaran" menuju /checkout/<route>.
 *  4. Empty state → "Belum ada registrasi".
 */

import type { ReactNode } from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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

// ─── Mock useSession ──────────────────────────────────────────────────────────
vi.mock("../../store/session", () => ({
  useSession: () => ({ user: "test@example.com", student: "STU-001" }),
}));

// ─── Mock account API ─────────────────────────────────────────────────────────
import type { RegistrationRow } from "../../lib/api/account";

const mockUseMyRegistrations = vi.fn();
const mockUseDashboard = vi.fn();
const mockUseCancelRegistration = vi.fn();
const mockCancelMutate = vi.fn();

vi.mock("../../lib/api/account", async () => {
  return {
    useMyRegistrations: (...args: unknown[]) => mockUseMyRegistrations(...args),
    useDashboard: (...args: unknown[]) => mockUseDashboard(...args),
    useCancelRegistration: (...args: unknown[]) =>
      mockUseCancelRegistration(...args),
  };
});

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const ROW_REGISTERED: RegistrationRow = {
  registration: "REG-001",
  event: "EV-001",
  event_title: "Workshop React Advanced",
  event_route: "workshop-react-advanced",
  start_date: "2025-09-01T09:00:00",
  event_type: "workshop",
  price: 300_000,
  status: "Registered",
  order_status: "Paid",
  registration_date: "2025-08-01T10:00:00",
};

const ROW_PENDING: RegistrationRow = {
  registration: "REG-002",
  event: "EV-002",
  event_title: "Webinar Python Dasar",
  event_route: "webinar-python-dasar",
  start_date: "2025-10-01T09:00:00",
  event_type: "online",
  price: 150_000,
  status: "Pending",
  order_status: "Pending",
  registration_date: "2025-08-05T11:00:00",
};

// ─── Helper render ────────────────────────────────────────────────────────────

import Akun from "../Akun";

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={["/akun"]}>
        <Akun />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

// ─── Setup default mocks ──────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();

  mockUseDashboard.mockReturnValue({
    data: {
      student: { name: "STU-001", full_name: "Budi Santoso", phone: "08123", school: "SMA 1", grade: "12" },
      subscription: null,
      content_count: 5,
      event_count: 3,
    },
    isLoading: false,
    isError: false,
  });

  mockUseCancelRegistration.mockReturnValue({
    mutate: mockCancelMutate,
    isPending: false,
  });
});

// ─── Uji 1: Dua baris registrasi + badge status ───────────────────────────────

describe("Akun — dua baris registrasi", () => {
  beforeEach(() => {
    mockUseMyRegistrations.mockReturnValue({
      data: [ROW_REGISTERED, ROW_PENDING],
      isLoading: false,
      isError: false,
    });
  });

  it("menampilkan judul kedua event", () => {
    renderPage();
    expect(screen.getByText("Workshop React Advanced")).toBeInTheDocument();
    expect(screen.getByText("Webinar Python Dasar")).toBeInTheDocument();
  });

  it('menampilkan badge "Terdaftar" untuk status Registered', () => {
    renderPage();
    expect(screen.getByText("Terdaftar")).toBeInTheDocument();
  });

  it('menampilkan badge "Menunggu pembayaran" untuk status Pending', () => {
    renderPage();
    // Ada 2 elemen "Menunggu pembayaran" — status badge + order line
    const badges = screen.getAllByText("Menunggu pembayaran");
    expect(badges.length).toBeGreaterThanOrEqual(1);
  });
});

// ─── Uji 2: Klik "Batalkan" → mutasi dipanggil ────────────────────────────────

describe("Akun — batalkan registrasi", () => {
  beforeEach(() => {
    mockUseMyRegistrations.mockReturnValue({
      data: [ROW_REGISTERED, ROW_PENDING],
      isLoading: false,
      isError: false,
    });
    // Simulate confirm = true
    vi.stubGlobal("confirm", () => true);
  });

  it('tombol "Batalkan" muncul untuk baris Registered', () => {
    renderPage();
    const buttons = screen.getAllByRole("button", { name: /batalkan/i });
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });

  it('klik "Batalkan" memanggil cancelMutate dengan registration id', async () => {
    renderPage();

    const [firstCancel] = screen.getAllByRole("button", { name: /batalkan/i });
    fireEvent.click(firstCancel);

    await waitFor(() => {
      expect(mockCancelMutate).toHaveBeenCalledWith("REG-001");
    });
  });
});

// ─── Uji 3: "Lanjutkan pembayaran" pada baris Pending ────────────────────────

describe("Akun — lanjutkan pembayaran", () => {
  beforeEach(() => {
    mockUseMyRegistrations.mockReturnValue({
      data: [ROW_PENDING],
      isLoading: false,
      isError: false,
    });
  });

  it('baris Pending menampilkan link "Lanjutkan pembayaran"', () => {
    renderPage();
    const link = screen.getByRole("link", { name: /lanjutkan pembayaran/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/checkout/webinar-python-dasar");
  });
});

// ─── Uji 4: Empty state ───────────────────────────────────────────────────────

describe("Akun — empty state", () => {
  beforeEach(() => {
    mockUseMyRegistrations.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });
  });

  it('menampilkan "Belum ada registrasi" saat data kosong', () => {
    renderPage();
    expect(screen.getByText(/belum ada registrasi/i)).toBeInTheDocument();
  });

  it("menampilkan link ke /events di empty state", () => {
    renderPage();
    const link = screen.getByRole("link", { name: /ikut event/i });
    expect(link).toHaveAttribute("href", "/events");
  });
});
