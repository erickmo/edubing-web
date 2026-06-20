/**
 * Unit tests untuk funnelReducer (mesin state checkout).
 *
 * Strategi TDD: tulis semua uji transisi SEBELUM implementasi reducer
 * sehingga uji gagal dulu, lalu implementasi membuat semuanya lulus.
 *
 * Setiap uji bersifat deterministik — tidak ada efek samping.
 */
import { describe, it, expect } from "vitest";
import { funnelReducer } from "../registration";
import type { FunnelState, FunnelEvent } from "../registration";

// ─── State awal ─────────────────────────────────────────────────────────────

const IDLE: FunnelState = { phase: "idle" };
const REGISTERING: FunnelState = { phase: "registering" };
const PAYING: FunnelState = { phase: "paying", registration: "REG-001" };
const POLLING: FunnelState = { phase: "polling", registration: "REG-001" };
const SUCCESS: FunnelState = { phase: "success" };
const FAILED: FunnelState = { phase: "failed", message: "Gagal" };

// ─── Transisi yang didefinisikan ────────────────────────────────────────────

describe("funnelReducer — transisi yang didefinisikan", () => {
  it("idle + REGISTER_START → registering", () => {
    const ev: FunnelEvent = { type: "REGISTER_START" };
    expect(funnelReducer(IDLE, ev)).toEqual({ phase: "registering" });
  });

  it("registering + REGISTERED_FREE → success", () => {
    const ev: FunnelEvent = { type: "REGISTERED_FREE" };
    expect(funnelReducer(REGISTERING, ev)).toEqual({ phase: "success" });
  });

  it("registering + PAY_START → paying", () => {
    const ev: FunnelEvent = { type: "PAY_START", registration: "REG-001" };
    const result = funnelReducer(REGISTERING, ev);
    expect(result).toEqual({ phase: "paying", registration: "REG-001" });
  });

  it("paying + POLL_START → polling", () => {
    const ev: FunnelEvent = { type: "POLL_START", registration: "REG-001" };
    const result = funnelReducer(PAYING, ev);
    expect(result).toEqual({ phase: "polling", registration: "REG-001" });
  });

  it("polling + SETTLED → success", () => {
    const ev: FunnelEvent = { type: "SETTLED" };
    expect(funnelReducer(POLLING, ev)).toEqual({ phase: "success" });
  });

  it("failed + RESET → idle", () => {
    const ev: FunnelEvent = { type: "RESET" };
    expect(funnelReducer(FAILED, ev)).toEqual({ phase: "idle" });
  });

  it("success + RESET → idle", () => {
    const ev: FunnelEvent = { type: "RESET" };
    expect(funnelReducer(SUCCESS, ev)).toEqual({ phase: "idle" });
  });
});

// ─── FAIL dari fase mana saja → failed ──────────────────────────────────────

describe("funnelReducer — FAIL dari semua fase", () => {
  const failMsg = "Terjadi kesalahan";
  const failEv: FunnelEvent = { type: "FAIL", message: failMsg };
  const expectedFailed: FunnelState = { phase: "failed", message: failMsg };

  it("idle + FAIL → failed", () => {
    expect(funnelReducer(IDLE, failEv)).toEqual(expectedFailed);
  });

  it("registering + FAIL → failed", () => {
    expect(funnelReducer(REGISTERING, failEv)).toEqual(expectedFailed);
  });

  it("paying + FAIL → failed", () => {
    expect(funnelReducer(PAYING, failEv)).toEqual(expectedFailed);
  });

  it("polling + FAIL → failed", () => {
    expect(funnelReducer(POLLING, failEv)).toEqual(expectedFailed);
  });

  it("success + FAIL → failed", () => {
    expect(funnelReducer(SUCCESS, failEv)).toEqual(expectedFailed);
  });

  it("failed + FAIL → failed (pesan baru)", () => {
    const newFail: FunnelEvent = { type: "FAIL", message: "Pesan baru" };
    expect(funnelReducer(FAILED, newFail)).toEqual({
      phase: "failed",
      message: "Pesan baru",
    });
  });
});

// ─── Event tidak dikenal → state tidak berubah ───────────────────────────────

describe("funnelReducer — event tidak relevan tidak mengubah state", () => {
  it("idle + SETTLED → idle (tidak ada transisi)", () => {
    const ev: FunnelEvent = { type: "SETTLED" };
    expect(funnelReducer(IDLE, ev)).toEqual(IDLE);
  });

  it("idle + REGISTERED_FREE (sebelum REGISTER_START) → idle", () => {
    const ev: FunnelEvent = { type: "REGISTERED_FREE" };
    expect(funnelReducer(IDLE, ev)).toEqual(IDLE);
  });

  it("polling + REGISTER_START → polling (tidak berpengaruh)", () => {
    const ev: FunnelEvent = { type: "REGISTER_START" };
    expect(funnelReducer(POLLING, ev)).toEqual(POLLING);
  });

  it("success + SETTLED → success (tidak berpengaruh)", () => {
    const ev: FunnelEvent = { type: "SETTLED" };
    expect(funnelReducer(SUCCESS, ev)).toEqual(SUCCESS);
  });
});

// ─── PAY_START meneruskan registration_id ────────────────────────────────────

describe("funnelReducer — integritas data registration", () => {
  it("PAY_START meneruskan registration ke state paying", () => {
    const ev: FunnelEvent = { type: "PAY_START", registration: "REG-XYZ-999" };
    const result = funnelReducer(REGISTERING, ev);
    if (result.phase === "paying") {
      expect(result.registration).toBe("REG-XYZ-999");
    } else {
      throw new Error("Expected phase paying");
    }
  });

  it("POLL_START meneruskan registration ke state polling", () => {
    const ev: FunnelEvent = { type: "POLL_START", registration: "REG-XYZ-999" };
    const result = funnelReducer(PAYING, ev);
    if (result.phase === "polling") {
      expect(result.registration).toBe("REG-XYZ-999");
    } else {
      throw new Error("Expected phase polling");
    }
  });
});
