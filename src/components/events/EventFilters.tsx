/**
 * EventFilters — horizontal filter chip bar for the /events list.
 *
 * Renders "Semua" plus one chip per event type. Active chip is highlighted
 * with the brand colour; inactive chips are outlined.
 */

import type { EventType } from "../../lib/api/events";

/** Maps filter key to Bahasa Indonesia label. "all" shows every event. */
const FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "online", label: "Online" },
  { value: "offline", label: "Tatap Muka" },
  { value: "workshop", label: "Workshop" },
  { value: "kompetisi", label: "Kompetisi" },
];

/** Props for EventFilters. */
export interface EventFiltersProps {
  /** Currently active filter key ("all" | EventType). */
  activeFilter: "all" | EventType;
  /** Called when the user clicks a chip. */
  onFilter: (filter: "all" | EventType) => void;
}

/**
 * Renders a single row of pill/chip buttons to filter events by type.
 * No business logic — purely presentational + controlled input.
 */
export function EventFilters({
  activeFilter,
  onFilter,
}: EventFiltersProps): JSX.Element {
  return (
    <div
      className="flex flex-wrap gap-2"
      role="group"
      aria-label="Filter berdasarkan tipe event"
    >
      {FILTER_OPTIONS.map(({ value, label }) => {
        const isActive = activeFilter === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => onFilter(value as "all" | EventType)}
            className={[
              "rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
              isActive
                ? "bg-brand-600 text-white"
                : "border border-brand-300 text-brand-700 hover:bg-brand-50",
            ].join(" ")}
            aria-pressed={isActive}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
