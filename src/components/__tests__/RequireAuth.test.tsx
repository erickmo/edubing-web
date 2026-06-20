/**
 * Tests for RequireAuth guard component.
 * Uses MemoryRouter to simulate navigation in tests.
 */
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { describe, it, expect, beforeEach } from "vitest";
import { RequireAuth } from "../RequireAuth";
import { useSession } from "../../store/session";

/** Helper: renders RequireAuth at a known path with a /masuk catch route. */
function renderWithRouter(initialPath: string) {
  /** Catch component to display the current location (including search string). */
  function MasukPage() {
    const loc = useLocation();
    return <div data-testid="masuk-page">{loc.pathname + loc.search}</div>;
  }

  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route
          path="*"
          element={
            <RequireAuth>
              <div data-testid="protected-content">Konten Terproteksi</div>
            </RequireAuth>
          }
        />
        <Route path="/masuk" element={<MasukPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("RequireAuth", () => {
  // Reset zustand store state before each test
  beforeEach(() => {
    useSession.setState({ status: "loading", user: null, student: null, csrf_token: null });
  });

  it('status "authed" → renders children', () => {
    useSession.setState({ status: "authed" });
    renderWithRouter("/akun");
    expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    expect(screen.queryByTestId("masuk-page")).not.toBeInTheDocument();
  });

  it('status "guest" → does NOT render children; navigates to /masuk with redirect query', () => {
    useSession.setState({ status: "guest" });
    renderWithRouter("/akun");
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
    const masukPage = screen.getByTestId("masuk-page");
    expect(masukPage).toBeInTheDocument();
    // Should contain encoded redirect to /akun
    expect(masukPage.textContent).toContain("/masuk");
    expect(masukPage.textContent).toContain("redirect");
    expect(masukPage.textContent).toContain(encodeURIComponent("/akun"));
  });

  it('status "loading" → renders loading fallback, not children', () => {
    useSession.setState({ status: "loading" });
    renderWithRouter("/akun");
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
    expect(screen.queryByTestId("masuk-page")).not.toBeInTheDocument();
    expect(screen.getByText("Memuat…")).toBeInTheDocument();
  });
});
