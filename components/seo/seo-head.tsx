import Head from "next/head"
import {
  generateStructuredData,
  generateBreadcrumbStructuredData,
  generateFAQStructuredData,
} from "@/lib/seo/structured-data"

interface SEOHeadProps {
  title: string
  description: string
  canonical?: string
  keywords?: string[]
  ogImage?: string
  ogType?: string
  twitterCard?: string
  noIndex?: boolean
  structuredData?: {
    type: "WebApplication" | "SoftwareApplication" | "Tool" | "WebPage"
    applicationCategory?: string
    aggregateRating?: {
      ratingValue: number
      reviewCount: number
    }
  }
  breadcrumbs?: Array<{ name: string; url: string }>
  faqs?: Array<{ question: string; answer: string }>
}

export function SEOHead({
  title,
  description,
  canonical,
  keywords = [],
  ogImage,
  ogType = "website",
  twitterCard = "summary_large_image",
  noIndex = false,
  structuredData,
  breadcrumbs,
  faqs,
}: SEOHeadProps) {
  const fullTitle = title.includes("PixoraTools") ? title : `${title} | PixoraTools`
  const currentUrl = canonical || (typeof window !== "undefined" ? window.location.href : "")
  const defaultImage = ogImage || "https://pixoratools.com/og-image.png"

  // Generate structured data
  const toolStructuredData = structuredData
    ? generateStructuredData({
        type: structuredData.type,
        name: title,
        description: description,
        url: currentUrl,
        applicationCategory: structuredData.applicationCategory,
        aggregateRating: structuredData.aggregateRating,
      })
    : null

  const breadcrumbData = breadcrumbs ? generateBreadcrumbStructuredData(breadcrumbs) : null
  const faqData = faqs ? generateFAQStructuredData(faqs) : null

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords.length > 0 && <meta name="keywords" content={keywords.join(", ")} />}
      <meta name="author" content="PixoraTools" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta charSet="UTF-8" />

      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Robots */}
      <meta name="robots" content={noIndex ? "noindex, nofollow" : "index, follow"} />
      <meta name="googlebot" content={noIndex ? "noindex, nofollow" : "index, follow"} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:image" content={defaultImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="PixoraTools" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={defaultImage} />
      <meta name="twitter:site" content="@pixoratools" />
      <meta name="twitter:creator" content="@pixoratools" />

      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#3b82f6" />
      <meta name="msapplication-TileColor" content="#3b82f6" />
      <meta name="application-name" content="PixoraTools" />
      <meta name="apple-mobile-web-app-title" content="PixoraTools" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />

      {/* Structured Data */}
      {toolStructuredData && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toolStructuredData }} />
      )}

      {breadcrumbData && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbData }} />}

      {faqData && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqData }} />}

      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://www.googletagmanager.com" />

      {/* DNS Prefetch */}
      <link rel="dns-prefetch" href="https://www.google-analytics.com" />
      <link rel="dns-prefetch" href="https://www.googleadservices.com" />
    </Head>
  )
}
