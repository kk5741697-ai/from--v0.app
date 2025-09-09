import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const DOMAIN_MAPPINGS = {
  "pixoratools.com": "main",
  "www.pixoratools.com": "main",
  "pixorapdf.com": "pdf",
  "www.pixorapdf.com": "pdf",
  "pixoraimg.com": "image",
  "www.pixoraimg.com": "image",
  "pixoraqrcode.com": "qr",
  "www.pixoraqrcode.com": "qr",
  "pixoranet.com": "network",
  "www.pixoranet.com": "network",
  "pixoraseo.com": "seo",
  "www.pixoraseo.com": "seo",
  "pixoracode.com": "code",
  "www.pixoracode.com": "code",
  "pixorautilities.com": "utilities",
  "www.pixorautilities.com": "utilities",
}

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "pixoratools.com"
  const url = request.nextUrl.clone()

  // Handle domain-specific routing
  const domainType = DOMAIN_MAPPINGS[hostname as keyof typeof DOMAIN_MAPPINGS] || "main"

  // Add domain info to headers for use in components
  const response = NextResponse.next()
  response.headers.set("x-domain-type", domainType)
  response.headers.set("x-hostname", hostname)

  // Handle tool-specific domain redirects
  if (domainType !== "main") {
    const path = url.pathname

    // Redirect root to appropriate tool category
    if (path === "/") {
      switch (domainType) {
        case "pdf":
          url.pathname = "/pdf-tools"
          return NextResponse.redirect(url)
        case "image":
          url.pathname = "/image-tools"
          return NextResponse.redirect(url)
        case "qr":
          url.pathname = "/qr-tools"
          return NextResponse.redirect(url)
        default:
          break
      }
    }

    // Block access to non-relevant tools on specialized domains
    const toolPrefixes = {
      pdf: ["pdf-"],
      image: ["image-"],
      qr: ["qr-", "wifi-qr-", "email-qr-", "vcard-qr-", "event-qr-"],
      network: ["ip-", "dns-", "http-", "ping-"],
      seo: ["meta-", "sitemap-", "robots-", "seo-"],
      code: ["json-", "xml-", "css-", "js-", "html-", "code-"],
      utilities: ["base64-", "hash-", "uuid-", "password-"],
    }

    if (domainType !== "main" && toolPrefixes[domainType as keyof typeof toolPrefixes]) {
      const allowedPrefixes = toolPrefixes[domainType as keyof typeof toolPrefixes]
      const isAllowedTool = allowedPrefixes.some((prefix) => path.startsWith(`/${prefix}`))

      if (
        path.startsWith("/") &&
        path !== "/" &&
        !isAllowedTool &&
        !path.startsWith("/api/") &&
        !path.startsWith("/_next/")
      ) {
        // Redirect to main domain for non-relevant tools
        url.hostname = "pixoratools.com"
        return NextResponse.redirect(url)
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
