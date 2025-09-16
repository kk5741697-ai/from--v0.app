"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SearchDialog } from "@/components/search/search-dialog"
import { APP_CONFIG } from "@/lib/config"
import { 
  Maximize, Crop, FileImage, ArrowUpDown, Edit3, Zap, ImageIcon, Download, Palette, Upload, Archive,
  FileType, QrCode, Code, TrendingUp, Wrench, Globe, Scissors, Lock, RefreshCw, Search
} from "lucide-react"
import Link from "next/link"

import { AdBanner } from "@/components/ads/ad-banner"

const featuredTools = [
  {
    title: "Compress Image",
    description: "Compress JPG, PNG, WebP, and GIFs while saving space and maintaining quality.",
    href: "/image-compressor",
    icon: Archive,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    title: "Resize Image",
    description: "Define your dimensions by percent or pixel, and resize your images with presets.",
    href: "/image-resizer",
    icon: Maximize,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    title: "Crop Image",
    description: "Crop images with precision using our visual editor and aspect ratio presets.",
    href: "/image-cropper",
    icon: Crop,
    iconBg: "bg-cyan-100",
    iconColor: "text-cyan-600",
  },
  {
    title: "Merge PDF",
    description: "Combine multiple PDF files into one document with custom page ordering.",
    href: "/pdf-merger",
    icon: FileType,
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
  },
  {
    title: "Convert Image",
    description: "Convert between JPG, PNG, WebP, and other formats with quality control.",
    href: "/image-converter",
    icon: RefreshCw,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
  },
  {
    title: "QR Code Generator",
    description: "Create custom QR codes with logos, colors, and multiple data types.",
    href: "/qr-code-generator",
    icon: QrCode,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    isNew: true,
  },
  {
    title: "JSON Formatter",
    description: "Beautify, validate, and minify JSON data with syntax highlighting.",
    href: "/json-formatter",
    icon: Code,
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-600",
  },
  {
    title: "Split PDF",
    description: "Split large PDF files into smaller documents by page ranges or selections.",
    href: "/pdf-splitter",
    icon: Scissors,
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
  },
  {
    title: "Password Generator",
    description: "Generate secure passwords with customizable length and character options.",
    href: "/password-generator",
    icon: Lock,
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
  },
  {
    title: "Remove background",
    description: "Remove image backgrounds automatically with AI-powered edge detection.",
    href: "/background-remover",
    icon: ImageIcon,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    isNew: true,
  },
  {
    title: "SEO Meta Generator",
    description: "Generate optimized meta tags, Open Graph, and Twitter Card tags for better SEO.",
    href: "/seo-meta-generator",
    icon: TrendingUp,
    iconBg: "bg-cyan-100",
    iconColor: "text-cyan-600",
  },
  {
    title: "Image Watermark",
    description: "Add text or logo watermarks to your images with opacity and position controls.",
    href: "/image-watermark",
    icon: Edit3,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
]

const toolCategories = [
  { name: "All Tools", href: "/", active: true },
  { name: "PDF Tools", href: "/pdf-tools", active: false },
  { name: "Image Tools", href: "/image-tools", active: false },
  { name: "QR Tools", href: "/qr-tools", active: false },
  { name: "Text Tools", href: "/text-tools", active: false },
  { name: "SEO Tools", href: "/seo-tools", active: false },
  { name: "Utilities", href: "/utilities", active: false },
]

export default function HomePage() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  return (
    <>
      <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20 lg:py-32 px-4 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-60 right-32 w-48 h-48 bg-purple-500 rounded-full blur-2xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-32 left-1/3 w-56 h-56 bg-indigo-500 rounded-full blur-3xl animate-pulse delay-2000"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-cyan-500 rounded-full blur-2xl animate-pulse delay-3000"></div>
        </div>
        
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center space-x-2 bg-white/90 backdrop-blur-md rounded-full px-8 py-3 border border-gray-200 shadow-xl mb-8 hover:shadow-2xl transition-all duration-300">
              <Wrench className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-bold text-gray-800 tracking-wide">300+ Professional Tools</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-black text-gray-900 mb-8 leading-tight tracking-tight">
            <span className="block">Every Tool You Could Want</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 animate-gradient-x">
              To Edit Files in Bulk
            </span>
          </h1>
          <p className="text-xl md:text-2xl lg:text-3xl text-gray-700 mb-12 lg:mb-20 max-w-5xl mx-auto leading-relaxed font-medium">
            Your complete online toolkit is here and forever free! Process PDFs, edit images, generate QR codes, format code, and more with 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 font-bold"> 300+ professional tools</span>.
            <span className="block mt-4 text-lg lg:text-xl font-bold text-gray-900 bg-yellow-100 inline-block px-4 py-2 rounded-full">
              ⚡ Fast • 🔒 Secure • 🆓 Completely Free
            </span>
          </p>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto mb-16 lg:mb-20">
            <div 
              className="relative cursor-pointer"
              onClick={() => setIsSearchOpen(true)}
            >
              <div className="flex items-center space-x-4 bg-white/95 backdrop-blur-md rounded-3xl border-2 border-gray-200 shadow-2xl px-8 py-5 hover:shadow-3xl hover:border-blue-300 transition-all duration-300 group">
                <Search className="h-7 w-7 text-gray-400 group-hover:text-blue-500 transition-colors" />
                <span className="text-gray-500 text-xl flex-1 text-left group-hover:text-gray-700 transition-colors">Search 300+ professional tools...</span>
                <kbd className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-bold shadow-inner group-hover:from-blue-100 group-hover:to-blue-200 transition-all">⌘K</kbd>
              </div>
            </div>
          </div>

          {/* Tool Categories */}
          <div className="flex flex-wrap justify-center gap-4 lg:gap-6 mb-16 lg:mb-20">
            {toolCategories.map((category) => (
              <Link
                key={category.name}
                href={category.href}
              >
                <Button
                  variant={category.active ? "default" : "outline"} 
                  className={`px-8 lg:px-10 py-3 lg:py-4 rounded-full transition-all duration-300 font-bold text-sm lg:text-base ${
                    category.active
                      ? "bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 shadow-2xl scale-110 border-2 border-white"
                      : "bg-white/90 backdrop-blur-md text-gray-800 border-2 border-gray-300 hover:bg-white hover:shadow-xl hover:scale-105 hover:border-blue-400 hover:text-blue-700"
                  }`}
                >
                  {category.name}
                </Button>
              </Link>
            ))}
          </div>

          {/* Featured Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 lg:gap-10">
            {featuredTools.map((tool) => {
              const Icon = tool.icon
              return (
                <Link
                  key={tool.title}
                  href={tool.href}
                  className="block bg-white/95 backdrop-blur-md rounded-3xl border-2 border-gray-200 p-8 lg:p-10 hover:shadow-3xl hover:-translate-y-3 hover:scale-105 transition-all duration-500 cursor-pointer group hover:border-blue-300 relative overflow-hidden"
                >
                  {/* Hover gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 via-purple-50/0 to-indigo-50/0 group-hover:from-blue-50/50 group-hover:via-purple-50/30 group-hover:to-indigo-50/50 transition-all duration-500 rounded-3xl"></div>
                  
                  <div className="relative z-10">
                  {tool.isNew && (
                    <Badge className="mb-4 lg:mb-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs lg:text-sm font-bold px-4 py-2 shadow-lg animate-pulse">
                      New!
                    </Badge>
                  )}
                  <div className={`inline-flex p-4 lg:p-5 rounded-3xl ${tool.iconBg} mb-6 lg:mb-8 group-hover:scale-125 group-hover:rotate-3 transition-all duration-500 shadow-xl group-hover:shadow-2xl`}>
                    <Icon className={`h-7 w-7 lg:h-9 lg:w-9 ${tool.iconColor} group-hover:scale-110 transition-transform duration-300`} />
                  </div>
                  <h3 className="font-heading font-black text-xl lg:text-2xl text-gray-900 mb-3 lg:mb-4 text-left group-hover:text-blue-600 transition-colors leading-tight">
                    {tool.title}
                  </h3>
                  <p className="text-base lg:text-lg text-gray-600 text-left leading-relaxed group-hover:text-gray-700 transition-colors">
                    {tool.description}
                  </p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24 px-4 bg-gradient-to-br from-white via-gray-50 to-blue-50">
        <div className="max-w-6xl mx-auto">
          {/* Ad Banner in Features Section */}
          <div className="mb-12 lg:mb-16 text-center">
            <AdBanner 
              adSlot="1234567890"
              adFormat="auto"
              className="max-w-4xl mx-auto"
              mobileOptimized={true}
            />
          </div>
          
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-heading font-black text-gray-900 mb-6 tracking-tight">
              Why Choose PixoraTools?
            </h2>
            <p className="text-lg lg:text-xl text-gray-700 max-w-3xl mx-auto font-medium">
              Professional-grade tools with enterprise features, trusted by millions worldwide
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            <div className="text-center group">
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-4 lg:p-6 rounded-2xl w-16 h-16 lg:w-20 lg:h-20 mx-auto mb-6 flex items-center justify-center shadow-xl group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
                <Zap className="h-8 w-8 lg:h-10 lg:w-10 text-blue-600 group-hover:text-blue-700" />
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">Lightning Fast</h3>
              <p className="text-base lg:text-lg text-gray-600 leading-relaxed">
                Process files instantly with our optimized algorithms and advanced client-side processing technology
              </p>
            </div>
            
            <div className="text-center group">
              <div className="bg-gradient-to-br from-green-100 to-emerald-200 p-4 lg:p-6 rounded-2xl w-16 h-16 lg:w-20 lg:h-20 mx-auto mb-6 flex items-center justify-center shadow-xl group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
                <Lock className="h-8 w-8 lg:h-10 lg:w-10 text-green-600 group-hover:text-green-700" />
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors">100% Secure</h3>
              <p className="text-base lg:text-lg text-gray-600 leading-relaxed">
                Your files are processed locally in your browser with enterprise-grade security. Zero server uploads
              </p>
            </div>
            
            <div className="text-center group">
              <div className="bg-gradient-to-br from-purple-100 to-violet-200 p-4 lg:p-6 rounded-2xl w-16 h-16 lg:w-20 lg:h-20 mx-auto mb-6 flex items-center justify-center shadow-xl group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
                <Globe className="h-8 w-8 lg:h-10 lg:w-10 text-purple-600 group-hover:text-purple-700" />
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">Always Available</h3>
              <p className="text-base lg:text-lg text-gray-600 leading-relaxed">
                Access 300+ professional tools anytime, anywhere. No downloads, no installations required
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tool Categories Section */}
      <section className="py-16 lg:py-24 px-4 bg-gradient-to-br from-gray-50 via-white to-indigo-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-heading font-black text-gray-900 mb-6 tracking-tight">
              Explore Tool Categories
            </h2>
            <p className="text-lg lg:text-xl text-gray-700 font-medium">
              Specialized tool collections for professional workflows and productivity
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            <Link href="/pdf-tools" className="group">
              <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 lg:p-8 border-2 border-gray-200 hover:shadow-2xl hover:-translate-y-2 hover:scale-105 transition-all duration-500 group-hover:border-red-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-red-50/0 to-red-100/0 group-hover:from-red-50/50 group-hover:to-red-100/30 transition-all duration-500"></div>
                <div className="relative z-10">
                <div className="bg-gradient-to-br from-red-100 to-red-200 p-3 lg:p-4 rounded-2xl w-12 h-12 lg:w-16 lg:h-16 mb-4 lg:mb-6 group-hover:scale-125 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                  <FileType className="h-6 w-6 lg:h-8 lg:w-8 text-red-600" />
                </div>
                <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-3 group-hover:text-red-600 transition-colors">
                  PDF Tools
                </h3>
                <p className="text-sm lg:text-base text-gray-600 mb-3 lg:mb-4 font-medium">
                  34 tools for PDF manipulation
                </p>
                <Badge variant="secondary" className="text-xs lg:text-sm hidden lg:inline-flex font-semibold">
                  pixorapdf.com
                </Badge>
                </div>
              </div>
            </Link>
            
            <Link href="/image-tools" className="group">
              <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 lg:p-8 border-2 border-gray-200 hover:shadow-2xl hover:-translate-y-2 hover:scale-105 transition-all duration-500 group-hover:border-blue-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-blue-100/0 group-hover:from-blue-50/50 group-hover:to-blue-100/30 transition-all duration-500"></div>
                <div className="relative z-10">
                <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-3 lg:p-4 rounded-2xl w-12 h-12 lg:w-16 lg:h-16 mb-4 lg:mb-6 group-hover:scale-125 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                  <ImageIcon className="h-6 w-6 lg:h-8 lg:w-8 text-blue-600" />
                </div>
                <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                  Image Tools
                </h3>
                <p className="text-sm lg:text-base text-gray-600 mb-3 lg:mb-4 font-medium">
                  41 tools for image editing
                </p>
                <Badge variant="secondary" className="text-xs lg:text-sm hidden lg:inline-flex font-semibold">
                  pixoraimg.com
                </Badge>
                </div>
              </div>
            </Link>
            
            <Link href="/qr-tools" className="group">
              <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 lg:p-8 border-2 border-gray-200 hover:shadow-2xl hover:-translate-y-2 hover:scale-105 transition-all duration-500 group-hover:border-green-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-50/0 to-green-100/0 group-hover:from-green-50/50 group-hover:to-green-100/30 transition-all duration-500"></div>
                <div className="relative z-10">
                <div className="bg-gradient-to-br from-green-100 to-green-200 p-3 lg:p-4 rounded-2xl w-12 h-12 lg:w-16 lg:h-16 mb-4 lg:mb-6 group-hover:scale-125 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                  <QrCode className="h-6 w-6 lg:h-8 lg:w-8 text-green-600" />
                </div>
                <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors">
                  QR & Barcode
                </h3>
                <p className="text-sm lg:text-base text-gray-600 mb-3 lg:mb-4 font-medium">
                  23 tools for QR generation
                </p>
                <Badge variant="secondary" className="text-xs lg:text-sm hidden lg:inline-flex font-semibold">
                  pixoraqrcode.com
                </Badge>
                </div>
              </div>
            </Link>
            
            <Link href="/text-tools" className="group">
              <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 lg:p-8 border-2 border-gray-200 hover:shadow-2xl hover:-translate-y-2 hover:scale-105 transition-all duration-500 group-hover:border-yellow-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/0 to-orange-100/0 group-hover:from-yellow-50/50 group-hover:to-orange-100/30 transition-all duration-500"></div>
                <div className="relative z-10">
                <div className="bg-gradient-to-br from-yellow-100 to-orange-200 p-3 lg:p-4 rounded-2xl w-12 h-12 lg:w-16 lg:h-16 mb-4 lg:mb-6 group-hover:scale-125 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                  <Code className="h-6 w-6 lg:h-8 lg:w-8 text-orange-600" />
                </div>
                <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">
                  Code Tools
                </h3>
                <p className="text-sm lg:text-base text-gray-600 mb-3 lg:mb-4 font-medium">
                  52 tools for developers
                </p>
                <Badge variant="secondary" className="text-xs lg:text-sm hidden lg:inline-flex font-semibold">
                  pixoracode.com
                </Badge>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28 px-4 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h2 className="text-4xl lg:text-5xl font-heading font-black text-white mb-6 tracking-tight">
            Ready to boost your productivity?
          </h2>
          <p className="text-xl lg:text-2xl text-blue-100 mb-10 lg:mb-12 font-medium leading-relaxed">
            Join over 2 million professionals who trust PixoraTools for their daily workflows
          </p>
          <div className="flex flex-col sm:flex-row gap-4 lg:gap-6 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 lg:px-12 py-4 lg:py-5 text-lg lg:text-xl font-bold rounded-2xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300">
              Get Started Free
            </Button>
            <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/20 px-8 lg:px-12 py-4 lg:py-5 text-lg lg:text-xl font-bold rounded-2xl backdrop-blur-md hover:scale-105 transition-all duration-300">
              View All Tools
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>

      <SearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </>
  )
}