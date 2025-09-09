import { NextResponse } from "next/server"
import { getDomainConfig } from "@/lib/config"

const TOOL_SLUGS = [
  // Image tools
  "image-crop",
  "image-resize",
  "image-compress",
  "image-convert",
  "image-rotate",
  "image-edit",
  "image-watermark",
  "image-filters",

  // PDF tools
  "pdf-split",
  "pdf-merge",
  "pdf-compress",
  "pdf-convert",
  "pdf-edit",
  "pdf-watermark",
  "pdf-organize",

  // QR tools
  "qr-code-generator",
  "wifi-qr-code-generator",
  "email-qr-code-generator",
  "vcard-qr-code-generator",
  "event-qr-code-generator",
  "bitcoin-qr-code-generator",

  // Utility tools
  "base64-encoder",
  "json-formatter",
  "xml-formatter",
  "css-beautifier",
  "js-beautifier",
  "html-formatter",
  "color-converter",
  "hash-generator",

  // SEO tools
  "meta-preview",
  "sitemap-generator",
  "robots-generator",
  "seo-analyzer",

  // Network tools
  "ip-lookup",
  "dns-lookup",
  "http-header-check",
  "ping-test",
]

export async function GET(request: Request) {
  const url = new URL(request.url)
  const hostname = url.hostname
  const domainConfig = getDomainConfig(hostname)

  const baseUrl = `https://${hostname}`
  const currentDate = new Date().toISOString().split("T")[0]

  // Filter tools based on domain
  let relevantTools = TOOL_SLUGS
  if (domainConfig.tools[0] !== "all") {
    relevantTools = TOOL_SLUGS.filter((tool) => domainConfig.tools.some((allowedTool) => tool.startsWith(allowedTool)))
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/about</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/contact</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/privacy</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${baseUrl}/terms</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
${relevantTools
  .map(
    (tool) => `  <url>
    <loc>${baseUrl}/${tool}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`,
  )
  .join("\n")}
</urlset>`

  return new NextResponse(sitemap, {
    headers: {
      "Content-Type": "application/xml",
    },
  })
}
