const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fxpartner.global";

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "FXPARTNER",
    url: SITE_URL,
    logo: `${SITE_URL}/fxpartner-logo.png`,
    // A genuine language signal for search/AI crawlers — the site's content
    // is authored in Turkish, so this (and the matching field on the other
    // schema builders below) should always be "tr-TR", never omitted.
    inLanguage: "tr-TR",
    description:
      "FXPARTNER, forex ve finans piyasalarını takip eden yatırımcılar için gerçek zamanlı forex sinyalleri, yapay zeka destekli piyasa analizi, teknik ve temel analiz, ekonomik takvim ve güvenilir broker karşılaştırmaları sunan bir finans platformudur.",
    founder: {
      "@type": "Person",
      name: "Erdem Torun",
    },
    // Only confirmed, real profile URLs — never a guessed or placeholder
    // handle. Add more here as the user confirms them (X, Instagram,
    // YouTube, Facebook); an unverified sameAs is worse than none, since
    // it would misattribute FXPARTNER's identity to the wrong account.
    sameAs: [
      "https://t.me/fxpartnerglobal",
      "https://x.com/fxpartner_TR",
      "https://www.instagram.com/fxpartner_global/",
    ],
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "FXPARTNER",
    url: SITE_URL,
    inLanguage: "tr-TR",
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
    inLanguage: "tr-TR",
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

export function faqSchema(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
      },
    })),
  };
}

export function newsArticleSchema(post: {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  updatedAt?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    inLanguage: "tr-TR",
    url: `${SITE_URL}/piyasa-analizi/${post.slug}`,
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

// Combines the editorial Review and — only when real user-submitted
// comments with a rating exist — the AggregateRating into a single
// FinancialService entity, instead of emitting two disconnected
// FinancialService declarations for the same URL on one page. Every field
// is backed by real data already in src/data/brokers.ts or the comments
// table; aggregateRating is omitted entirely when ratingCount is 0.
export function brokerFinancialServiceSchema(params: {
  broker: { name: string; slug: string; rating: number; summary: string };
  aggregate?: { ratingValue: number; ratingCount: number } | null;
}) {
  const { broker, aggregate } = params;
  return {
    "@context": "https://schema.org",
    "@type": "FinancialService",
    name: broker.name,
    url: `${SITE_URL}/brokers/${broker.slug}`,
    review: {
      "@type": "Review",
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
    },
    ...(aggregate && aggregate.ratingCount >= 1
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: aggregate.ratingValue,
            ratingCount: aggregate.ratingCount,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  };
}
