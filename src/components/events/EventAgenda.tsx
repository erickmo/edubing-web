/**
 * EventAgenda — numbered timeline of event sessions ("Jadwal & Agenda").
 *
 * Each row shows an ordinal sticker, the session title, its formatted date,
 * and a location/online hint. Renders nothing when there are no sessions so
 * the parent heading is never shown above an empty timeline.
 */

import type { EventSession } from "../../lib/api/events";
import { formatEventDate } from "../home/eventFormat";

/** Props for EventAgenda. */
export interface EventAgendaProps {
  sessions: EventSession[];
}

/** Resolve a human location hint for a session row. */
function sessionLocationLabel(session: EventSession): string {
  return session.location ?? "Online";
}

/**
 * Renders an ordered list of session rows as a sticker timeline.
 * @returns A `<ol>`, or `null` when `sessions` is empty.
 */
export function EventAgenda({ sessions }: EventAgendaProps): JSX.Element | null {
  if (sessions.length === 0) return null;
  return (
    <ol className="mt-4 space-y-3">
      {sessions.map((session, index) => {
        const dateLabel = session.session_date
          ? formatEventDate(session.session_date)
          : "";
        return (
          <li
            key={`${session.session_title ?? "sesi"}-${index}`}
            className="flex gap-4 rounded-2xl border-2 border-ink/10 bg-cream-50 p-4"
          >
            <span
              aria-hidden="true"
              className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-ink font-display text-sm font-black text-cream"
            >
              {index + 1}
            </span>
            <div className="min-w-0">
              <p className="font-display text-base font-bold text-ink">
                {session.session_title ?? `Sesi ${index + 1}`}
              </p>
              <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-ink-muted">
                {dateLabel && <span>📅 {dateLabel}</span>}
                <span>📍 {sessionLocationLabel(session)}</span>
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
