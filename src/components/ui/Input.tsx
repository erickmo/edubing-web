import { forwardRef } from "react";
import { cn } from "../../lib/cn";

/** Props untuk komponen Input yang accessible. */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Apakah input dalam kondisi error (aria-invalid). */
  hasError?: boolean;
  /** ID elemen deskripsi error untuk aria-describedby. */
  errorId?: string;
}

/**
 * Input teks yang accessible.
 * Mendukung aria-invalid dan aria-describedby untuk pesan error.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, hasError = false, errorId, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full rounded-xl border-2 px-4 py-3 text-base text-ink",
          "bg-white placeholder:text-ink-soft/60",
          "transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/30",
          hasError
            ? "border-red-400 focus:border-red-500"
            : "border-ink/15 focus:border-brand-400",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        aria-invalid={hasError || undefined}
        aria-describedby={errorId}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
