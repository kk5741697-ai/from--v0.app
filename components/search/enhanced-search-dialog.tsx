"use client"

import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Search, Clock, Star, ArrowRight, Zap } from "lucide-react"
import Link from "next/link"
import { searchTools, getPopularTools, getRecentSearches, addToRecentSearches } from "@/lib/search/search-engine"

interface SearchResult {
  title: string
  description: string
  href: string
  category: string
  icon: any
  score: number
  keywords: string[]
  popularity: number
}

interface EnhancedSearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EnhancedSearchDialog({ open, onOpenChange }: EnhancedSearchDialogProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [popularTools, setPopularTools] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Load initial data
  useEffect(() => {
    if (open) {
      setRecentSearches(getRecentSearches())
      setPopularTools(getPopularTools())
    }
  }, [open])

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([])
        setIsLoading(false)
        return
      }

      const searchResults = searchTools(searchQuery)
      setResults(searchResults)
      setIsLoading(false)
    }, 300),
    [],
  )

  useEffect(() => {
    if (query.trim()) {
      setIsLoading(true)
      debouncedSearch(query)
    } else {
      setResults([])
      setIsLoading(false)
    }
  }, [query, debouncedSearch])

  const handleSelect = (href: string, title: string) => {
    addToRecentSearches(query || title)
    onOpenChange(false)
    setQuery("")
  }

  const handleRecentSearch = (searchTerm: string) => {
    setQuery(searchTerm)
  }

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text

    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")
    const parts = text.split(regex)

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 text-yellow-900 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      ),
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[80vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Search Tools</span>
            {query && (
              <Badge variant="secondary" className="ml-2">
                {results.length} results
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search 300+ professional tools..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 h-12 text-lg"
              autoFocus
            />
            {isLoading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>
        </div>

        <ScrollArea className="max-h-96 px-6 pb-6">
          {/* Search Results */}
          {results.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-muted-foreground">Search Results</h3>
                <Badge variant="outline" className="text-xs">
                  {results.length} found
                </Badge>
              </div>
              {results.map((result, index) => {
                const Icon = result.icon
                return (
                  <Link
                    key={`${result.href}-${index}`}
                    href={result.href}
                    onClick={() => handleSelect(result.href, result.title)}
                    className="block p-4 rounded-lg border hover:bg-muted/50 transition-all duration-200 group"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                            {highlightMatch(result.title, query)}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary" className="text-xs">
                              {result.category}
                            </Badge>
                            {result.popularity > 80 && (
                              <Badge className="bg-orange-100 text-orange-800 text-xs">
                                <Star className="h-3 w-3 mr-1" />
                                Popular
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {highlightMatch(result.description, query)}
                        </p>
                        {result.keywords.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {result.keywords.slice(0, 3).map((keyword, keywordIndex) => (
                              <Badge key={keywordIndex} variant="outline" className="text-xs">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100" />
                    </div>
                  </Link>
                )
              })}
            </div>
          )}

          {/* No Results */}
          {query && results.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium text-foreground mb-2">No tools found</h3>
              <p className="text-muted-foreground mb-4">We couldn't find any tools matching "{query}"</p>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Try searching for:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {["PDF", "Image", "QR Code", "JSON", "Compress", "Convert"].map((suggestion) => (
                    <Button
                      key={suggestion}
                      variant="outline"
                      size="sm"
                      onClick={() => setQuery(suggestion)}
                      className="text-xs"
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Recent Searches & Popular Tools */}
          {!query && (
            <div className="space-y-6">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-medium text-muted-foreground">Recent Searches</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.slice(0, 6).map((search, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleRecentSearch(search)}
                        className="text-sm h-8"
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        {search}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Popular Tools */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Zap className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-medium text-muted-foreground">Popular Tools</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {popularTools.slice(0, 6).map((tool, index) => {
                    const Icon = tool.icon
                    return (
                      <Link
                        key={`popular-${tool.href}-${index}`}
                        href={tool.href}
                        onClick={() => handleSelect(tool.href, tool.title)}
                        className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-all duration-200 group"
                      >
                        <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors truncate">
                            {tool.title}
                          </h4>
                          <p className="text-xs text-muted-foreground truncate">{tool.description}</p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {tool.category}
                        </Badge>
                      </Link>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="px-6 py-3 border-t bg-muted/30">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center space-x-4">
              <span>
                Press <kbd className="bg-background px-1.5 py-0.5 rounded border">↑↓</kbd> to navigate
              </span>
              <span>
                Press <kbd className="bg-background px-1.5 py-0.5 rounded border">Enter</kbd> to select
              </span>
            </div>
            <span>300+ tools available</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout
  return ((...args: any[]) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }) as T
}
