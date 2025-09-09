export interface DomainConfig {
  domain: string
  name: string
  title: string
  description: string
  primaryColor: string
  logo: string
  favicon: string
  headerHtml?: string
  footerHtml?: string
  enableAds: boolean
  adSlots: {
    header: string
    beforeCanvas: string
    afterCanvas: string
    sidebar?: string
  }
  tools: string[]
  seoKeywords: string[]
}

export interface AppConfig {
  enableAds: boolean
  adsensePublisherId?: string
  enableAutoAds: boolean
  enableAnalytics: boolean
  enableSearch: boolean
  maxFileSize: number // MB
  maxFiles: number
  supportEmail: string
  apiUrl?: string
  databaseUrl?: string
  domains: DomainConfig[]
}

// Multi-domain configuration
const DOMAIN_CONFIGS: DomainConfig[] = [
  {
    domain: "pixoratools.com",
    name: "Pixora Tools",
    title: "Pixora Tools - Professional Online Tools Platform",
    description: "300+ professional web tools for PDF, image, QR, code, and SEO tasks. Fast, secure, and free.",
    primaryColor: "#3b82f6",
    logo: "/logos/pixora-tools.svg",
    favicon: "/favicons/pixora-tools.ico",
    enableAds: true,
    adSlots: {
      header: "tool-header-banner",
      beforeCanvas: "before-canvas-banner",
      afterCanvas: "after-canvas-banner",
    },
    tools: ["all"],
    seoKeywords: ["online tools", "web tools", "free tools", "image tools", "pdf tools", "qr generator"],
  },
  {
    domain: "pixorapdf.com",
    name: "Pixora PDF",
    title: "Pixora PDF - Professional PDF Tools Online",
    description:
      "Complete PDF toolkit: merge, split, compress, convert, edit, and organize PDF files online. Fast and secure.",
    primaryColor: "#dc2626",
    logo: "/logos/pixora-pdf.svg",
    favicon: "/favicons/pixora-pdf.ico",
    enableAds: true,
    adSlots: {
      header: "pdf-header-banner",
      beforeCanvas: "pdf-before-canvas",
      afterCanvas: "pdf-after-canvas",
    },
    tools: ["pdf-split", "pdf-merge", "pdf-compress", "pdf-convert", "pdf-edit", "pdf-watermark", "pdf-organize"],
    seoKeywords: ["pdf tools", "merge pdf", "split pdf", "compress pdf", "pdf converter", "pdf editor"],
  },
  {
    domain: "pixoraimg.com",
    name: "Pixora Image",
    title: "Pixora Image - Professional Image Editor Online",
    description:
      "Advanced image editing tools: crop, resize, compress, convert, filters, and more. Professional results in your browser.",
    primaryColor: "#059669",
    logo: "/logos/pixora-img.svg",
    favicon: "/favicons/pixora-img.ico",
    enableAds: true,
    adSlots: {
      header: "img-header-banner",
      beforeCanvas: "img-before-canvas",
      afterCanvas: "img-after-canvas",
    },
    tools: [
      "image-crop",
      "image-resize",
      "image-compress",
      "image-convert",
      "image-rotate",
      "image-edit",
      "image-watermark",
      "image-filters",
    ],
    seoKeywords: ["image editor", "photo editor", "crop image", "resize image", "compress image", "image converter"],
  },
  {
    domain: "pixoraqrcode.com",
    name: "Pixora QR",
    title: "Pixora QR - Advanced QR Code Generator",
    description:
      "Create custom QR codes for URLs, WiFi, vCards, events, and more. Advanced styling options and bulk generation.",
    primaryColor: "#7c3aed",
    logo: "/logos/pixora-qr.svg",
    favicon: "/favicons/pixora-qr.ico",
    enableAds: true,
    adSlots: {
      header: "qr-header-banner",
      beforeCanvas: "qr-before-canvas",
      afterCanvas: "qr-after-canvas",
    },
    tools: [
      "qr-code-generator",
      "wifi-qr-code-generator",
      "email-qr-code-generator",
      "vcard-qr-code-generator",
      "event-qr-code-generator",
    ],
    seoKeywords: ["qr code generator", "qr code maker", "wifi qr code", "vcard qr code", "custom qr code"],
  },
]

export const APP_CONFIG: AppConfig = {
  enableAds: true,
  adsensePublisherId: process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || "ca-pub-4755003409431265",
  enableAutoAds: false, // Disabled for policy compliance
  enableAnalytics: true,
  enableSearch: true,
  maxFileSize: 100,
  maxFiles: 20,
  supportEmail: "support@pixoratools.com",
  apiUrl: process.env.NEXT_PUBLIC_API_URL,
  databaseUrl: process.env.DATABASE_URL,
  domains: DOMAIN_CONFIGS,
}

export function getConfig(): AppConfig {
  return APP_CONFIG
}

export function getDomainConfig(hostname: string): DomainConfig {
  const domain = DOMAIN_CONFIGS.find((d) => d.domain === hostname) || DOMAIN_CONFIGS[0]
  return domain
}

export function getCurrentDomain(): DomainConfig {
  if (typeof window !== "undefined") {
    return getDomainConfig(window.location.hostname)
  }
  return DOMAIN_CONFIGS[0] // Default to main domain on server
}
