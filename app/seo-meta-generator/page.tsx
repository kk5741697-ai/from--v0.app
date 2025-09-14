"use client"

import { SEOToolsLayout } from "@/components/tools-layouts/seo-tools-layout"
import { TrendingUp } from "lucide-react"

const seoOptions = [
  {
    key: "includeOpenGraph",
    label: "Include Open Graph Tags",
    type: "checkbox" as const,
    defaultValue: true,
    section: "Social Media",
  },
  {
    key: "includeTwitterCard",
    label: "Include Twitter Card Tags",
    type: "checkbox" as const,
    defaultValue: true,
    section: "Social Media",
  },
  {
    key: "includeBasicMeta",
    label: "Include Basic Meta Tags",
    type: "checkbox" as const,
    defaultValue: true,
    section: "Basic SEO",
  },
  {
    key: "includeStructuredData",
    label: "Include Structured Data",
    type: "checkbox" as const,
    defaultValue: false,
    section: "Advanced",
  },
  {
    key: "metaRobots",
    label: "Meta Robots",
    type: "select" as const,
    defaultValue: "index,follow",
    selectOptions: [
      { value: "index,follow", label: "Index, Follow" },
      { value: "noindex,nofollow", label: "No Index, No Follow" },
      { value: "index,nofollow", label: "Index, No Follow" },
      { value: "noindex,follow", label: "No Index, Follow" },
    ],
    section: "Basic SEO",
  },
  {
    key: "ogType",
    label: "Open Graph Type",
    type: "select" as const,
    defaultValue: "website",
    selectOptions: [
      { value: "website", label: "Website" },
      { value: "article", label: "Article" },
      { value: "product", label: "Product" },
      { value: "profile", label: "Profile" },
    ],
    section: "Social Media",
  },
  {
    key: "twitterCardType",
    label: "Twitter Card Type",
    type: "select" as const,
    defaultValue: "summary_large_image",
    selectOptions: [
      { value: "summary", label: "Summary" },
      { value: "summary_large_image", label: "Summary Large Image" },
      { value: "app", label: "App" },
      { value: "player", label: "Player" },
    ],
    section: "Social Media",
  },
]

function processSEOMetaTags(input: string, options: any = {}) {
  try {
    if (!input.trim()) {
      return { output: "", error: "Please provide website information" }
    }

    // Parse input as JSON or treat as URL
    let siteData: any = {}
    
    try {
      siteData = JSON.parse(input)
    } catch {
      // Treat as URL and extract basic info
      try {
        const url = new URL(input)
        siteData = {
          title: `${url.hostname} - Professional Website`,
          description: `Visit ${url.hostname} for quality content and services`,
          url: input,
          siteName: url.hostname,
          image: `${url.origin}/og-image.jpg`
        }
      } catch {
        return { output: "", error: "Invalid URL or JSON format" }
      }
    }

    let metaTags = ""

    // Basic Meta Tags
    if (options.includeBasicMeta) {
      metaTags += `<!-- Basic Meta Tags -->\n`
      metaTags += `<title>${siteData.title || "Your Website Title"}</title>\n`
      metaTags += `<meta name="description" content="${siteData.description || "Your website description"}">\n`
      metaTags += `<meta name="keywords" content="${siteData.keywords || "website, business, services"}">\n`
      metaTags += `<meta name="author" content="${siteData.author || "Your Name"}">\n`
      metaTags += `<meta name="robots" content="${options.metaRobots}">\n`
      metaTags += `<meta name="viewport" content="width=device-width, initial-scale=1.0">\n`
      metaTags += `<link rel="canonical" href="${siteData.url || "https://example.com"}">\n\n`
    }

    // Open Graph Tags
    if (options.includeOpenGraph) {
      metaTags += `<!-- Open Graph Meta Tags -->\n`
      metaTags += `<meta property="og:title" content="${siteData.title || "Your Website Title"}">\n`
      metaTags += `<meta property="og:description" content="${siteData.description || "Your website description"}">\n`
      metaTags += `<meta property="og:type" content="${options.ogType}">\n`
      metaTags += `<meta property="og:url" content="${siteData.url || "https://example.com"}">\n`
      metaTags += `<meta property="og:image" content="${siteData.image || "https://example.com/og-image.jpg"}">\n`
      metaTags += `<meta property="og:image:width" content="1200">\n`
      metaTags += `<meta property="og:image:height" content="630">\n`
      metaTags += `<meta property="og:site_name" content="${siteData.siteName || "Your Website"}">\n`
      metaTags += `<meta property="og:locale" content="en_US">\n\n`
    }

    // Twitter Card Tags
    if (options.includeTwitterCard) {
      metaTags += `<!-- Twitter Card Meta Tags -->\n`
      metaTags += `<meta name="twitter:card" content="${options.twitterCardType}">\n`
      metaTags += `<meta name="twitter:title" content="${siteData.title || "Your Website Title"}">\n`
      metaTags += `<meta name="twitter:description" content="${siteData.description || "Your website description"}">\n`
      metaTags += `<meta name="twitter:image" content="${siteData.image || "https://example.com/twitter-image.jpg"}">\n`
      if (siteData.twitterSite) {
        metaTags += `<meta name="twitter:site" content="${siteData.twitterSite}">\n`
      }
      if (siteData.twitterCreator) {
        metaTags += `<meta name="twitter:creator" content="${siteData.twitterCreator}">\n`
      }
      metaTags += `\n`
    }

    // Structured Data
    if (options.includeStructuredData) {
      metaTags += `<!-- Structured Data -->\n`
      metaTags += `<script type="application/ld+json">\n`
      metaTags += `{\n`
      metaTags += `  "@context": "https://schema.org",\n`
      metaTags += `  "@type": "${options.ogType === 'article' ? 'Article' : 'WebSite'}",\n`
      metaTags += `  "name": "${siteData.title || "Your Website"}",\n`
      metaTags += `  "description": "${siteData.description || "Your website description"}",\n`
      metaTags += `  "url": "${siteData.url || "https://example.com"}",\n`
      metaTags += `  "image": "${siteData.image || "https://example.com/image.jpg"}",\n`
      metaTags += `  "author": {\n`
      metaTags += `    "@type": "Organization",\n`
      metaTags += `    "name": "${siteData.author || "Your Organization"}"\n`
      metaTags += `  },\n`
      metaTags += `  "publisher": {\n`
      metaTags += `    "@type": "Organization",\n`
      metaTags += `    "name": "${siteData.siteName || "Your Website"}",\n`
      metaTags += `    "logo": {\n`
      metaTags += `      "@type": "ImageObject",\n`
      metaTags += `      "url": "${siteData.logo || "https://example.com/logo.png"}"\n`
      metaTags += `    }\n`
      metaTags += `  }\n`
      metaTags += `}\n`
      metaTags += `</script>\n\n`
    }

    // Additional SEO Tags
    metaTags += `<!-- Additional SEO Tags -->\n`
    metaTags += `<meta name="theme-color" content="${siteData.themeColor || "#3b82f6"}">\n`
    metaTags += `<meta name="msapplication-TileColor" content="${siteData.themeColor || "#3b82f6"}">\n`
    metaTags += `<link rel="icon" type="image/x-icon" href="/favicon.ico">\n`
    metaTags += `<link rel="apple-touch-icon" href="/apple-touch-icon.png">\n`

    const stats = {
      "Total Tags": (metaTags.match(/<meta|<link|<title/g) || []).length,
      "Open Graph Tags": options.includeOpenGraph ? (metaTags.match(/property="og:/g) || []).length : 0,
      "Twitter Tags": options.includeTwitterCard ? (metaTags.match(/name="twitter:/g) || []).length : 0,
      "Characters": metaTags.length,
    }

    return { output: metaTags.trim(), stats }
  } catch (error) {
    return {
      output: "",
      error: "Failed to generate meta tags",
    }
  }
}

export default function SEOMetaGeneratorPage() {
  return (
    <SEOToolsLayout
      title="SEO Meta Tag Generator"
      description="Generate optimized meta tags, Open Graph, Twitter Card tags, and structured data for better search engine visibility and social media sharing."
      icon={TrendingUp}
      toolType="meta-generator"
      processFunction={processSEOMetaTags}
      options={seoOptions}
      maxFiles={0}
      supportedFormats={[]}
      outputFormats={["html", "txt"]}
      richContent={
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
              Professional SEO Meta Tag Generation
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Create comprehensive meta tags that improve search engine rankings, social media sharing, 
              and overall website visibility with our enterprise-grade SEO tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="font-semibold text-lg mb-3">Search Engine Optimization</h3>
              <p className="text-muted-foreground text-sm">
                Generate meta tags that help search engines understand your content better. 
                Improve rankings with proper title tags, descriptions, and structured data.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="font-semibold text-lg mb-3">Social Media Integration</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Open Graph for Facebook sharing</li>
                <li>• Twitter Card optimization</li>
                <li>• LinkedIn preview enhancement</li>
                <li>• Rich snippet generation</li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="font-semibold text-lg mb-3">Professional Features</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Structured data markup</li>
                <li>• Mobile optimization tags</li>
                <li>• Performance optimization</li>
                <li>• Accessibility enhancements</li>
              </ul>
            </div>
          </div>
        </div>
      }
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Website Information Input</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Enter your website information as JSON or provide a URL for automatic detection:
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">JSON Format Example:</h4>
            <pre className="text-xs text-gray-600 overflow-x-auto">
{`{
  "title": "Your Website Title",
  "description": "Your website description for SEO",
  "url": "https://yourwebsite.com",
  "siteName": "Your Site Name",
  "image": "https://yourwebsite.com/og-image.jpg",
  "author": "Your Name",
  "keywords": "keyword1, keyword2, keyword3",
  "themeColor": "#3b82f6",
  "twitterSite": "@yourhandle",
  "twitterCreator": "@yourhandle"
}`}
            </pre>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">SEO Best Practices</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Title Tags</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Keep under 60 characters</li>
                <li>• Include primary keyword</li>
                <li>• Make it compelling and unique</li>
                <li>• Avoid keyword stuffing</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Meta Descriptions</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Keep between 150-160 characters</li>
                <li>• Include call-to-action</li>
                <li>• Summarize page content</li>
                <li>• Use active voice</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </SEOToolsLayout>
  )
}