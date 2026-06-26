import type { ServerActivity } from "@/lib/serverActivities";

const SITE = process.env.NEXT_PUBLIC_APP_URL ?? "https://dchessacademy.com";
const APP = process.env.NEXT_PUBLIC_APP_NAME ?? "DChessAcademy";

/**
 * Schema.org JSON-LD for an activity. Posts with an event date render as an
 * Event (so Google can show event rich-results: date, location, organizer);
 * everything else renders as an Article. Embedded server-side in a
 * <script type="application/ld+json"> tag.
 */
export function activityJsonLd(a: ServerActivity): Record<string, unknown> {
  const url = `${SITE}/community/${a.slug}`;
  const image = a.coverImageUrl ?? `${SITE}/cca-logo.png`;
  const description = a.excerpt ?? a.title;
  const locationName = a.region ? `${a.region}, Cameroon` : "Cameroon";

  const isEvent =
    !!a.eventDate && ["EVENT", "EVENT_RECAP", "ANNOUNCEMENT"].includes(a.type);

  if (isEvent) {
    return {
      "@context": "https://schema.org",
      "@type": "Event",
      name: a.title,
      startDate: a.eventDate,
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      description,
      image: [image],
      url,
      location: {
        "@type": "Place",
        name: locationName,
        address: { "@type": "PostalAddress", addressRegion: a.region ?? undefined, addressCountry: "CM" },
      },
      organizer: { "@type": "Organization", name: APP, url: SITE },
    };
  }

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description,
    image: [image],
    datePublished: a.publishedAt ?? undefined,
    dateModified: a.publishedAt ?? undefined,
    author: { "@type": "Organization", name: APP, url: SITE },
    publisher: {
      "@type": "Organization",
      name: APP,
      logo: { "@type": "ImageObject", url: `${SITE}/cca-logo.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };
}
