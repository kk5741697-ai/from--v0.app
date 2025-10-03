"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { SearchDialog } from "@/components/search/search-dialog"
import { EnhancedAdSense } from "@/components/ads/enhanced-adsense-manager"
import {
  Search, FileText, Image, QrCode, Code2, TrendingUp,
  Wrench, Shield, Zap, Globe, ChevronRight, Star
} from "lucide-react"

const categories = [
  { name: "PDF Tools", href: "/pdf-tools", icon: FileText, color: "#dc2626", count: 34 },
  { name: "Image Tools", href: "/image-tools", icon: Image, color: "#2563eb", count: 41 },
  { name: "QR Tools", href: "/qr-tools", icon: QrCode, color: "#16a34a", count: 23 },
  { name: "Text Tools", href: "/text-tools", icon: Code2, color: "#ea580c", count: 52 },
  { name: "SEO Tools", href: "/seo-tools", icon: TrendingUp, color: "#0891b2", count: 28 },
  { name: "Utilities", href: "/utilities", icon: Wrench, color: "#7c3aed", count: 36 },
]

const featuredTools = [
  { title: "Compress Image", icon: "Archive", href: "/image-compressor", category: "IMAGE" },
  { title: "Merge PDF", icon: "FileText", href: "/pdf-merger", category: "PDF" },
  { title: "Resize Image", icon: "Maximize", href: "/image-resizer", category: "IMAGE" },
  { title: "Split PDF", icon: "Scissors", href: "/pdf-splitter", category: "PDF" },
  { title: "QR Generator", icon: "QrCode", href: "/qr-code-generator", category: "QR", isNew: true },
  { title: "JSON Formatter", icon: "Code", href: "/json-formatter", category: "TEXT" },
]

export default function HomePage() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  return (
    <>
      <div className="min-h-screen bg-gray-50/50">
        <Header />

        {/* Hero Section - Clean & Simple */}
        <section className="bg-white border-b">
          <div className="container mx-auto px-4 py-12 md:py-16">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
                Every tool you need to work with digital files
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-8">
                Fast, secure, and free online tools for PDF, images, QR codes, and more
              </p>

              {/* Search Bar */}
              <div
                className="max-w-2xl mx-auto mb-8"
                onClick={() => setIsSearchOpen(true)}
              >
                <div className="relative cursor-pointer group">
                  <div className="flex items-center bg-white border-2 border-gray-200 rounded-xl px-4 py-3 group-hover:border-blue-400 transition-colors shadow-sm group-hover:shadow-md">
                    <Search className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-500 flex-1 text-left">Search tools...</span>
                    <kbd className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-sm font-medium">
                      ⌘K
                    </kbd>
                  </div>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span>100% Secure</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-blue-600" />
                  <span>Lightning Fast</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-purple-600" />
                  <span>2M+ Users</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* AdSense - Top Banner */}
        <div className="bg-white border-b py-4">
          <div className="container mx-auto px-4">
            <EnhancedAdSense
              adSlot="unified-before-canvas"
              adFormat="horizontal"
              className="max-w-5xl mx-auto"
              persistent={true}
            />
          </div>
        </div>

        {/* Tool Categories - Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                Choose a category
              </h2>
              <p className="text-gray-600">Professional tools for every workflow</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
              {categories.map((category) => {
                const Icon = category.icon
                return (
                  <Link key={category.name} href={category.href}>
                    <Card className="p-6 hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-gray-300 group">
                      <div className="flex items-center space-x-4">
                        <div
                          className="p-3 rounded-xl group-hover:scale-110 transition-transform"
                          style={{ backgroundColor: `${category.color}15` }}
                        >
                          <Icon className="h-6 w-6" style={{ color: category.color }} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {category.name}
                          </h3>
                          <p className="text-sm text-gray-500">{category.count} tools</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        {/* Popular Tools */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <div className="inline-flex items-center space-x-2 bg-yellow-100 px-3 py-1 rounded-full mb-3">
                <Star className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-700">Most Popular</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                Featured Tools
              </h2>
              <p className="text-gray-600">Start with our most loved tools</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 max-w-6xl mx-auto">
              {featuredTools.map((tool) => (
                <Link key={tool.title} href={tool.href}>
                  <Card className="p-4 hover:shadow-md transition-all duration-200 cursor-pointer text-center group border hover:border-blue-200 relative">
                    {tool.isNew && (
                      <Badge className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5">
                        New
                      </Badge>
                    )}
                    <div className="mb-3">
                      <div className="w-12 h-12 mx-auto bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                        <FileText className="h-6 w-6 text-gray-600 group-hover:text-blue-600 transition-colors" />
                      </div>
                    </div>
                    <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                      {tool.title}
                    </h3>
                  </Card>
                </Link>
              ))}
            </div>

            <div className="text-center mt-8">
              <Button variant="outline" size="lg" asChild>
                <Link href="/pdf-tools">
                  View All Tools
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* AdSense - Bottom Banner */}
        <div className="bg-gray-50 border-t border-b py-4">
          <div className="container mx-auto px-4">
            <EnhancedAdSense
              adSlot="unified-after-canvas"
              adFormat="horizontal"
              className="max-w-5xl mx-auto"
              persistent={true}
            />
          </div>
        </div>

        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  Why choose PixoraTools?
                </h2>
                <p className="text-gray-600">Professional-grade tools, completely free</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">100% Secure</h3>
                  <p className="text-gray-600 text-sm">
                    All files are processed locally in your browser. Your data never leaves your device.
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Zap className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Lightning Fast</h3>
                  <p className="text-gray-600 text-sm">
                    Instant processing with advanced algorithms. No waiting, no uploads required.
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Globe className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Always Free</h3>
                  <p className="text-gray-600 text-sm">
                    Access all tools without limits. No subscriptions, no hidden fees.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>

      <SearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </>
  )
}
