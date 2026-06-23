/**
 * Uji halaman Akun — registrasi saya, status pembayaran, batalkan,
 * check-in mandiri, dan feedback event.
 *
 * Cakupan:
 *  1. Menampilkan 2 baris registrasi (Registered + Pending) dengan badge status.
 *  2. Klik "Batalkan" pada baris Registered → mutasi cancel dipanggil dengan id.
 *  3. Baris Pending menampilkan "Lanjutkan pembayaran" menuju /checkout/<route>.
 *  4. Empty state → "Belum ada registrasi".
 *  5. Registered + window terbuka → tombol "Check-in" memanggil checkin mutate.
 *  6. Attended + !has_feedback → "Beri Feedback" membuka FeedbackForm; submit memanggil submitFeedback.
 *  7. Attended + has_feedback → "Feedback terkirim ✓" tanpa form.
 *  8. Registered + window belum terbuka → tidak ada tombol Check-in.
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
const mockUseCheckin = vi.fn();
const mockCheckinMutate = vi.fn();
const mockUseSubmitFeedback = vi.fn();
const mockSubmitFeedbackMutate = vi.fn();

vi.mock("../../lib/api/account", async () => {
  return {
    useMyRegistrations: (...args: unknown[]) => mockUseMyRegistrations(...args),
    useDashboard: (...args: unknown[]) => mockUseDashboard(...args),
    useCancelRegistration: (...args: unknown[]) =>
      mockUseCancelRegistration(...args),
    useCheckin: (...args: unknown[]) => mockUseCheckin(...args),
    useSubmitFeedback: (...args: unknown[]) => mockUseSubmitFeedback(...args),
    // re-export is_checkin_open so RegistrationCard can import it
    is_checkin_open: (start: string | null, end: string | null, now: Date) => {
      if (start === null) return true;
      const s = new Date(start).getTime();
      const e = end ? new Date(end).getTime() : s + 6 * 3600 * 1000;
      const n = now.getTime();
      return n >= s && n <= e;
    },
  };
});

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const ROW_REGISTERED: RegistrationRow = {
  registration: "REG-001",
  event: "EV-001",
  event_title: "Workshop React Advanced",
  event_route: "workshop-react-advanced",
  start_date: "2025-09-01T09:00:00",
  end_date: "2025-09-01T17:00:00",
  event_type: "workshop",
  price: 300_000,
  status: "Registered",
  order_status: "Paid",
  registration_date: "2025-08-01T10:00:00",
  has_feedback: false,
};

const ROW_PENDING: RegistrationRow = {
  registration: "REG-002",
  event: "EV-002",
  event_title: "Webinar Python Dasar",
  event_route: "webinar-python-dasar",
  start_date: "2025-10-01T09:00:00",
  end_date: "2025-10-01T17:00:00",
  event_type: "online",
  price: 150_000,
  status: "Pending",
  order_status: "Pending",
  registration_date: "2025-08-05T11:00:00",
  has_feedback: false,
};

const ROW_ATTENDED: RegistrationRow = {
  registration: "REG-003",
  event: "EV-003",
  event_title: "Seminar Data Science",
  event_route: "seminar-data-science",
  start_date: "2025-07-01T09:00:00",
  end_date: "2025-07-01T17:00:00",
  event_type: "offline",
  price: 200_000,
  status: "Attended",
  order_status: "Paid",
  registration_date: "2025-06-01T10:00:00",
  has_feedback: false,
};

/** Attended + sudah memberi feedback */
const ROW_ATTENDED_FEEDBACK: RegistrationRow = {
  ...ROW_ATTENDED,
  registration: "REG-005",
  has_feedback: true,
};

const ROW_CANCELLED: RegistrationRow = {
  registration: "REG-004",
  event: "EV-004",
  event_title: "Workshop Node.js",
  event_route: "workshop-nodejs",
  start_date: "2025-06-15T09:00:00",
  end_date: "2025-06-15T17:00:00",
  event_type: "workshop",
  price: 100_000,
  status: "Cancelled",
  order_status: "Failed",
  registration_date: "2025-05-01T10:00:00",
  has_feedback: false,
};

/**
 * Registered dengan window check-in TERBUKA — start di masa lalu, end di masa depan
 * relatif terhadap waktu uji. Kita gunakan null start agar is_checkin_open selalu true.
 */
const ROW_REGISTERED_OPEN: RegistrationRow = {
  ...ROW_REGISTERED,
  registration: "REG-006",
  event_title: "Workshop Check-in Terbuka",
  start_date: null as unknown as string,
  end_date: null,
};

/** Registered dengan window check-in di MASA DEPAN — belum terbuka */
const ROW_REGISTERED_FUTURE: RegistrationRow = {
  ...ROW_REGISTERED,
  registration: "REG-007",
  event_title: "Workshop Masa Depan",
  start_date: "2099-01-01T09:00:00",
  end_date: "2099-01-01T17:00:00",
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

  mockUseCheckin.mockReturnValue({
    mutate: mockCheckinMutate,
    isPending: false,
    error: null,
  });

  mockUseSubmitFeedback.mockReturnValue({
    mutate: mockSubmitFeedbackMutate,
    isPending: false,
    error: null,
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

// ─── Uji 5: Badge Attended + tombol Batalkan TIDAK ada ───────────────────────

describe("Akun — status Attended", () => {
  beforeEach(() => {
    mockUseMyRegistrations.mockReturnValue({
      data: [ROW_ATTENDED],
      isLoading: false,
      isError: false,
    });
  });

  it('menampilkan badge "Hadir" untuk status Attended', () => {
    renderPage();
    expect(screen.getByText("Hadir")).toBeInTheDocument();
  });

  it("tombol Batalkan tidak muncul untuk status Attended", () => {
    renderPage();
    expect(screen.queryByRole("button", { name: /batalkan/i })).toBeNull();
  });
});

// ─── Uji 6: Badge Cancelled + tombol Batalkan TIDAK ada ─────────────────────

describe("Akun — status Cancelled", () => {
  beforeEach(() => {
    mockUseMyRegistrations.mockReturnValue({
      data: [ROW_CANCELLED],
      isLoading: false,
      isError: false,
    });
  });

  it('menampilkan badge "Dibatalkan" untuk status Cancelled', () => {
    renderPage();
    expect(screen.getByText("Dibatalkan")).toBeInTheDocument();
  });

  it("tombol Batalkan tidak muncul untuk status Cancelled", () => {
    renderPage();
    expect(screen.queryByRole("button", { name: /batalkan/i })).toBeNull();
  });
});

// ─── Uji 7: Check-in — window terbuka ────────────────────────────────────────

describe("Akun — check-in window terbuka", () => {
  beforeEach(() => {
    mockUseMyRegistrations.mockReturnValue({
      data: [ROW_REGISTERED_OPEN],
      isLoading: false,
      isError: false,
    });
  });

  it('menampilkan tombol "Check-in" untuk Registered + window terbuka', () => {
    renderPage();
    expect(
      screen.getByRole("button", { name: /check-in/i }),
    ).toBeInTheDocument();
  });

  it('klik "Check-in" memanggil checkinMutate dengan registration id', async () => {
    renderPage();
    const btn = screen.getByRole("button", { name: /check-in/i });
    fireEvent.click(btn);
    await waitFor(() => {
      expect(mockCheckinMutate).toHaveBeenCalledWith("REG-006");
    });
  });
});

// ─── Uji 8: Check-in — window belum terbuka ──────────────────────────────────

describe("Akun — check-in window belum terbuka", () => {
  beforeEach(() => {
    mockUseMyRegistrations.mockReturnValue({
      data: [ROW_REGISTERED_FUTURE],
      isLoading: false,
      isError: false,
    });
  });

  it('TIDAK menampilkan tombol "Check-in" untuk window masa depan', () => {
    renderPage();
    expect(screen.queryByRole("button", { name: /check-in/i })).toBeNull();
  });
});

// ─── Uji 9: Attended + !has_feedback → Beri Feedback ────────────────────────

describe("Akun — feedback belum dikirim", () => {
  beforeEach(() => {
    mockUseMyRegistrations.mockReturnValue({
      data: [ROW_ATTENDED],
      isLoading: false,
      isError: false,
    });
  });

  it('menampilkan tombol "Beri Feedback" untuk Attended + !has_feedback', () => {
    renderPage();
    expect(
      screen.getByRole("button", { name: /beri feedback/i }),
    ).toBeInTheDocument();
  });

  it("klik Beri Feedback membuka form rating", async () => {
    renderPage();
    const btn = screen.getByRole("button", { name: /beri feedback/i });
    fireEvent.click(btn);
    await waitFor(() => {
      // Form harus tampil dengan minimal satu tombol bintang
      expect(
        screen.getByRole("button", { name: /beri 1 bintang/i }),
      ).toBeInTheDocument();
    });
  });

  it("memilih rating lalu submit memanggil submitFeedbackMutate", async () => {
    renderPage();
    // Buka form
    fireEvent.click(screen.getByRole("button", { name: /beri feedback/i }));

    // Pilih bintang 4
    await waitFor(() =>
      screen.getByRole("button", { name: /beri 4 bintang/i }),
    );
    fireEvent.click(screen.getByRole("button", { name: /beri 4 bintang/i }));

    // Submit form
    fireEvent.click(screen.getByRole("button", { name: /kirim feedback/i }));

    await waitFor(() => {
      expect(mockSubmitFeedbackMutate).toHaveBeenCalledWith(
        expect.objectContaining({ registration: "REG-003", rating: 4 }),
        expect.anything(),
      );
    });
  });
});

// ─── Uji 10: Attended + has_feedback → Feedback terkirim ─────────────────────

describe("Akun — feedback sudah dikirim", () => {
  beforeEach(() => {
    mockUseMyRegistrations.mockReturnValue({
      data: [ROW_ATTENDED_FEEDBACK],
      isLoading: false,
      isError: false,
    });
  });

  it('menampilkan "Feedback terkirim" untuk Attended + has_feedback', () => {
    renderPage();
    expect(screen.getByText(/feedback terkirim/i)).toBeInTheDocument();
  });

  it("tidak menampilkan tombol Beri Feedback jika sudah punya feedback", () => {
    renderPage();
    expect(
      screen.queryByRole("button", { name: /beri feedback/i }),
    ).toBeNull();
  });

  it("tidak menampilkan form feedback jika sudah punya feedback", () => {
    renderPage();
    expect(
      screen.queryByRole("button", { name: /beri 1 bintang/i }),
    ).toBeNull();
  });
});
