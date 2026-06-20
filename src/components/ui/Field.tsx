import { useId } from "react";
import { cn } from "../../lib/cn";
import { Input } from "./Input";

/** Props untuk komponen Field (label + input + pesan error). */
export interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Label yang ditampilkan di atas input. */
  label: string;
  /** Pesan error yang ditampilkan di bawah input (jika ada). */
  error?: string;
}

/**
 * Field form yang accessible: label + input + teks error.
 * Menghubungkan label, input, dan pesan error via htmlFor/aria-invalid/aria-describedby.
 */
export function Field({ label, error, className, id: providedId, ...inputProps }: FieldProps): JSX.Element {
  const autoId = useId();
  const fieldId = providedId ?? autoId;
  const errorId = error ? `${fieldId}-error` : undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label
        htmlFor={fieldId}
        className="text-sm font-semibold text-ink"
      >
        {label}
      </label>
      <Input
        id={fieldId}
        hasError={Boolean(error)}
        errorId={errorId}
        {...inputProps}
      />
      {error && (
        <p
          id={errorId}
          role="alert"
          className="text-sm text-red-500"
        >
          {error}
        </p>
      )}
    </div>
  );
}
