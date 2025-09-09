export interface StructuredDataConfig {
  type: "WebApplication" | "SoftwareApplication" | "Tool" | "WebPage"
  name: string
  description: string
  url: string
  applicationCategory?: string
  operatingSystem?: string
  offers?: {
    price: string
    priceCurrency: string
  }
  aggregateRating?: {
    ratingValue: number
    reviewCount: number
  }
  author?: {
    name: string
    url: string
  }
  publisher?: {
    name: string
    logo: string
  }
}

export function generateStructuredData(config: StructuredDataConfig): string {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": config.type,
    name: config.name,
    description: config.description,
    url: config.url,
    applicationCategory: config.applicationCategory || "UtilitiesApplication",
    operatingSystem: config.operatingSystem || "Any",
    browserRequirements: "Requires JavaScript. Requires HTML5.",
    permissions: "No special permissions required",
    storageRequirements: "Minimal storage required",
    memoryRequirements: "Minimal memory required",
    processorRequirements: "Any processor",
    offers: config.offers
      ? {
          "@type": "Offer",
          price: config.offers.price,
          priceCurrency: config.offers.priceCurrency,
          availability: "https://schema.org/InStock",
        }
      : {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
        },
    aggregateRating: config.aggregateRating
      ? {
          "@type": "AggregateRating",
          ratingValue: config.aggregateRating.ratingValue,
          reviewCount: config.aggregateRating.reviewCount,
        }
      : undefined,
    author: config.author
      ? {
          "@type": "Organization",
          name: config.author.name,
          url: config.author.url,
        }
      : {
          "@type": "Organization",
          name: "PixoraTools",
          url: "https://pixoratools.com",
        },
    publisher: config.publisher
      ? {
          "@type": "Organization",
          name: config.publisher.name,
          logo: {
            "@type": "ImageObject",
            url: config.publisher.logo,
          },
        }
      : {
          "@type": "Organization",
          name: "PixoraTools",
          logo: {
            "@type": "ImageObject",
            url: "https://pixoratools.com/logo.png",
          },
        },
    datePublished: "2024-01-01",
    dateModified: new Date().toISOString().split("T")[0],
    inLanguage: "en-US",
    isAccessibleForFree: true,
    isFamilyFriendly: true,
    keywords: generateKeywords(config.name, config.description),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": config.url,
    },
  }

  // Remove undefined properties
  Object.keys(structuredData).forEach((key) => {
    if (structuredData[key as keyof typeof structuredData] === undefined) {
      delete structuredData[key as keyof typeof structuredData]
    }
  })

  return JSON.stringify(structuredData, null, 2)
}

function generateKeywords(name: string, description: string): string {
  const commonKeywords = [
    "online tool",
    "free tool",
    "web application",
    "browser tool",
    "no download",
    "instant",
    "secure",
    "privacy",
    "professional",
  ]

  const nameWords = name.toLowerCase().split(/\s+/)
  const descWords = description.toLowerCase().split(/\s+/).slice(0, 10)

  return [...nameWords, ...descWords, ...commonKeywords]
    .filter((word, index, arr) => arr.indexOf(word) === index && word.length > 2)
    .join(", ")
}

export function generateBreadcrumbStructuredData(breadcrumbs: Array<{ name: string; url: string }>): string {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  }

  return JSON.stringify(structuredData, null, 2)
}

export function generateFAQStructuredData(faqs: Array<{ question: string; answer: string }>): string {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  }

  return JSON.stringify(structuredData, null, 2)
}
