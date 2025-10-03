"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Search, Menu, X, FileText, Image, QrCode, Code2, TrendingUp, Wrench } from "lucide-react"
import { useState } from "react"
import { EnhancedSearchDialog } from "@/components/search/enhanced-search-dialog"

const navigationItems = [
  { name: "PDF", href: "/pdf-tools", icon: FileText },
  { name: "Image", href: "/image-tools", icon: Image },
  { name: "QR Code", href: "/qr-tools", icon: QrCode },
  { name: "Text", href: "/text-tools", icon: Code2 },
  { name: "SEO", href: "/seo-tools", icon: TrendingUp },
  { name: "More", href: "/utilities", icon: Wrench },
]

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <Wrench className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">PixoraTools</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant="ghost"
                    className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 font-medium"
                  >
                    <Icon className="h-4 w-4 mr-1.5" />
                    {item.name}
                  </Button>
                </Link>
              )
            })}
          </nav>

          {/* Search and Actions */}
          <div className="flex items-center space-x-2">
            {/* Search Button */}
            <Button
              variant="outline"
              onClick={() => setIsSearchOpen(true)}
              className="hidden sm:flex items-center space-x-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50"
            >
              <Search className="h-4 w-4" />
              <span className="text-gray-600">Search</span>
            </Button>

            {/* Mobile Search */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsSearchOpen(true)}
              className="sm:hidden border-gray-300"
            >
              <Search className="h-4 w-4" />
            </Button>

            {/* Mobile Menu */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden border-gray-300"
            >
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t py-4">
            <nav className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link key={item.name} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {item.name} Tools
                    </Button>
                  </Link>
                )
              })}
            </nav>
          </div>
        )}
      </div>

      <EnhancedSearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </header>
  )
}
