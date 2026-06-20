import { describe, it, expect, beforeEach } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../../../test/msw-server";
import { login, register, logout, getLoggedUser, getCsrf } from "../auth";
import { setCsrfToken, getCsrfToken } from "../client";

const BASE = "";

const CSRF_ENDPOINT = "vernon_edubing.eb_student.api.auth.get_csrf";
const LOGIN_ENDPOINT = "login";
const REGISTER_ENDPOINT = "vernon_edubing.eb_student.api.auth.register";
const LOGGED_USER_ENDPOINT = "frappe.auth.get_logged_user";
const LOGOUT_ENDPOINT = "logout";

describe("auth", () => {
  beforeEach(() => {
    setCsrfToken(null);
  });

  describe("login", () => {
    it("posts usr/pwd then fetches csrf and sets it via getCsrfToken()", async () => {
      server.use(
        http.post(`${BASE}/api/method/${LOGIN_ENDPOINT}`, async ({ request }) => {
          const body = await request.json() as { usr: string; pwd: string };
          if (body.usr === "user@test.com" && body.pwd === "secret") {
            return HttpResponse.json({
              message: "Logged In",
              full_name: "Test User",
              home_page: "/",
            });
          }
          return HttpResponse.json({ message: "Invalid" }, { status: 401 });
        }),
        http.post(`${BASE}/api/method/${CSRF_ENDPOINT}`, () =>
          HttpResponse.json({ message: { csrf_token: "csrf-from-login-123" } }),
        ),
      );

      await login("user@test.com", "secret");

      expect(getCsrfToken()).toBe("csrf-from-login-123");
    });

    it("throws FrappeError on login failure", async () => {
      server.use(
        http.post(`${BASE}/api/method/${LOGIN_ENDPOINT}`, () =>
          HttpResponse.json({ message: "Incorrect password" }, { status: 401 }),
        ),
      );

      await expect(login("bad@test.com", "wrong")).rejects.toThrow();
    });
  });

  describe("register", () => {
    it("returns { student, csrf_token } on success", async () => {
      server.use(
        http.post(`${BASE}/api/method/${REGISTER_ENDPOINT}`, () =>
          HttpResponse.json({
            message: {
              student: "STU-00001",
              csrf_token: "reg-csrf-xyz",
            },
          }),
        ),
      );

      const result = await register({
        email: "new@user.com",
        password: "pass123",
        full_name: "New User",
        phone: "0812345678",
        captcha_token: "captcha-token-abc",
      });

      expect(result).toEqual({
        student: "STU-00001",
        csrf_token: "reg-csrf-xyz",
      });
    });
  });

  describe("getLoggedUser", () => {
    it("returns the logged-in user email", async () => {
      server.use(
        http.get(`${BASE}/api/method/${LOGGED_USER_ENDPOINT}`, () =>
          HttpResponse.json({ message: "user@example.com" }),
        ),
      );

      const user = await getLoggedUser();
      expect(user).toBe("user@example.com");
    });

    it("returns Guest when not logged in", async () => {
      server.use(
        http.get(`${BASE}/api/method/${LOGGED_USER_ENDPOINT}`, () =>
          HttpResponse.json({ message: "Guest" }),
        ),
      );

      const user = await getLoggedUser();
      expect(user).toBe("Guest");
    });
  });

  describe("getCsrf", () => {
    it("returns the csrf_token from the endpoint", async () => {
      server.use(
        http.post(`${BASE}/api/method/${CSRF_ENDPOINT}`, () =>
          HttpResponse.json({ message: { csrf_token: "standalone-csrf" } }),
        ),
      );

      const token = await getCsrf();
      expect(token).toBe("standalone-csrf");
    });
  });

  describe("logout", () => {
    it("calls logout endpoint and clears csrf token", async () => {
      setCsrfToken("existing-csrf");
      server.use(
        http.post(`${BASE}/api/method/${LOGOUT_ENDPOINT}`, () =>
          HttpResponse.json({ message: "Logged Out" }),
        ),
      );

      await logout();

      expect(getCsrfToken()).toBeNull();
    });
  });
});
