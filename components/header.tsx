"use client"

import { useState } from "react"
import { EnhancedSearchDialog } from "@/components/search/enhanced-search-dialog"

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  return (
    <>
      {/* ... existing header code ... */}

      <EnhancedSearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </>
  )
}
