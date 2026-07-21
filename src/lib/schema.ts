const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fxpartner.global";

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "FXPARTNER",
    url: SITE_URL,
    description:
      "Forex broker comparison and review platform, ranking brokers by regulation, cost, platform support, and withdrawal reliability.",
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "FXPARTNER",
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/categories`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// A single editorial review authored by FXPARTNER, not a fabricated
// aggregate. If real user comments with ratings exist for this broker,
// pass them in separately to also emit a genuine AggregateRating.
export function brokerReviewSchema(broker: {
  name: string;
  slug: string;
  rating: number;
  summary: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Review",
    itemReviewed: {
      "@type": "FinancialService",
      name: broker.name,
      url: `${SITE_URL}/brokers/${broker.slug}`,
    },
    author: {
      "@type": "Organization",
      name: "FXPARTNER",
    },
    reviewRating: {
      "@type": "Rating",
      ratingValue: broker.rating,
      bestRating: 5,
      worstRating: 1,
    },
    reviewBody: broker.summary,
  };
}

export function blogPostingSchema(post: {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  updatedAt?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    url: `${SITE_URL}/blog/${post.slug}`,
    author: {
      "@type": "Organization",
      name: "FXPARTNER",
    },
    publisher: {
      "@type": "Organization",
      name: "FXPARTNER",
    },
  };
}

// Only valid schema when count >= 1 — Google requires a real rating count.
export function aggregateRatingSchema(params: {
  brokerName: string;
  brokerSlug: string;
  ratingValue: number;
  ratingCount: number;
}) {
  if (params.ratingCount < 1) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FinancialService",
    name: params.brokerName,
    url: `${SITE_URL}/brokers/${params.brokerSlug}`,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: params.ratingValue,
      ratingCount: params.ratingCount,
      bestRating: 5,
      worstRating: 1,
    },
  };
}
