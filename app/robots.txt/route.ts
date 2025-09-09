import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const hostname = url.hostname

  const robotsContent = `User-agent: *
Allow: /

# Sitemap
Sitemap: https://${hostname}/sitemap.xml

# Crawl-delay for better server performance
Crawl-delay: 1

# Disallow admin and API routes
Disallow: /api/
Disallow: /admin/
Disallow: /_next/
Disallow: /temp/

# Allow all tools and public pages
Allow: /image-*
Allow: /pdf-*
Allow: /qr-*
Allow: /about
Allow: /contact
Allow: /privacy
Allow: /terms`

  return new NextResponse(robotsContent, {
    headers: {
      "Content-Type": "text/plain",
    },
  })
}
