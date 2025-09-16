import { Header } from "@/components/header"
import { ToolCard } from "@/components/tool-card"
import { FileText, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AdBanner } from "@/components/ads/ad-banner"

export function generateViewport() {
  return {
    width: 'device-width',
    initialScale: 1,
    themeColor: '#3b82f6',
  }
}

const textTools = [
  {
    title: "JSON Formatter",
    description: "Beautify, validate, and minify JSON data with syntax highlighting and error detection.",
    href: "/json-formatter",
    icon: FileText,
    category: "Text Tools",
  },
  {
    title: "Base64 Encoder/Decoder",
    description: "Encode text to Base64 or decode Base64 strings back to text with URL-safe options.",
    href: "/base64-encoder",
    icon: FileText,
    category: "Text Tools",
  },
  {
    title: "URL Encoder/Decoder",
    description: "Encode URLs and query parameters or decode URL-encoded strings for web development.",
    href: "/url-encoder",
    icon: FileText,
    category: "Text Tools",
  },
  {
    title: "Text Case Converter",
    description: "Convert text between different cases: lowercase, UPPERCASE, Title Case, camelCase, and more.",
    href: "/text-case-converter",
    icon: FileText,
    category: "Text Tools",
  },
  {
    title: "Hash Generator",
    description: "Generate MD5, SHA-1, SHA-256, and SHA-512 hashes for data integrity and security.",
    href: "/hash-generator",
    icon: FileText,
    category: "Text Tools",
  },
  {
    title: "XML Formatter",
    description: "Format, validate, and beautify XML documents with syntax highlighting and error detection.",
    href: "/xml-formatter",
    icon: FileText,
    category: "Text Tools",
  },
  {
    title: "HTML Formatter",
    description: "Clean up and format HTML code with proper indentation and syntax highlighting.",
    href: "/html-formatter",
    icon: FileText,
    category: "Text Tools",
  },
  {
    title: "CSS Minifier",
    description: "Minify CSS code to reduce file size and improve website loading performance.",
    href: "/css-minifier",
    icon: FileText,
    category: "Text Tools",
  },
  {
    title: "JavaScript Minifier",
    description: "Compress JavaScript code while preserving functionality to optimize web performance.",
    href: "/js-minifier",
    icon: FileText,
    category: "Text Tools",
  },
]

export default function TextToolsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Unified Before Canvas Ad */}
      <div className="unified-before-canvas bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <AdBanner 
            adSlot="unified-before-canvas"
            adFormat="auto"
            className="max-w-4xl mx-auto"
            mobileOptimized={true}
            persistent={true}
          />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-6 hover:bg-green-50 hover:text-green-600 transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>

          <div className="flex items-center space-x-4 mb-6">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-green-100 to-green-200 shadow-lg">
              <FileText className="h-10 w-10 text-green-600" />
            </div>
            <div>
              <h1 className="text-4xl font-heading font-black text-foreground tracking-tight">Text & Code Tools</h1>
              <p className="text-lg text-muted-foreground font-medium">
                52 professional tools for formatting, validating, and converting text and code
              </p>
            </div>
          </div>
        </div>

        {/* Rich Content Section */}
        <div className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/95 backdrop-blur-md p-8 rounded-2xl border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <h3 className="font-bold text-xl mb-4 text-green-600">Developer-Focused Tools</h3>
              <p className="text-muted-foreground leading-relaxed">
                Essential tools for developers and content creators. Format, validate, minify, and convert 
                code and text with professional-grade processing and syntax highlighting.
              </p>
            </div>
            <div className="bg-white/95 backdrop-blur-md p-8 rounded-2xl border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <h3 className="font-bold text-xl mb-4 text-blue-600">Code Quality Tools</h3>
              <ul className="text-muted-foreground space-y-2">
                <li>• JSON formatting and validation</li>
                <li>• HTML/CSS beautification</li>
                <li>• JavaScript minification</li>
                <li>• XML processing and validation</li>
              </ul>
            </div>
            <div className="bg-white/95 backdrop-blur-md p-8 rounded-2xl border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <h3 className="font-bold text-xl mb-4 text-purple-600">Development Workflows</h3>
              <ul className="text-muted-foreground space-y-2">
                <li>• API development and testing</li>
                <li>• Code optimization and cleanup</li>
                <li>• Data format conversion</li>
                <li>• Security and encoding tools</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {textTools.map((tool) => (
            <ToolCard key={tool.title} {...tool} />
          ))}
        </div>

        {/* Unified After Canvas Ad */}
        <div className="unified-after-canvas bg-white border-t mt-12">
          <div className="container mx-auto px-4 py-3">
            <AdBanner 
              adSlot="unified-after-canvas"
              adFormat="auto"
              className="max-w-4xl mx-auto"
              mobileOptimized={true}
              persistent={true}
            />
          </div>
        </div>

        {/* Additional Rich Content */}
        <div className="mt-16 bg-gradient-to-br from-green-50 via-white to-cyan-50 p-12 rounded-3xl border-2 border-green-100 shadow-xl">
          <h2 className="text-3xl font-black text-center mb-8 text-gray-900">Essential Developer Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <h3 className="font-bold text-xl mb-4 text-green-600">Code Formatting Excellence</h3>
              <p className="text-muted-foreground leading-relaxed">
                Transform messy code into clean, readable format. Our tools support all major programming 
                languages and data formats with intelligent formatting and error detection.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-xl mb-4 text-blue-600">Performance Optimization</h3>
              <p className="text-muted-foreground leading-relaxed">
                Optimize your code for production with minification, compression, and validation tools. 
                Reduce file sizes and improve website performance with professional-grade optimization.
              </p>
            </div>
          </div>
        </div>

        {/* Coming Soon */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">More text and code tools coming soon!</p>
          <p className="text-sm text-muted-foreground">
            Have a suggestion?{" "}
            <Link href="/contact" className="text-accent hover:underline">
              Let us know
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
