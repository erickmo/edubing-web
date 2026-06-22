/**
 * EventArticle — the left-column content of the event detail page.
 *
 * Composes the rich body sections (description, benefits, agenda,
 * requirements, kompetisi info, organizer). Every section after the
 * description renders ONLY when its data is present, so no empty headings
 * ever appear. Each section is a small, self-contained block.
 */

import type { PublicEvent } from "../../lib/api/events";
import { splitLines } from "../home/eventFormat";
import { EventInfoList } from "./EventInfoList";
import { EventAgenda } from "./EventAgenda";

/** Props for EventArticle. */
export interface EventArticleProps {
  event: PublicEvent;
}

/** Section heading shared by every article block. */
function SectionHeading({ children }: { children: string }): JSX.Element {
  return (
    <h2 className="font-display text-2xl font-black text-ink">{children}</h2>
  );
}

/**
 * "Tentang Event" — admin-authored rich HTML when present, else the short
 * description, else a graceful placeholder.
 *
 * SECURITY: `description_rich` is authored by trusted admins in the Frappe
 * backend (not user-generated), so rendering it via dangerouslySetInnerHTML
 * is acceptable here. Do NOT reuse this pattern for untrusted input.
 */
function AboutSection({ event }: EventArticleProps): JSX.Element {
  return (
    <section>
      <SectionHeading>Tentang Event</SectionHeading>
      {event.description_rich ? (
        <div
          className="prose-event mt-4 space-y-3 text-ink-soft leading-relaxed [&_a]:text-brand-600 [&_a]:underline [&_strong]:text-ink [&_ul]:list-disc [&_ul]:pl-5"
          // Trusted admin-authored HTML — see note above.
          dangerouslySetInnerHTML={{ __html: event.description_rich }}
        />
      ) : (
        <p className="mt-4 text-ink-soft leading-relaxed">
          {event.short_description || "Deskripsi belum tersedia."}
        </p>
      )}
    </section>
  );
}

/**
 * Renders the full article column with all conditional sections.
 */
export function EventArticle({ event }: EventArticleProps): JSX.Element {
  const benefits = splitLines(event.what_you_get);
  const requirements = splitLines(event.requirements);
  const hasSessions = (event.sessions?.length ?? 0) > 0;

  return (
    <article className="space-y-10 lg:col-span-2">
      <AboutSection event={event} />

      {benefits.length > 0 && (
        <section>
          <SectionHeading>Apa yang Kamu Dapat</SectionHeading>
          <EventInfoList items={benefits} marker="check" />
        </section>
      )}

      {hasSessions && (
        <section>
          <SectionHeading>Jadwal &amp; Agenda</SectionHeading>
          <EventAgenda sessions={event.sessions ?? []} />
        </section>
      )}

      {requirements.length > 0 && (
        <section>
          <SectionHeading>Persyaratan</SectionHeading>
          <EventInfoList items={requirements} marker="dot" />
        </section>
      )}

      {event.category_info && (
        <section>
          <SectionHeading>Informasi Kompetisi</SectionHeading>
          <p className="mt-4 whitespace-pre-line text-ink-soft leading-relaxed">
            {event.category_info}
          </p>
        </section>
      )}

      {event.organizer && (
        <section>
          <SectionHeading>Penyelenggara</SectionHeading>
          <p className="mt-4 font-semibold text-ink">{event.organizer}</p>
        </section>
      )}
    </article>
  );
}
