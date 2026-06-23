/**
 * Unit tests untuk helper is_checkin_open dari account.ts.
 *
 * Strategi TDD: tulis semua uji SEBELUM implementasi helper
 * sehingga uji gagal dulu, lalu implementasi membuat semuanya lulus.
 */
import { describe, it, expect } from "vitest";
import { is_checkin_open } from "../account";

// ─── Referensi waktu uji ─────────────────────────────────────────────────────

const NOW = new Date("2025-09-01T10:00:00");

// ─── Uji is_checkin_open ─────────────────────────────────────────────────────

describe("is_checkin_open", () => {
  it("terbuka ketika now berada di dalam window (start <= now <= end)", () => {
    const start = "2025-09-01T09:00:00";
    const end = "2025-09-01T12:00:00";
    expect(is_checkin_open(start, end, NOW)).toBe(true);
  });

  it("tertutup ketika now sebelum start", () => {
    const start = "2025-09-01T11:00:00";
    const end = "2025-09-01T14:00:00";
    expect(is_checkin_open(start, end, NOW)).toBe(false);
  });

  it("tertutup ketika now setelah end", () => {
    const start = "2025-09-01T07:00:00";
    const end = "2025-09-01T09:30:00";
    expect(is_checkin_open(start, end, NOW)).toBe(false);
  });

  it("terbuka ketika start_date null (selalu terbuka)", () => {
    expect(is_checkin_open(null, "2025-09-01T12:00:00", NOW)).toBe(true);
  });

  it("menggunakan start+6jam sebagai end jika end_date null", () => {
    // start=09:00, end=null → window 09:00–15:00, now=10:00 → terbuka
    const start = "2025-09-01T09:00:00";
    expect(is_checkin_open(start, null, NOW)).toBe(true);
  });

  it("tertutup ketika end null dan now > start+6jam", () => {
    // start=03:00, end=null → window 03:00–09:00, now=10:00 → tertutup
    const start = "2025-09-01T03:00:00";
    expect(is_checkin_open(start, null, NOW)).toBe(false);
  });
});
