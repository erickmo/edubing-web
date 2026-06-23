/**
 * FeedbackForm — form bintang + komentar untuk feedback event.
 *
 * Digunakan secara inline di dalam RegistrationCard saat pengguna
 * menekan "Beri Feedback". Memanggil mutation useSubmitFeedback
 * lalu menutup form via callback onDone.
 *
 * Aksesibilitas:
 * - Tombol bintang memiliki aria-label "Beri N bintang".
 * - Bintang yang dipilih ditandai aria-pressed="true".
 * - Tombol Submit disabled sampai rating > 0 atau saat pending.
 */
import { useState } from "react";
import { Button } from "../ui/Button";
import { useSubmitFeedback } from "../../lib/api/account";
import type { SubmitFeedbackArgs } from "../../lib/api/account";
import { FrappeError } from "../../lib/frappe/client";
import { cn } from "../../lib/cn";

// ─── Konstanta ────────────────────────────────────────────────────────────────

const STAR_COUNT = 5;
const STAR_LABELS = ["Sangat buruk", "Buruk", "Cukup", "Bagus", "Luar biasa"];

/** Props untuk FeedbackForm. */
export interface FeedbackFormProps {
  /** Primary key dokumen Registration di Frappe. */
  registration: string;
  /** Dipanggil setelah feedback berhasil dikirim atau pengguna membatalkan. */
  onDone: () => void;
}

// ─── Sub-komponen ─────────────────────────────────────────────────────────────

/** Baris 5 tombol bintang yang dapat diklik dan keyboard-accessible. */
function StarRating({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (n: number) => void;
  disabled: boolean;
}): JSX.Element {
  return (
    <div className="flex gap-1" role="group" aria-label="Rating bintang">
      {Array.from({ length: STAR_COUNT }, (_, i) => {
        const n = i + 1;
        const filled = n <= value;
        return (
          <button
            key={n}
            type="button"
            aria-label={`Beri ${n} bintang`}
            aria-pressed={filled}
            disabled={disabled}
            onClick={() => onChange(n)}
            className={cn(
              "text-3xl transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:cursor-not-allowed",
              filled ? "text-amber-400" : "text-ink/20 hover:text-amber-300",
            )}
          >
            ★
          </button>
        );
      })}
      {value > 0 && (
        <span className="ml-2 self-center text-sm text-ink-soft">
          {STAR_LABELS[value - 1]}
        </span>
      )}
    </div>
  );
}

// ─── Komponen utama ───────────────────────────────────────────────────────────

/**
 * Form feedback inline: rating bintang wajib + komentar opsional.
 * Memanggil useSubmitFeedback on submit; menutup form via onDone.
 */
export function FeedbackForm({
  registration,
  onDone,
}: FeedbackFormProps): JSX.Element {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const { mutate, isPending, error } = useSubmitFeedback();

  const errorMsg =
    error instanceof FrappeError
      ? error.message
      : error instanceof Error
      ? error.message
      : null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) return;
    const args: SubmitFeedbackArgs = { registration, rating, comment };
    mutate(args, { onSuccess: onDone });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 rounded-2xl border border-ink/10 bg-cream/50 p-4"
    >
      <p className="mb-3 text-sm font-semibold text-ink">Beri penilaian:</p>

      <StarRating value={rating} onChange={setRating} disabled={isPending} />

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        disabled={isPending}
        placeholder="Bagikan pengalamanmu… (opsional)"
        rows={3}
        className="mt-3 w-full resize-none rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm text-ink placeholder-ink/40 focus:border-brand-400 focus:outline-none disabled:opacity-50"
      />

      {errorMsg && (
        <p className="mt-2 text-sm text-red-600">{errorMsg}</p>
      )}

      <div className="mt-3 flex gap-2">
        <Button
          type="submit"
          size="sm"
          disabled={rating === 0 || isPending}
        >
          {isPending ? "Mengirim…" : "Kirim Feedback"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onDone}
          disabled={isPending}
        >
          Batal
        </Button>
      </div>
    </form>
  );
}
