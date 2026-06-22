/**
 * EventInfoList — a sticker-styled bullet list for benefits / requirements.
 *
 * Used by both "Apa yang Kamu Dapat" (check markers) and "Persyaratan"
 * (neutral dot markers). The caller passes already-split lines so this
 * component stays presentational. Renders nothing when `items` is empty so
 * the parent never shows a heading above a blank list.
 */

import { cn } from "../../lib/cn";

/** Marker style — `check` for positive benefits, `dot` for neutral lists. */
export type InfoListMarker = "check" | "dot";

/** Props for EventInfoList. */
export interface EventInfoListProps {
  /** Pre-split, trimmed, non-empty lines to display. */
  items: string[];
  /** Marker glyph style. Defaults to `check`. */
  marker?: InfoListMarker;
}

/** Tangerine sticker check; teal-tinted neutral dot. */
function Marker({ marker }: { marker: InfoListMarker }): JSX.Element {
  if (marker === "check") {
    return (
      <span
        aria-hidden="true"
        className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-brand-100 text-xs font-black text-brand-600"
      >
        ✓
      </span>
    );
  }
  return (
    <span
      aria-hidden="true"
      className="mt-2 h-2 w-2 flex-none rounded-full bg-teal-400"
    />
  );
}

/**
 * Renders a vertical list with leading markers.
 * @returns A `<ul>`, or `null` when there is nothing to show.
 */
export function EventInfoList({
  items,
  marker = "check",
}: EventInfoListProps): JSX.Element | null {
  if (items.length === 0) return null;
  return (
    <ul className="mt-4 space-y-3">
      {items.map((item, index) => (
        <li key={`${item}-${index}`} className="flex items-start gap-3">
          <Marker marker={marker} />
          <span className={cn("text-ink-soft leading-relaxed")}>{item}</span>
        </li>
      ))}
    </ul>
  );
}
