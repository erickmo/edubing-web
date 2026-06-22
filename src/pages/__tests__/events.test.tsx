/**
 * Events page tests.
 *
 * Tests cover:
 *  1. EventsList renders N event cards from mocked events
 *  2. Filter chip "Online" narrows results
 *  3. EventDetail renders event title + price
 *  4. EventDetail emits "@type":"Event" JSON-LD in a script tag
 *  5. "Daftar Event Ini" links to /checkout/<slug>
 *  6. EventDetail full-seats: remaining_seats === 0 → CTA disabled + "Kursi penuh"
 *  7. EventDetail rich sections: description_rich, what_you_get, sessions,
 *     requirements, kompetisi info, organizer, quick-facts, share, related.
 */

import type { ReactNode } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi } from "vitest";

// Stub vite-react-ssg's <Head> (needs HelmetProvider context that doesn't
// exist in jsdom). JSON-LD assertions target inline body scripts, not head.
vi.mock("vite-react-ssg", async (importOriginal) => {
  const actual = await importOriginal<typeof import("vite-react-ssg")>();
  return {
    ...actual,
    Head: ({ children }: { children?: ReactNode }) => <>{children}</>,
  };
});

import type { PublicEvent } from "../../lib/api/events";

/** Fake events used by both Events and EventDetail tests. */
const MOCK_EVENTS: PublicEvent[] = [
  {
    name: "EV-0001",
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
    short_description: "Belajar Python dari nol bareng mentor.",
  },
  {
    name: "EV-0002",
    route: "workshop-desain-ui",
    title: "Workshop Desain UI",
    event_type: "workshop",
    start_date: "2025-09-10T08:00:00",
    end_date: "2025-09-10T17:00:00",
    location: "Jakarta",
    price: 250000,
    capacity: 30,
    remaining_seats: 5,
    featured_image: "",
    short_description: "Workshop intensif desain antarmuka.",
  },
];

/** Full-seats variant of the first event. */
const FULL_EVENT: PublicEvent = {
  ...MOCK_EVENTS[0],
  remaining_seats: 0,
};

/** Unlimited-capacity variant (remaining_seats === null). */
const UNLIMITED_EVENT: PublicEvent = {
  ...MOCK_EVENTS[0],
  remaining_seats: null,
};

/**
 * Rich detail variant — populated with every optional detail-only field so
 * EventDetail's conditional sections all render. Mirrors the real
 * get_event payload shape (newline-joined lists, sessions array, HTML body).
 */
const RICH_EVENT: PublicEvent = {
  ...MOCK_EVENTS[0],
  event_type: "kompetisi",
  category_info: "Lomba tingkat nasional untuk pelajar SMA/SMK.",
  description_rich:
    "<p>Deskripsi <strong>lengkap</strong> kompetisi dengan format kaya.</p>",
  what_you_get: "Sertifikat resmi\nMateri eksklusif\nAkses komunitas",
  requirements: "Laptop sendiri\nKoneksi internet stabil",
  organizer: "Tim Edubing",
  sessions: [
    {
      session_title: "Babak Penyisihan",
      session_date: "2025-08-01T09:00:00",
      meeting_link: null,
      location: "Online",
    },
    {
      session_title: "Babak Final",
      session_date: "2025-08-15T09:00:00",
      meeting_link: null,
      location: "Jakarta",
    },
  ],
};

// Mock the API module so tests never hit the network.
// useEvent is wrapped in vi.fn() so individual tests can call mockReturnValueOnce.
vi.mock("../../lib/api/events", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../lib/api/events")>();
  return {
    ...actual,
    useEvents: () => ({
      data: MOCK_EVENTS,
      isLoading: false,
      isError: false,
      error: null,
    }),
    useEvent: vi.fn((slug: string) => ({
      data: MOCK_EVENTS.find((e) => e.route === slug),
      isLoading: false,
      isError: false,
      error: null,
    })),
  };
});

// Stub react-router-dom hooks that need router context beyond MemoryRouter.
// useParams returns the detail slug; useLoaderData returns null (no SSG data
// in unit tests so components fall through to the React Query path).
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useLoaderData: () => null,
    useParams: () => ({ slug: "webinar-python-dasar" }),
  };
});

import Events from "../Events";
import EventDetail from "../EventDetail";

/** Shared render helper — wraps in QueryClient + MemoryRouter. */
function renderPage(ui: ReactNode, route = "/") {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );
}

// ─── Events list ────────────────────────────────────────────────────────────

describe("Events list page", () => {
  it("renders all mocked event cards", () => {
    renderPage(<Events />, "/events");
    expect(screen.getByText("Webinar Python Dasar")).toBeInTheDocument();
    expect(screen.getByText("Workshop Desain UI")).toBeInTheDocument();
  });

  it('filter chip "Online" narrows to only online events', () => {
    renderPage(<Events />, "/events");
    const onlineChip = screen.getByRole("button", { name: /online/i });
    fireEvent.click(onlineChip);
    expect(screen.getByText("Webinar Python Dasar")).toBeInTheDocument();
    expect(screen.queryByText("Workshop Desain UI")).not.toBeInTheDocument();
  });
});

// ─── EventDetail ─────────────────────────────────────────────────────────────

describe("EventDetail page", () => {
  it("renders event title and price", () => {
    renderPage(<EventDetail />, "/events/webinar-python-dasar");
    expect(screen.getAllByText(/Webinar Python Dasar/i).length).toBeGreaterThan(0);
    // Price 0 → "Gratis"
    expect(screen.getAllByText(/gratis/i).length).toBeGreaterThan(0);
  });

  it('emits "@type":"Event" JSON-LD in a script tag', () => {
    const { container } = renderPage(
      <EventDetail />,
      "/events/webinar-python-dasar",
    );
    const scripts = container.querySelectorAll('script[type="application/ld+json"]');
    const combined = Array.from(scripts)
      .map((s) => s.textContent ?? "")
      .join(" ");
    expect(combined).toContain('"@type":"Event"');
  });

  it('"Daftar Event Ini" links to /checkout/<slug>', () => {
    renderPage(<EventDetail />, "/events/webinar-python-dasar");
    const link = screen.getByRole("link", { name: /daftar event ini/i });
    expect(link).toHaveAttribute("href", "/checkout/webinar-python-dasar");
  });

  it("full seats: CTA disabled + shows Kursi penuh", async () => {
    // Override useEvent for this one test so remaining_seats === 0.
    const eventsModule = await import("../../lib/api/events");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(eventsModule.useEvent).mockReturnValueOnce({
      data: FULL_EVENT,
      isLoading: false,
      isError: false,
      error: null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    renderPage(<EventDetail />, "/events/webinar-python-dasar");
    const btn = screen.getByRole("button", { name: /kursi penuh/i });
    expect(btn).toBeDisabled();
  });

  it("unlimited seats (null): CTA enabled + shows 'Daftar Event Ini'", async () => {
    // Override useEvent so remaining_seats === null (unlimited capacity).
    const eventsModule = await import("../../lib/api/events");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(eventsModule.useEvent).mockReturnValueOnce({
      data: UNLIMITED_EVENT,
      isLoading: false,
      isError: false,
      error: null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    renderPage(<EventDetail />, "/events/webinar-python-dasar");
    // Register link must be present (not replaced by disabled button).
    expect(
      screen.getByRole("link", { name: /daftar event ini/i }),
    ).toBeInTheDocument();
    // No "Kursi penuh" button should exist.
    expect(
      screen.queryByRole("button", { name: /kursi penuh/i }),
    ).not.toBeInTheDocument();
  });
});

// ─── EventDetail rich sections ───────────────────────────────────────────────

/** Override useEvent to return the given event for one render. */
async function mockEventOnce(event: PublicEvent): Promise<void> {
  const eventsModule = await import("../../lib/api/events");
  vi.mocked(eventsModule.useEvent).mockReturnValueOnce({
    data: event,
    isLoading: false,
    isError: false,
    error: null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);
}

describe("EventDetail rich detail sections", () => {
  it("renders the rich description text", async () => {
    await mockEventOnce(RICH_EVENT);
    renderPage(<EventDetail />, "/events/webinar-python-dasar");
    expect(screen.getByText(/Deskripsi/i)).toBeInTheDocument();
    expect(screen.getByText(/lengkap/i)).toBeInTheDocument();
  });

  it("renders all what_you_get items as a list", async () => {
    await mockEventOnce(RICH_EVENT);
    renderPage(<EventDetail />, "/events/webinar-python-dasar");
    expect(screen.getByText("Sertifikat resmi")).toBeInTheDocument();
    expect(screen.getByText("Materi eksklusif")).toBeInTheDocument();
    expect(screen.getByText("Akses komunitas")).toBeInTheDocument();
    // Heading present.
    expect(screen.getByText(/Apa yang Kamu Dapat/i)).toBeInTheDocument();
  });

  it("renders both session titles in the agenda", async () => {
    await mockEventOnce(RICH_EVENT);
    renderPage(<EventDetail />, "/events/webinar-python-dasar");
    expect(screen.getByText("Babak Penyisihan")).toBeInTheDocument();
    expect(screen.getByText("Babak Final")).toBeInTheDocument();
    expect(screen.getByText(/Jadwal & Agenda/i)).toBeInTheDocument();
  });

  it("renders requirements items", async () => {
    await mockEventOnce(RICH_EVENT);
    renderPage(<EventDetail />, "/events/webinar-python-dasar");
    expect(screen.getByText("Laptop sendiri")).toBeInTheDocument();
    expect(screen.getByText("Koneksi internet stabil")).toBeInTheDocument();
    expect(screen.getByText(/Persyaratan/i)).toBeInTheDocument();
  });

  it("renders kompetisi info and organizer", async () => {
    await mockEventOnce(RICH_EVENT);
    renderPage(<EventDetail />, "/events/webinar-python-dasar");
    // category_info appears in both the "Informasi Kompetisi" section and the
    // quick-facts "Kategori" row — both are intended for a kompetisi event.
    expect(
      screen.getAllByText(/Lomba tingkat nasional/i).length,
    ).toBeGreaterThan(0);
    expect(screen.getByText(/Penyelenggara/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Tim Edubing/i).length).toBeGreaterThan(0);
  });

  it("renders quick-facts with the event type", async () => {
    await mockEventOnce(RICH_EVENT);
    renderPage(<EventDetail />, "/events/webinar-python-dasar");
    // Quick-facts heading + the kompetisi type label appears.
    expect(screen.getByText(/Fakta Singkat/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Kompetisi/i).length).toBeGreaterThan(0);
  });

  it("renders share controls (Bagikan + Salin tautan)", async () => {
    await mockEventOnce(RICH_EVENT);
    renderPage(<EventDetail />, "/events/webinar-python-dasar");
    expect(screen.getByText(/Bagikan/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /salin tautan/i }),
    ).toBeInTheDocument();
  });

  it("omits optional sections when their data is absent", () => {
    // Default mock returns MOCK_EVENTS[0], which has no detail fields.
    renderPage(<EventDetail />, "/events/webinar-python-dasar");
    expect(screen.queryByText(/Apa yang Kamu Dapat/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Jadwal & Agenda/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Persyaratan/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Penyelenggara/i)).not.toBeInTheDocument();
  });
});

// ─── RelatedEvents ───────────────────────────────────────────────────────────

describe("EventDetail related events", () => {
  it('shows "Event Lainnya" with the other event when more exist', () => {
    // Default mock returns the current event (webinar-python-dasar);
    // useEvents returns both MOCK_EVENTS, so the OTHER one is related.
    renderPage(<EventDetail />, "/events/webinar-python-dasar");
    expect(screen.getByText(/Event Lainnya/i)).toBeInTheDocument();
    expect(screen.getByText("Workshop Desain UI")).toBeInTheDocument();
  });
});
