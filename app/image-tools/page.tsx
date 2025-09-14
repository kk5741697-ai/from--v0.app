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
    title: "Background Remover",
    description: "Remove backgrounds from images automatically using AI-powered detection.",
    href: "/background-remover",
    icon: ImageIcon,
    category: "Image Tools",
    isNew: true,
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
  {
    title: "Image Upscaler",
    description: "Enlarge images with AI-enhanced quality. Increase resolution while preserving details.",
    href: "/image-upscaler",
    icon: ImageIcon,
    category: "Image Tools",
    isNew: true,
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
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>

          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 rounded-lg bg-purple-500/10">
              <ImageIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-heading font-bold text-foreground">Image Tools</h1>
              <p className="text-muted-foreground">
                41 professional tools for editing, converting, and optimizing images
              </p>
            </div>
          </div>
        </div>

        {/* Rich Content Section */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="font-semibold text-lg mb-3">Professional Image Processing</h3>
              <p className="text-muted-foreground text-sm">
                Transform your images with enterprise-grade tools. Resize, compress, convert, and enhance 
                images with unlimited file size support and professional quality results.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="font-semibold text-lg mb-3">Advanced Features</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Batch processing for multiple images</li>
                <li>• Lossless quality preservation</li>
                <li>• Format conversion and optimization</li>
                <li>• Professional watermarking tools</li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="font-semibold text-lg mb-3">Use Cases</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
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
        <div className="mt-12 bg-gray-50 p-8 rounded-lg">
          <h2 className="text-2xl font-bold text-center mb-6">Why Choose Our Image Tools?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-lg mb-3">Enterprise Security</h3>
              <p className="text-muted-foreground">
                All image processing happens locally in your browser. Your images never leave your device, 
                ensuring complete privacy and security for sensitive visual content.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-3">Professional Quality</h3>
              <p className="text-muted-foreground">
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
