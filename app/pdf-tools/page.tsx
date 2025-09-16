import { Header } from "@/components/header"
import { ToolCard } from "@/components/tool-card"
import { FileType, ArrowLeft } from "lucide-react"
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

const pdfTools = [
  {
    title: "PDF Merger",
    description: "Combine multiple PDF files into one document with page selection and custom ordering.",
    href: "/pdf-merger",
    icon: FileType,
    category: "PDF Tools",
  },
  {
    title: "PDF Splitter",
    description: "Split PDF files into separate documents by page ranges or extract specific pages.",
    href: "/pdf-splitter",
    icon: FileType,
    category: "PDF Tools",
  },
  {
    title: "PDF Compressor",
    description: "Reduce PDF file sizes while maintaining document quality and readability.",
    href: "/pdf-compressor",
    icon: FileType,
    category: "PDF Tools",
  },
  {
    title: "PDF to Image",
    description: "Convert PDF pages to high-quality images in various formats (PNG, JPEG, WebP).",
    href: "/pdf-to-image",
    icon: FileType,
    category: "PDF Tools",
  },
  {
    title: "PDF to Word",
    description: "Convert PDF files to editable Word documents with OCR support for scanned documents.",
    href: "/pdf-to-word",
    icon: FileType,
    category: "PDF Tools",
    isPremium: true,
  },
  {
    title: "PDF Password Protector",
    description: "Add password protection and encryption to PDF documents for security.",
    href: "/pdf-password-protector",
    icon: FileType,
    category: "PDF Tools",
  },
  {
    title: "Image to PDF",
    description: "Convert multiple images into a single PDF document with custom page layouts.",
    href: "/image-to-pdf",
    icon: FileType,
    category: "PDF Tools",
  },
  {
    title: "PDF Unlock",
    description: "Remove password protection and restrictions from encrypted PDF files.",
    href: "/pdf-unlock",
    icon: FileType,
    category: "PDF Tools",
  },
  {
    title: "PDF Organizer",
    description: "Reorder, sort, and organize PDF pages. Remove blank pages and add page numbers.",
    href: "/pdf-organizer",
    icon: FileType,
    category: "PDF Tools",
  },
]

export default function PDFToolsPage() {
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
            <Button variant="ghost" className="mb-6 hover:bg-red-50 hover:text-red-600 transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>

          <div className="flex items-center space-x-4 mb-6">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-red-100 to-red-200 shadow-lg">
              <FileType className="h-10 w-10 text-red-600" />
            </div>
            <div>
              <h1 className="text-4xl font-heading font-black text-foreground tracking-tight">PDF Tools</h1>
              <p className="text-lg text-muted-foreground font-medium">
                34 professional tools for manipulating, converting, and optimizing PDFs
              </p>
            </div>
          </div>
        </div>

        {/* Rich Content Section */}
        <div className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/95 backdrop-blur-md p-8 rounded-2xl border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <h3 className="font-bold text-xl mb-4 text-red-600">Complete PDF Toolkit</h3>
              <p className="text-muted-foreground leading-relaxed">
                Professional PDF manipulation tools for businesses, legal professionals, and individuals. 
                Merge, split, compress, and convert PDF documents with enterprise-grade security.
              </p>
            </div>
            <div className="bg-white/95 backdrop-blur-md p-8 rounded-2xl border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <h3 className="font-bold text-xl mb-4 text-blue-600">Advanced Capabilities</h3>
              <ul className="text-muted-foreground space-y-2">
                <li>• Unlimited file size processing</li>
                <li>• Password protection and encryption</li>
                <li>• Watermarking and branding</li>
                <li>• Page organization and reordering</li>
              </ul>
            </div>
            <div className="bg-white/95 backdrop-blur-md p-8 rounded-2xl border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <h3 className="font-bold text-xl mb-4 text-green-600">Industry Applications</h3>
              <ul className="text-muted-foreground space-y-2">
                <li>• Legal document management</li>
                <li>• Business report compilation</li>
                <li>• Academic paper organization</li>
                <li>• Contract processing workflows</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pdfTools.map((tool) => (
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
        <div className="mt-16 bg-gradient-to-br from-red-50 via-white to-orange-50 p-12 rounded-3xl border-2 border-red-100 shadow-xl">
          <h2 className="text-3xl font-black text-center mb-8 text-gray-900">Enterprise PDF Solutions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <h3 className="font-bold text-xl mb-4 text-red-600">Security & Compliance</h3>
              <p className="text-muted-foreground leading-relaxed">
                Handle confidential documents with complete security. All processing happens locally, 
                ensuring GDPR compliance and protecting sensitive business information.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-xl mb-4 text-blue-600">Workflow Integration</h3>
              <p className="text-muted-foreground leading-relaxed">
                Streamline your document workflows with batch processing, automated organization, 
                and professional-grade output suitable for legal and business use.
              </p>
            </div>
          </div>
        </div>

        {/* Coming Soon */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">More PDF manipulation tools coming soon!</p>
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
