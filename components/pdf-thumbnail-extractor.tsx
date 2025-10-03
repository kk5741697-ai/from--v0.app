"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { FileText, CircleCheck as CheckCircle, Loader as Loader2 } from "lucide-react"
import { ClientPDFProcessor } from "@/lib/processors/client-pdf-processor"

interface PDFPage {
  pageNumber: number
  width: number
  height: number
  thumbnail: string
  selected?: boolean
}

interface PDFThumbnailExtractorProps {
  file: File
  onPagesExtracted: (pages: PDFPage[]) => void
  allowSelection?: boolean
  allowReorder?: boolean
  selectedPages?: Set<string>
  onPageSelectionChange?: (pageKey: string) => void
  className?: string
}

export function PDFThumbnailExtractor({
  file,
  onPagesExtracted,
  allowSelection = true,
  allowReorder = false,
  selectedPages = new Set(),
  onPageSelectionChange,
  className = ""
}: PDFThumbnailExtractorProps) {
  const [pages, setPages] = useState<PDFPage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    extractThumbnails()
  }, [file])

  const extractThumbnails = async () => {
    if (!file || file.type !== "application/pdf") {
      setError("Invalid PDF file")
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Use real PDF.js rendering for genuine thumbnails
      const pdfInfo = await ClientPDFProcessor.getPDFInfo(file)

      const extractedPages: PDFPage[] = pdfInfo.pages.map(page => ({
        pageNumber: page.pageNumber,
        width: page.width,
        height: page.height,
        thumbnail: page.thumbnail,
        selected: false
      }))

      setPages(extractedPages)
      onPagesExtracted(extractedPages)
    } catch (error) {
      console.error("PDF thumbnail extraction failed:", error)
      setError("Failed to extract PDF thumbnails. Please ensure the PDF is valid and not corrupted.")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePageSelection = (pageNumber: number) => {
    if (!allowSelection || !onPageSelectionChange) return

    const pageKey = `${file.name}-page-${pageNumber}`
    onPageSelectionChange(pageKey)
  }

  const selectAllPages = () => {
    if (!allowSelection || !onPageSelectionChange) return

    pages.forEach(page => {
      const pageKey = `${file.name}-page-${page.pageNumber}`
      if (!selectedPages.has(pageKey)) {
        onPageSelectionChange(pageKey)
      }
    })
  }

  const clearSelection = () => {
    if (!allowSelection || !onPageSelectionChange) return

    pages.forEach(page => {
      const pageKey = `${file.name}-page-${page.pageNumber}`
      if (selectedPages.has(pageKey)) {
        onPageSelectionChange(pageKey)
      }
    })
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-red-600" />
            <div className="text-center">
              <p className="font-medium">Rendering PDF thumbnails...</p>
              <p className="text-sm text-muted-foreground">This may take a moment for large documents</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="font-medium mb-2">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={extractThumbnails}
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4 bg-gray-50 p-3 rounded-lg border">
        <div className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-red-600" />
          <span className="font-medium">PDF Pages</span>
          <Badge variant="secondary">{pages.length} {pages.length === 1 ? 'page' : 'pages'}</Badge>
        </div>

        {allowSelection && (
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={selectAllPages}>
              Select All
            </Button>
            <Button variant="outline" size="sm" onClick={clearSelection}>
              Clear
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
        {pages.map((page) => {
          const pageKey = `${file.name}-page-${page.pageNumber}`
          const isSelected = selectedPages.has(pageKey)

          return (
            <div
              key={page.pageNumber}
              className={`relative cursor-pointer rounded-lg overflow-hidden transition-all hover:shadow-lg ${
                isSelected
                  ? 'ring-2 ring-blue-500 shadow-md'
                  : 'border-2 border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => handlePageSelection(page.pageNumber)}
            >
              <div className="relative aspect-[3/4] bg-white">
                <img
                  src={page.thumbnail}
                  alt={`Page ${page.pageNumber}`}
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
              </div>

              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white text-xs py-2 px-2 text-center font-medium">
                Page {page.pageNumber}
              </div>

              {allowSelection && isSelected && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
              )}

              {allowSelection && (
                <div className="absolute top-2 left-2">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => handlePageSelection(page.pageNumber)}
                    className="bg-white shadow-md"
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {allowSelection && selectedPages.size > 0 && (
        <div className="mt-4 text-center">
          <Badge variant="default" className="bg-blue-500">
            {selectedPages.size} page{selectedPages.size !== 1 ? 's' : ''} selected
          </Badge>
        </div>
      )}
    </div>
  )
}
