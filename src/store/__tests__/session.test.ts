import { describe, it, expect, beforeEach } from "vitest";
import { useSession } from "../session";
import { getCsrfToken, setCsrfToken } from "../../lib/frappe/client";

describe("useSession (zustand session store)", () => {
  beforeEach(() => {
    // Reset store to pristine state
    useSession.setState({
      user: null,
      student: null,
      status: "loading",
      csrf_token: null,
    });
    setCsrfToken(null);
    // Clear localStorage to avoid persistence bleed
    localStorage.clear();
  });

  it("set_session sets status authed, user, student, csrf_token", () => {
    useSession.getState().set_session("user@test.com", "STU-001", "csrf-token-abc");

    const state = useSession.getState();
    expect(state.status).toBe("authed");
    expect(state.user).toBe("user@test.com");
    expect(state.student).toBe("STU-001");
    expect(state.csrf_token).toBe("csrf-token-abc");
  });

  it("set_session calls setCsrfToken so getCsrfToken() reflects it", () => {
    useSession.getState().set_session("user@test.com", "STU-001", "csrf-from-session");

    expect(getCsrfToken()).toBe("csrf-from-session");
  });

  it("set_session with null student stores null", () => {
    useSession.getState().set_session("user@test.com", null, "csrf-123");

    expect(useSession.getState().student).toBeNull();
  });

  it("clear resets status to guest and nulls everything", () => {
    useSession.getState().set_session("user@test.com", "STU-001", "csrf-abc");
    useSession.getState().clear();

    const state = useSession.getState();
    expect(state.status).toBe("guest");
    expect(state.user).toBeNull();
    expect(state.student).toBeNull();
    expect(state.csrf_token).toBeNull();
  });

  it("clear calls setCsrfToken(null) so getCsrfToken() returns null", () => {
    useSession.getState().set_session("user@test.com", null, "csrf-xyz");
    useSession.getState().clear();

    expect(getCsrfToken()).toBeNull();
  });

  it("set_status updates status only", () => {
    useSession.getState().set_session("user@test.com", null, null);
    useSession.getState().set_status("loading");

    const state = useSession.getState();
    expect(state.status).toBe("loading");
    expect(state.user).toBe("user@test.com");
  });

  it("persists to localStorage under key edubing.session", () => {
    useSession.getState().set_session("persist@test.com", "STU-002", "persisted-csrf");

    const stored = localStorage.getItem("edubing.session");
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!);
    expect(parsed.state.user).toBe("persist@test.com");
  });
});
