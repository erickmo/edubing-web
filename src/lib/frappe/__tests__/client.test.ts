import { describe, it, expect, beforeEach, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../../../test/msw-server";
import {
  frappeCall,
  FrappeError,
  setCsrfToken,
  getCsrfToken,
} from "../client";

const BASE = "";

describe("frappeCall", () => {
  beforeEach(() => {
    setCsrfToken(null);
  });

  it("unwraps .message on success", async () => {
    server.use(
      http.post(`${BASE}/api/method/test.method`, () =>
        HttpResponse.json({ message: { id: 1, name: "data" } }),
      ),
    );

    const result = await frappeCall<{ id: number; name: string }>(
      "test.method",
    );

    expect(result).toEqual({ id: 1, name: "data" });
  });

  it("throws FrappeError with parsed _server_messages on 417", async () => {
    const serverMessages = JSON.stringify([
      JSON.stringify({ message: "Akun terkunci.", title: "Error" }),
    ]);
    server.use(
      http.post(`${BASE}/api/method/test.locked`, () =>
        HttpResponse.json({ _server_messages: serverMessages }, { status: 417 }),
      ),
    );

    await expect(frappeCall("test.locked")).rejects.toSatisfy(
      (e: unknown) =>
        e instanceof FrappeError &&
        e.status === 417 &&
        e.message === "Akun terkunci.",
    );
  });

  it("throws FrappeError with fallback message when _server_messages absent", async () => {
    server.use(
      http.post(`${BASE}/api/method/test.servererr`, () =>
        HttpResponse.json({ exc: "Traceback..." }, { status: 500 }),
      ),
    );

    await expect(frappeCall("test.servererr")).rejects.toSatisfy(
      (e: unknown) =>
        e instanceof FrappeError &&
        e.status === 500 &&
        e.message === "Terjadi kesalahan. Coba lagi.",
    );
  });

  it("sends X-Frappe-CSRF-Token header when token is set", async () => {
    let capturedToken: string | null = null;

    server.use(
      http.post(`${BASE}/api/method/test.csrf`, ({ request }) => {
        capturedToken = request.headers.get("x-frappe-csrf-token");
        return HttpResponse.json({ message: "ok" });
      }),
    );

    setCsrfToken("test-csrf-abc");
    await frappeCall("test.csrf");

    expect(capturedToken).toBe("test-csrf-abc");
  });

  it("omits X-Frappe-CSRF-Token header when token is null", async () => {
    let capturedToken: string | null = "present";

    server.use(
      http.post(`${BASE}/api/method/test.nocsrf`, ({ request }) => {
        capturedToken = request.headers.get("x-frappe-csrf-token");
        return HttpResponse.json({ message: "ok" });
      }),
    );

    setCsrfToken(null);
    await frappeCall("test.nocsrf");

    expect(capturedToken).toBeNull();
  });

  it("omits X-Frappe-CSRF-Token header on GET even when token is set", async () => {
    let capturedToken: string | null = "present";

    server.use(
      http.get(`${BASE}/api/method/test.getnocsrf`, ({ request }) => {
        capturedToken = request.headers.get("x-frappe-csrf-token");
        return HttpResponse.json({ message: "ok" });
      }),
    );

    setCsrfToken("test-csrf-abc");
    await frappeCall("test.getnocsrf", {}, { method: "GET" });

    expect(capturedToken).toBeNull();
  });

  it("always sends credentials: include (fetch spy)", async () => {
    server.use(
      http.post(`${BASE}/api/method/test.creds`, () =>
        HttpResponse.json({ message: "ok" }),
      ),
    );

    const fetchSpy = vi.spyOn(globalThis, "fetch");
    await frappeCall("test.creds");

    const [, options] = fetchSpy.mock.calls[0];
    expect((options as RequestInit).credentials).toBe("include");
    fetchSpy.mockRestore();
  });

  it("setCsrfToken and getCsrfToken round-trip", () => {
    setCsrfToken("my-token");
    expect(getCsrfToken()).toBe("my-token");

    setCsrfToken(null);
    expect(getCsrfToken()).toBeNull();
  });

  it("uses GET method when opts.method is GET", async () => {
    let capturedMethod = "";

    server.use(
      http.get(`${BASE}/api/method/test.getmethod`, ({ request }) => {
        capturedMethod = request.method;
        return HttpResponse.json({ message: "pong" });
      }),
    );

    const result = await frappeCall("test.getmethod", {}, { method: "GET" });
    expect(result).toBe("pong");
    expect(capturedMethod).toBe("GET");
  });
});
