import {
  FileText,
  ImageIcon,
  QrCode,
  Code,
  TrendingUp,
  Scissors,
  Archive,
  RefreshCw,
  Lock,
  Shield,
  Eye,
  Palette,
  Maximize,
  Crop,
} from "lucide-react"

export interface SearchResult {
  title: string
  description: string
  href: string
  category: string
  icon: any
  score: number
  keywords: string[]
  popularity: number
}

const toolsDatabase: SearchResult[] = [
  // PDF Tools
  {
    title: "PDF Merger",
    description: "Combine multiple PDF files into one document with custom page ordering and bookmarks",
    href: "/pdf-merger",
    category: "PDF",
    icon: FileText,
    score: 0,
    keywords: ["merge", "combine", "join", "unite", "concatenate", "pdf", "documents"],
    popularity: 95,
  },
  {
    title: "PDF Splitter",
    description: "Split large PDF files into smaller documents by page ranges, bookmarks, or selections",
    href: "/pdf-splitter",
    category: "PDF",
    icon: Scissors,
    score: 0,
    keywords: ["split", "divide", "separate", "extract", "pages", "pdf", "break"],
    popularity: 88,
  },
  {
    title: "PDF Compressor",
    description: "Reduce PDF file size while maintaining quality using advanced compression algorithms",
    href: "/pdf-compressor",
    category: "PDF",
    icon: Archive,
    score: 0,
    keywords: ["compress", "reduce", "optimize", "shrink", "size", "pdf", "smaller"],
    popularity: 92,
  },
  {
    title: "PDF to Image",
    description: "Convert PDF pages to high-quality JPG, PNG, or WebP images with custom DPI settings",
    href: "/pdf-to-image",
    category: "PDF",
    icon: ImageIcon,
    score: 0,
    keywords: ["convert", "pdf", "image", "jpg", "png", "webp", "export", "pages"],
    popularity: 85,
  },
  {
    title: "PDF Password Protector",
    description: "Add password protection and encryption to PDF files for enhanced security",
    href: "/pdf-password-protector",
    category: "PDF",
    icon: Lock,
    score: 0,
    keywords: ["password", "protect", "encrypt", "secure", "lock", "pdf", "security"],
    popularity: 78,
  },

  // Image Tools
  {
    title: "Image Compressor",
    description: "Compress JPG, PNG, WebP, and GIF images while preserving quality and reducing file size",
    href: "/image-compressor",
    category: "Image",
    icon: Archive,
    score: 0,
    keywords: ["compress", "optimize", "reduce", "image", "jpg", "png", "webp", "size"],
    popularity: 96,
  },
  {
    title: "Image Resizer",
    description: "Resize images with presets, custom dimensions, and maintain aspect ratios",
    href: "/image-resizer",
    category: "Image",
    icon: Maximize,
    score: 0,
    keywords: ["resize", "scale", "dimensions", "width", "height", "image", "pixels"],
    popularity: 94,
  },
  {
    title: "Image Cropper",
    description: "Crop images with precision using visual editor, aspect ratio presets, and grid guides",
    href: "/image-cropper",
    category: "Image",
    icon: Crop,
    score: 0,
    keywords: ["crop", "cut", "trim", "select", "area", "image", "rectangle"],
    popularity: 89,
  },
  {
    title: "Image Converter",
    description: "Convert between JPG, PNG, WebP, GIF, and other formats with quality control",
    href: "/image-converter",
    category: "Image",
    icon: RefreshCw,
    score: 0,
    keywords: ["convert", "format", "jpg", "png", "webp", "gif", "image", "change"],
    popularity: 91,
  },
  {
    title: "Image Watermark",
    description: "Add text or logo watermarks to images with opacity, position, and style controls",
    href: "/image-watermark",
    category: "Image",
    icon: Palette,
    score: 0,
    keywords: ["watermark", "logo", "text", "overlay", "brand", "image", "copyright"],
    popularity: 76,
  },

  // QR Tools
  {
    title: "QR Code Generator",
    description: "Create custom QR codes with logos, colors, multiple data types, and advanced styling",
    href: "/qr-code-generator",
    category: "QR",
    icon: QrCode,
    score: 0,
    keywords: ["qr", "code", "generate", "create", "barcode", "scan", "url", "text"],
    popularity: 93,
  },
  {
    title: "QR Scanner",
    description: "Scan and decode QR codes from uploaded images with batch processing support",
    href: "/qr-scanner",
    category: "QR",
    icon: Eye,
    score: 0,
    keywords: ["scan", "read", "decode", "qr", "code", "barcode", "image", "detect"],
    popularity: 82,
  },
  {
    title: "Bulk QR Generator",
    description: "Generate multiple QR codes at once from CSV data or text lists with batch export",
    href: "/bulk-qr-generator",
    category: "QR",
    icon: QrCode,
    score: 0,
    keywords: ["bulk", "batch", "multiple", "qr", "generate", "csv", "list", "mass"],
    popularity: 71,
  },

  // Text Tools
  {
    title: "JSON Formatter",
    description: "Format, validate, and beautify JSON data with syntax highlighting and error detection",
    href: "/json-formatter",
    category: "Text",
    icon: Code,
    score: 0,
    keywords: ["json", "format", "validate", "beautify", "pretty", "syntax", "code"],
    popularity: 87,
  },
  {
    title: "Base64 Encoder",
    description: "Encode and decode Base64 data with support for text, images, and files",
    href: "/base64-encoder",
    category: "Text",
    icon: Code,
    score: 0,
    keywords: ["base64", "encode", "decode", "text", "image", "file", "convert"],
    popularity: 74,
  },
  {
    title: "Hash Generator",
    description: "Generate MD5, SHA-1, SHA-256, and other cryptographic hashes for text and files",
    href: "/hash-generator",
    category: "Text",
    icon: Shield,
    score: 0,
    keywords: ["hash", "md5", "sha", "checksum", "crypto", "security", "generate"],
    popularity: 69,
  },

  // SEO Tools
  {
    title: "SEO Meta Generator",
    description: "Generate optimized meta tags, Open Graph, and Twitter Card tags for better SEO",
    href: "/seo-meta-generator",
    category: "SEO",
    icon: TrendingUp,
    score: 0,
    keywords: ["seo", "meta", "tags", "opengraph", "twitter", "social", "optimization"],
    popularity: 83,
  },

  // Utilities
  {
    title: "Password Generator",
    description: "Generate secure passwords with customizable length, characters, and complexity options",
    href: "/password-generator",
    category: "Utilities",
    icon: Lock,
    score: 0,
    keywords: ["password", "generate", "secure", "random", "strong", "characters"],
    popularity: 90,
  },
]

// Advanced search algorithm with fuzzy matching and scoring
export function searchTools(query: string, limit = 20): SearchResult[] {
  if (!query.trim()) return []

  const searchTerms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((term) => term.length > 0)

  const results = toolsDatabase.map((tool) => {
    let score = 0
    const titleLower = tool.title.toLowerCase()
    const descriptionLower = tool.description.toLowerCase()
    const categoryLower = tool.category.toLowerCase()
    const keywordsLower = tool.keywords.map((k) => k.toLowerCase())

    // Exact title match (highest score)
    if (titleLower === query.toLowerCase()) {
      score += 1000
    }

    // Title starts with query
    if (titleLower.startsWith(query.toLowerCase())) {
      score += 500
    }

    // Title contains query
    if (titleLower.includes(query.toLowerCase())) {
      score += 300
    }

    // Category exact match
    if (categoryLower === query.toLowerCase()) {
      score += 200
    }

    // Keyword exact matches
    keywordsLower.forEach((keyword) => {
      if (keyword === query.toLowerCase()) {
        score += 150
      } else if (keyword.includes(query.toLowerCase())) {
        score += 75
      }
    })

    // Description contains query
    if (descriptionLower.includes(query.toLowerCase())) {
      score += 50
    }

    // Multi-term search scoring
    searchTerms.forEach((term) => {
      if (titleLower.includes(term)) score += 100
      if (descriptionLower.includes(term)) score += 25
      if (categoryLower.includes(term)) score += 75
      keywordsLower.forEach((keyword) => {
        if (keyword.includes(term)) score += 50
      })
    })

    // Fuzzy matching for typos (simple Levenshtein-like)
    searchTerms.forEach((term) => {
      keywordsLower.forEach((keyword) => {
        if (keyword.length >= 3 && term.length >= 3) {
          const similarity = calculateSimilarity(term, keyword)
          if (similarity > 0.7) {
            score += Math.floor(similarity * 30)
          }
        }
      })
    })

    // Popularity boost
    score += Math.floor(tool.popularity / 10)

    return { ...tool, score }
  })

  return results
    .filter((tool) => tool.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

// Simple similarity calculation
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2
  const shorter = str1.length > str2.length ? str2 : str1

  if (longer.length === 0) return 1.0

  const editDistance = levenshteinDistance(longer, shorter)
  return (longer.length - editDistance) / longer.length
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix = []

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
      }
    }
  }

  return matrix[str2.length][str1.length]
}

// Get popular tools based on popularity score
export function getPopularTools(limit = 12): SearchResult[] {
  return toolsDatabase.sort((a, b) => b.popularity - a.popularity).slice(0, limit)
}

// Recent searches management (localStorage)
export function getRecentSearches(): string[] {
  if (typeof window === "undefined") return []

  try {
    const recent = localStorage.getItem("pixora-recent-searches")
    return recent ? JSON.parse(recent) : []
  } catch {
    return []
  }
}

export function addToRecentSearches(query: string): void {
  if (typeof window === "undefined" || !query.trim()) return

  try {
    const recent = getRecentSearches()
    const filtered = recent.filter((item) => item.toLowerCase() !== query.toLowerCase())
    const updated = [query, ...filtered].slice(0, 10) // Keep last 10 searches

    localStorage.setItem("pixora-recent-searches", JSON.stringify(updated))
  } catch {
    // Ignore localStorage errors
  }
}

// Search analytics (could be extended with actual analytics)
export function trackSearch(query: string, resultCount: number): void {
  // This could send data to analytics service
  console.log(`Search: "${query}" - ${resultCount} results`)
}
