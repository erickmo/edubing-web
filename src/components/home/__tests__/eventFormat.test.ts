/**
 * Unit tests for seat-availability helpers in eventFormat.ts.
 *
 * Backend contract:
 *   remaining_seats === null  → unlimited capacity; never sold out
 *   remaining_seats === 0     → genuinely full
 *   remaining_seats > 0       → N seats available
 */
import { describe, it, expect } from "vitest";
import { is_sold_out, is_seats_low, seats_label } from "../eventFormat";

// ─── is_sold_out ─────────────────────────────────────────────────────────────

describe("is_sold_out", () => {
  it("returns false for null (unlimited capacity)", () => {
    expect(is_sold_out(null)).toBe(false);
  });

  it("returns true for 0 (genuinely full)", () => {
    expect(is_sold_out(0)).toBe(true);
  });

  it("returns false for positive seat count", () => {
    expect(is_sold_out(1)).toBe(false);
    expect(is_sold_out(5)).toBe(false);
    expect(is_sold_out(100)).toBe(false);
  });
});

// ─── is_seats_low ────────────────────────────────────────────────────────────

describe("is_seats_low", () => {
  it("returns false for null (unlimited — never low)", () => {
    expect(is_seats_low(null)).toBe(false);
  });

  it("returns false for 0 (full, not low)", () => {
    expect(is_seats_low(0)).toBe(false);
  });

  it("returns true for seats <= default threshold (10)", () => {
    expect(is_seats_low(10)).toBe(true);
    expect(is_seats_low(5)).toBe(true);
    expect(is_seats_low(1)).toBe(true);
  });

  it("returns false for seats above default threshold", () => {
    expect(is_seats_low(11)).toBe(false);
    expect(is_seats_low(42)).toBe(false);
  });

  it("respects a custom threshold", () => {
    expect(is_seats_low(5, 3)).toBe(false);
    expect(is_seats_low(3, 3)).toBe(true);
  });
});

// ─── seats_label ─────────────────────────────────────────────────────────────

describe("seats_label", () => {
  it("returns 'Kuota tersedia' for null (unlimited)", () => {
    expect(seats_label(null)).toBe("Kuota tersedia");
  });

  it("returns 'Kursi penuh' for 0", () => {
    expect(seats_label(0)).toBe("Kursi penuh");
  });

  it("returns 'Sisa N kursi' for positive N", () => {
    expect(seats_label(5)).toBe("Sisa 5 kursi");
    expect(seats_label(1)).toBe("Sisa 1 kursi");
    expect(seats_label(42)).toBe("Sisa 42 kursi");
  });
});

// ─── CTA semantics ───────────────────────────────────────────────────────────
// Verify the boolean pattern used by RegisterCta: enabled unless is_sold_out.

describe("CTA enabled/disabled semantics (via is_sold_out)", () => {
  it("null → CTA must be ENABLED (not sold out)", () => {
    expect(is_sold_out(null)).toBe(false);
  });

  it("0 → CTA must be DISABLED (sold out)", () => {
    expect(is_sold_out(0)).toBe(true);
  });

  it("positive N → CTA must be ENABLED (not sold out)", () => {
    expect(is_sold_out(5)).toBe(false);
  });
});
