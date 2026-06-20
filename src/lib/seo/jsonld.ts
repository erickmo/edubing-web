/** Site-level constants shared across all JSON-LD builders. */
export const SITE_NAME = "Edubing";
export const SITE_URL = "https://app.edubing.id";

const SCHEMA = "https://schema.org";

/** Input shape for eventLd — snake_case to match Frappe public API. */
export interface EventLdInput {
  name: string;
  slug: string;
  short_description?: string;
  start_date?: string;
  end_date?: string;
  location?: string;
  price: number;
  event_type: "online" | "offline" | "workshop" | "kompetisi";
  remaining_seats?: number;
}

/**
 * Builds a schema.org Organization JSON-LD object for Edubing.
 * Used on every page for entity establishment.
 */
export function organizationLd(): object {
  return {
    "@context": SCHEMA,
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/logo.png`,
    },
  };
}

/**
 * Builds a schema.org WebSite JSON-LD object with sitelinks SearchAction.
 * Search target points to /events with query string.
 */
export function websiteLd(): object {
  return {
    "@context": SCHEMA,
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/events?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * Builds a schema.org Event JSON-LD object from an EventLdInput.
 * Maps event_type to the appropriate eventAttendanceMode and location schema.
 * - online → OnlineEventAttendanceMode + VirtualLocation
 * - offline / kompetisi → OfflineEventAttendanceMode + Place
 * - workshop → MixedEventAttendanceMode + Place
 */
export function eventLd(event: EventLdInput): object {
  const eventUrl = `${SITE_URL}/events/${event.slug}`;

  const isOnline = event.event_type === "online";
  const isWorkshop = event.event_type === "workshop";

  const attendanceMode = isOnline
    ? `${SCHEMA}/OnlineEventAttendanceMode`
    : isWorkshop
    ? `${SCHEMA}/MixedEventAttendanceMode`
    : `${SCHEMA}/OfflineEventAttendanceMode`;

  const location = isOnline
    ? { "@type": "VirtualLocation", url: eventUrl }
    : {
        "@type": "Place",
        name: event.location ?? SITE_NAME,
        address: event.location ?? "",
      };

  const seatsLeft = event.remaining_seats ?? 0;
  const availability =
    seatsLeft > 0
      ? `${SCHEMA}/InStock`
      : `${SCHEMA}/SoldOut`;

  const result: Record<string, unknown> = {
    "@context": SCHEMA,
    "@type": "Event",
    name: event.name,
    url: eventUrl,
    eventAttendanceMode: attendanceMode,
    location,
    offers: {
      "@type": "Offer",
      priceCurrency: "IDR",
      price: String(event.price),
      availability,
    },
  };

  if (event.short_description) result["description"] = event.short_description;
  if (event.start_date) result["startDate"] = event.start_date;
  if (event.end_date) result["endDate"] = event.end_date;

  return result;
}

/**
 * Builds a schema.org FAQPage JSON-LD object from a list of Q&A pairs.
 * Each item becomes a Question with an acceptedAnswer of type Answer.
 */
export function faqLd(
  items: { question: string; answer: string }[]
): object {
  return {
    "@context": SCHEMA,
    "@type": "FAQPage",
    mainEntity: items.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: {
        "@type": "Answer",
        text: answer,
      },
    })),
  };
}

/**
 * Builds a schema.org BreadcrumbList JSON-LD object.
 * Positions are 1-based as required by the spec.
 */
export function breadcrumbLd(
  items: { name: string; url: string }[]
): object {
  return {
    "@context": SCHEMA,
    "@type": "BreadcrumbList",
    itemListElement: items.map(({ name, url }, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Thing",
        "@id": url,
        name,
        url,
      },
    })),
  };
}
