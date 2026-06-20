import { describe, it, expect } from "vitest";
import {
  organizationLd,
  websiteLd,
  eventLd,
  faqLd,
  breadcrumbLd,
  SITE_NAME,
  SITE_URL,
} from "../jsonld";

describe("SITE constants", () => {
  it("SITE_NAME is Edubing", () => {
    expect(SITE_NAME).toBe("Edubing");
  });

  it("SITE_URL is https://app.edubing.id", () => {
    expect(SITE_URL).toBe("https://app.edubing.id");
  });
});

describe("organizationLd()", () => {
  it("returns @type Organization", () => {
    const ld = organizationLd() as Record<string, unknown>;
    expect(ld["@type"]).toBe("Organization");
  });

  it("has @context schema.org", () => {
    const ld = organizationLd() as Record<string, unknown>;
    expect(ld["@context"]).toBe("https://schema.org");
  });

  it("has name Edubing", () => {
    const ld = organizationLd() as Record<string, unknown>;
    expect(ld["name"]).toBe("Edubing");
  });

  it("has url matching SITE_URL", () => {
    const ld = organizationLd() as Record<string, unknown>;
    expect(ld["url"]).toBe(SITE_URL);
  });

  it("has logo object", () => {
    const ld = organizationLd() as Record<string, unknown>;
    expect(ld["logo"]).toBeDefined();
  });
});

describe("websiteLd()", () => {
  it("returns @type WebSite", () => {
    const ld = websiteLd() as Record<string, unknown>;
    expect(ld["@type"]).toBe("WebSite");
  });

  it("has @context schema.org", () => {
    const ld = websiteLd() as Record<string, unknown>;
    expect(ld["@context"]).toBe("https://schema.org");
  });

  it("has potentialAction of type SearchAction", () => {
    const ld = websiteLd() as Record<string, unknown>;
    const action = ld["potentialAction"] as Record<string, unknown>;
    expect(action["@type"]).toBe("SearchAction");
  });

  it("potentialAction target is a string URL pointing to /events search", () => {
    const ld = websiteLd() as Record<string, unknown>;
    const action = ld["potentialAction"] as Record<string, unknown>;
    const target = action["target"] as string;
    expect(typeof target).toBe("string");
    expect(target).toContain("/events");
    expect(target).toContain("{search_term_string}");
  });
});

describe("eventLd() — online event", () => {
  const onlineInput = {
    name: "Webinar Python Dasar",
    slug: "webinar-python-dasar",
    short_description: "Belajar Python dari nol",
    start_date: "2025-08-01T09:00:00",
    end_date: "2025-08-01T11:00:00",
    location: undefined,
    price: 150000,
    event_type: "online" as const,
    remaining_seats: 30,
  };

  it("returns @type Event", () => {
    const ld = eventLd(onlineInput) as Record<string, unknown>;
    expect(ld["@type"]).toBe("Event");
  });

  it("has @context schema.org", () => {
    const ld = eventLd(onlineInput) as Record<string, unknown>;
    expect(ld["@context"]).toBe("https://schema.org");
  });

  it("eventAttendanceMode is OnlineEventAttendanceMode", () => {
    const ld = eventLd(onlineInput) as Record<string, unknown>;
    expect(ld["eventAttendanceMode"]).toBe(
      "https://schema.org/OnlineEventAttendanceMode"
    );
  });

  it("location is VirtualLocation", () => {
    const ld = eventLd(onlineInput) as Record<string, unknown>;
    const loc = ld["location"] as Record<string, unknown>;
    expect(loc["@type"]).toBe("VirtualLocation");
  });

  it("offers.priceCurrency is IDR", () => {
    const ld = eventLd(onlineInput) as Record<string, unknown>;
    const offers = ld["offers"] as Record<string, unknown>;
    expect(offers["priceCurrency"]).toBe("IDR");
  });

  it("offers.price matches input", () => {
    const ld = eventLd(onlineInput) as Record<string, unknown>;
    const offers = ld["offers"] as Record<string, unknown>;
    expect(String(offers["price"])).toBe("150000");
  });

  it("startDate is set correctly", () => {
    const ld = eventLd(onlineInput) as Record<string, unknown>;
    expect(ld["startDate"]).toBe("2025-08-01T09:00:00");
  });
});

describe("eventLd() — offline event", () => {
  const offlineInput = {
    name: "Workshop Desain UI",
    slug: "workshop-desain-ui",
    short_description: "Workshop intensif desain UI",
    start_date: "2025-09-10T08:00:00",
    end_date: "2025-09-10T17:00:00",
    location: "Gedung Edubing, Jakarta",
    price: 500000,
    event_type: "offline" as const,
    remaining_seats: 15,
  };

  it("eventAttendanceMode is OfflineEventAttendanceMode", () => {
    const ld = eventLd(offlineInput) as Record<string, unknown>;
    expect(ld["eventAttendanceMode"]).toBe(
      "https://schema.org/OfflineEventAttendanceMode"
    );
  });

  it("location is Place", () => {
    const ld = eventLd(offlineInput) as Record<string, unknown>;
    const loc = ld["location"] as Record<string, unknown>;
    expect(loc["@type"]).toBe("Place");
  });

  it("Place has name from location string", () => {
    const ld = eventLd(offlineInput) as Record<string, unknown>;
    const loc = ld["location"] as Record<string, unknown>;
    expect(loc["name"]).toBe("Gedung Edubing, Jakarta");
  });
});

describe("eventLd() — kompetisi event", () => {
  const kompetisiInput = {
    name: "Kompetisi Coding 2025",
    slug: "kompetisi-coding-2025",
    price: 0,
    event_type: "kompetisi" as const,
    remaining_seats: 100,
  };

  it("eventAttendanceMode is OfflineEventAttendanceMode for kompetisi", () => {
    const ld = eventLd(kompetisiInput) as Record<string, unknown>;
    expect(ld["eventAttendanceMode"]).toBe(
      "https://schema.org/OfflineEventAttendanceMode"
    );
  });

  it("offers.price is 0 for free events", () => {
    const ld = eventLd(kompetisiInput) as Record<string, unknown>;
    const offers = ld["offers"] as Record<string, unknown>;
    expect(String(offers["price"])).toBe("0");
  });

  it("offers.availability is InStock when seats available", () => {
    const ld = eventLd(kompetisiInput) as Record<string, unknown>;
    const offers = ld["offers"] as Record<string, unknown>;
    expect(offers["availability"]).toBe("https://schema.org/InStock");
  });
});

describe("eventLd() — workshop event", () => {
  const workshopInput = {
    name: "Workshop UI Design 2025",
    slug: "workshop-ui-design-2025",
    short_description: "Workshop desain UI hybrid online dan tatap muka",
    start_date: "2025-11-01T09:00:00",
    end_date: "2025-11-01T17:00:00",
    location: "Gedung Edubing, Jakarta",
    price: 350000,
    event_type: "workshop" as const,
    remaining_seats: 20,
  };

  it("eventAttendanceMode is MixedEventAttendanceMode", () => {
    const ld = eventLd(workshopInput) as Record<string, unknown>;
    expect(ld["eventAttendanceMode"]).toBe(
      "https://schema.org/MixedEventAttendanceMode"
    );
  });

  it("location is Place", () => {
    const ld = eventLd(workshopInput) as Record<string, unknown>;
    const loc = ld["location"] as Record<string, unknown>;
    expect(loc["@type"]).toBe("Place");
  });

  it("offers.availability is InStock when seats available", () => {
    const ld = eventLd(workshopInput) as Record<string, unknown>;
    const offers = ld["offers"] as Record<string, unknown>;
    expect(offers["availability"]).toBe("https://schema.org/InStock");
  });
});

describe("faqLd()", () => {
  const items = [
    { question: "Apa itu Edubing?", answer: "Platform pendidikan digital." },
    { question: "Apakah gratis?", answer: "Ada konten gratis dan berbayar." },
    { question: "Bagaimana cara daftar?", answer: "Klik tombol Daftar." },
  ];

  it("returns @type FAQPage", () => {
    const ld = faqLd(items) as Record<string, unknown>;
    expect(ld["@type"]).toBe("FAQPage");
  });

  it("has @context schema.org", () => {
    const ld = faqLd(items) as Record<string, unknown>;
    expect(ld["@context"]).toBe("https://schema.org");
  });

  it("mainEntity length matches items length", () => {
    const ld = faqLd(items) as Record<string, unknown>;
    const entities = ld["mainEntity"] as unknown[];
    expect(entities.length).toBe(items.length);
  });

  it("mainEntity items have @type Question", () => {
    const ld = faqLd(items) as Record<string, unknown>;
    const entities = ld["mainEntity"] as Record<string, unknown>[];
    entities.forEach((e) => {
      expect(e["@type"]).toBe("Question");
    });
  });

  it("each Question has acceptedAnswer of type Answer", () => {
    const ld = faqLd(items) as Record<string, unknown>;
    const entities = ld["mainEntity"] as Record<string, unknown>[];
    entities.forEach((e) => {
      const ans = e["acceptedAnswer"] as Record<string, unknown>;
      expect(ans["@type"]).toBe("Answer");
    });
  });
});

describe("breadcrumbLd()", () => {
  const items = [
    { name: "Beranda", url: "https://app.edubing.id/" },
    { name: "Event", url: "https://app.edubing.id/events" },
    { name: "Webinar Python Dasar", url: "https://app.edubing.id/events/webinar-python-dasar" },
  ];

  it("returns @type BreadcrumbList", () => {
    const ld = breadcrumbLd(items) as Record<string, unknown>;
    expect(ld["@type"]).toBe("BreadcrumbList");
  });

  it("has @context schema.org", () => {
    const ld = breadcrumbLd(items) as Record<string, unknown>;
    expect(ld["@context"]).toBe("https://schema.org");
  });

  it("itemListElement positions are 1-based", () => {
    const ld = breadcrumbLd(items) as Record<string, unknown>;
    const listItems = ld["itemListElement"] as Record<string, unknown>[];
    expect(listItems[0]["position"]).toBe(1);
    expect(listItems[1]["position"]).toBe(2);
    expect(listItems[2]["position"]).toBe(3);
  });

  it("itemListElement @type is ListItem", () => {
    const ld = breadcrumbLd(items) as Record<string, unknown>;
    const listItems = ld["itemListElement"] as Record<string, unknown>[];
    listItems.forEach((item) => {
      expect(item["@type"]).toBe("ListItem");
    });
  });

  it("itemListElement items have item.name", () => {
    const ld = breadcrumbLd(items) as Record<string, unknown>;
    const listItems = ld["itemListElement"] as Record<string, unknown>[];
    expect((listItems[0]["item"] as Record<string, unknown>)["name"]).toBe("Beranda");
  });
});
