import { Header } from "@/components/header"
import { ToolCard } from "@/components/tool-card"
import { ImageIcon, ArrowLeft } from "lucide-react"
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

const imageTools = [
  {
    title: "Image Resizer",
    description: "Resize, compress, and optimize images while maintaining quality. Supports batch processing.",
    href: "/image-resizer",
    icon: ImageIcon,
    category: "Image Tools",
  },
  {
    title: "Image Compressor",
    description: "Reduce image file sizes without losing quality. Perfect for web optimization and storage.",
    href: "/image-compressor",
    icon: ImageIcon,
    category: "Image Tools",
  },
  {
    title: "Image Converter",
    description: "Convert images between formats: JPEG, PNG, WebP, GIF, and more with quality controls.",
    href: "/image-converter",
    icon: ImageIcon,
    category: "Image Tools",
  },
  {
    title: "Image Cropper",
    description: "Crop images to specific dimensions or aspect ratios with precise pixel control.",
    href: "/image-cropper",
    icon: ImageIcon,
    category: "Image Tools",
  },
  {
    title: "Image Rotator",
    description: "Rotate and flip images in any direction with batch processing capabilities.",
    href: "/image-rotator",
    icon: ImageIcon,
    category: "Image Tools",
  },
  {
    title: "Image Flipper",
    description: "Flip images horizontally, vertically, or both directions with batch processing.",
    href: "/image-flipper",
    icon: ImageIcon,
    category: "Image Tools",
  },
  {
    title: "Image Filters",
    description: "Apply professional filters and adjustments: brightness, contrast, saturation, and effects.",
    href: "/image-filters",
    icon: ImageIcon,
    category: "Image Tools",
  },
]

export default function ImageToolsPage() {
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
            <Button variant="ghost" className="mb-6 hover:bg-purple-50 hover:text-purple-600 transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>

          <div className="flex items-center space-x-4 mb-6">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-200 shadow-lg">
              <ImageIcon className="h-10 w-10 text-purple-600" />
            </div>
            <div>
              <h1 className="text-4xl font-heading font-black text-foreground tracking-tight">Image Tools</h1>
              <p className="text-lg text-muted-foreground font-medium">
                Professional tools for editing, converting, and optimizing images
              </p>
            </div>
          </div>
        </div>

        {/* Rich Content Section */}
        <div className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/95 backdrop-blur-md p-8 rounded-2xl border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <h3 className="font-bold text-xl mb-4 text-purple-600">Professional Image Processing</h3>
              <p className="text-muted-foreground leading-relaxed">
                Transform your images with enterprise-grade tools. Resize, compress, convert, and enhance 
                images with unlimited file size support and professional quality results.
              </p>
            </div>
            <div className="bg-white/95 backdrop-blur-md p-8 rounded-2xl border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <h3 className="font-bold text-xl mb-4 text-blue-600">Advanced Features</h3>
              <ul className="text-muted-foreground space-y-2">
                <li>• Batch processing for multiple images</li>
                <li>• Lossless quality preservation</li>
                <li>• Format conversion and optimization</li>
                <li>• Professional watermarking tools</li>
              </ul>
            </div>
            <div className="bg-white/95 backdrop-blur-md p-8 rounded-2xl border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <h3 className="font-bold text-xl mb-4 text-green-600">Use Cases</h3>
              <ul className="text-muted-foreground space-y-2">
                <li>• Website optimization</li>
                <li>• Social media content</li>
                <li>• E-commerce product photos</li>
                <li>• Print material preparation</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {imageTools.map((tool) => (
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
        <div className="mt-16 bg-gradient-to-br from-purple-50 via-white to-blue-50 p-12 rounded-3xl border-2 border-purple-100 shadow-xl">
          <h2 className="text-3xl font-black text-center mb-8 text-gray-900">Why Choose Our Image Tools?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <h3 className="font-bold text-xl mb-4 text-purple-600">Enterprise Security</h3>
              <p className="text-muted-foreground leading-relaxed">
                All image processing happens locally in your browser. Your images never leave your device, 
                ensuring complete privacy and security for sensitive visual content.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-xl mb-4 text-blue-600">Professional Quality</h3>
              <p className="text-muted-foreground leading-relaxed">
                Advanced algorithms maintain image integrity while optimizing for your specific needs. 
                Perfect for professional photography, marketing materials, and creative projects.
              </p>
            </div>
          </div>
        </div>

        {/* Coming Soon */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">More image editing tools coming soon!</p>
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
