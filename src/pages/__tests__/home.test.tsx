/**
 * Home page tests.
 *
 * Mocks the events API module so FeaturedEvents renders deterministic data
 * without network. Asserts the static marketing content (hero headline,
 * AppDownload CTA), a loaded event title, and that FAQPage JSON-LD is
 * present in the rendered body (inline structured data, matching FAQ_ITEMS).
 */
import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi } from "vitest";

// vite-react-ssg's <Head> wraps react-helmet-async, whose Dispatcher needs a
// HelmetProvider context that only exists at runtime (not in jsdom unit
// tests). Stub <Head> so <Seo>'s head tags render inertly without crashing.
// The FAQPage assertion targets the INLINE body JSON-LD (from Faq.tsx), not
// the head, so SEO coverage is unaffected.
vi.mock("vite-react-ssg", async (importOriginal) => {
  const actual = await importOriginal<typeof import("vite-react-ssg")>();
  return {
    ...actual,
    Head: ({ children }: { children?: ReactNode }) => <>{children}</>,
  };
});
import type { PublicEvent } from "../../lib/api/events";
import { HERO_HEADLINE_LEAD } from "../../components/home/content";

/** Two fake events returned by the mocked useEvents hook. */
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
    capacity: 0,
    remaining_seats: null, // unlimited capacity
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

// Mock the events API module: useEvents returns the fake events as loaded.
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
  };
});

import Home from "../Home";

/** Render Home inside the providers it depends on. */
function renderHome() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/"]}>
        <Home />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("Home page", () => {
  it("renders the static hero headline", () => {
    renderHome();
    expect(
      screen.getByText(new RegExp(HERO_HEADLINE_LEAD, "i")),
    ).toBeInTheDocument();
  });

  it("renders at least one featured event title", () => {
    renderHome();
    expect(screen.getByText("Webinar Python Dasar")).toBeInTheDocument();
  });

  it("renders FAQPage JSON-LD structured data in the body", () => {
    const { container } = renderHome();
    const scripts = container.querySelectorAll(
      'script[type="application/ld+json"]',
    );
    const combined = Array.from(scripts)
      .map((s) => s.textContent ?? "")
      .join(" ");
    expect(combined).toContain("FAQPage");
  });

  it("renders the PWA install CTA 'Pasang Aplikasi Web'", () => {
    renderHome();
    expect(screen.getByText(/Pasang Aplikasi Web/i)).toBeInTheDocument();
  });

  it("unlimited-capacity event shows 'Kuota tersedia', not 'Kursi penuh'", () => {
    renderHome();
    // MOCK_EVENTS[0] has remaining_seats: null → must show "Kuota tersedia"
    expect(screen.getByText(/Kuota tersedia/i)).toBeInTheDocument();
    // Must NOT show "Kursi penuh" for any event in the current mock set
    expect(screen.queryByText(/Kursi penuh/i)).not.toBeInTheDocument();
  });
});
