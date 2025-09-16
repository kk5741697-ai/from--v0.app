"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { FileText, CheckCircle, Loader2 } from "lucide-react"

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
      // Use PDF.js to extract real thumbnails
      let pdfjsLib: any
      try {
        pdfjsLib = await import("pdfjs-dist")
        
        // Set worker source
        if (pdfjsLib.GlobalWorkerOptions) {
          pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`
        }
      } catch (importError) {
        console.warn("PDF.js import failed, using fallback:", importError)
        // Fallback to mock thumbnails
        const mockPages = await generateMockThumbnails(file)
        setPages(mockPages)
        onPagesExtracted(mockPages)
        setIsLoading(false)
        return
      }

      const arrayBuffer = await file.arrayBuffer()
      
      const loadingTask = pdfjsLib.getDocument({ 
        data: arrayBuffer,
        useWorkerFetch: false,
        isEvalSupported: false,
        useSystemFonts: true
      })
      
      const pdfDoc = await loadingTask.promise
      const pageCount = pdfDoc.numPages
      const extractedPages: PDFPage[] = []

      // Extract thumbnails for each page
      for (let i = 1; i <= pageCount; i++) {
        try {
          const page = await pdfDoc.getPage(i)
          const viewport = page.getViewport({ scale: 0.5 })

          const canvas = document.createElement("canvas")
          const context = canvas.getContext("2d", {
            alpha: false,
            willReadFrequently: false
          })!

          canvas.width = Math.min(200, viewport.width)
          canvas.height = Math.min(280, viewport.height)

          // Scale context to fit thumbnail size
          const scaleX = canvas.width / viewport.width
          const scaleY = canvas.height / viewport.height
          const scale = Math.min(scaleX, scaleY)

          context.setTransform(scale, 0, 0, scale, 0, 0)
          context.fillStyle = "#fff"
          context.fillRect(0, 0, viewport.width, viewport.height)

          const renderContext = {
            canvasContext: context,
            viewport: viewport,
            enableWebGL: false,
            renderInteractiveForms: false,
            intent: "display"
          }

          await page.render(renderContext).promise

          const thumbnail = canvas.toDataURL("image/png", 0.8)

          extractedPages.push({
            pageNumber: i,
            width: canvas.width,
            height: canvas.height,
            thumbnail,
            selected: false
          })

          // Cleanup
          if (page.cleanup) {
            page.cleanup()
          }
        } catch (pageError) {
          console.warn(`Failed to extract page ${i}:`, pageError)
          // Add placeholder for failed page
          extractedPages.push({
            pageNumber: i,
            width: 200,
            height: 280,
            thumbnail: generatePlaceholderThumbnail(i),
            selected: false
          })
        }
      }

      setPages(extractedPages)
      onPagesExtracted(extractedPages)
    } catch (error) {
      console.error("PDF thumbnail extraction failed:", error)
      setError("Failed to extract PDF thumbnails")
      
      // Fallback to mock thumbnails
      try {
        const mockPages = await generateMockThumbnails(file)
        setPages(mockPages)
        onPagesExtracted(mockPages)
      } catch (fallbackError) {
        console.error("Fallback thumbnail generation failed:", fallbackError)
      }
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
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Extracting PDF thumbnails...</span>
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
            <p>{error}</p>
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
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-red-600" />
            <span className="font-medium">PDF Pages ({pages.length})</span>
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

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {pages.map((page) => {
            const pageKey = `${file.name}-page-${page.pageNumber}`
            const isSelected = selectedPages.has(pageKey)
            
            return (
              <div
                key={page.pageNumber}
                className={`relative cursor-pointer border-2 rounded-lg overflow-hidden transition-all hover:shadow-md ${
                  isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => handlePageSelection(page.pageNumber)}
              >
                <img
                  src={page.thumbnail}
                  alt={`Page ${page.pageNumber}`}
                  className="w-full h-auto object-cover"
                  loading="lazy"
                />
                
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 text-center">
                  Page {page.pageNumber}
                </div>
                
                {allowSelection && isSelected && (
                  <div className="absolute top-1 right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-3 w-3 text-white" />
                  </div>
                )}
                
                {allowSelection && (
                  <div className="absolute top-1 left-1">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handlePageSelection(page.pageNumber)}
                      className="bg-white"
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {allowSelection && selectedPages.size > 0 && (
          <div className="mt-4 text-center">
            <Badge variant="secondary">
              {selectedPages.size} page{selectedPages.size !== 1 ? 's' : ''} selected
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Fallback function to generate mock thumbnails
async function generateMockThumbnails(file: File): Promise<PDFPage[]> {
  // Estimate page count from file size (rough approximation)
  const estimatedPages = Math.max(1, Math.min(50, Math.floor(file.size / (100 * 1024))))
  const pages: PDFPage[] = []

  for (let i = 1; i <= estimatedPages; i++) {
    pages.push({
      pageNumber: i,
      width: 200,
      height: 280,
      thumbnail: generatePlaceholderThumbnail(i),
      selected: false
    })
  }

  return pages
}

// Generate placeholder thumbnail
function generatePlaceholderThumbnail(pageNumber: number): string {
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")!
  canvas.width = 200
  canvas.height = 280

  // White background
  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  
  // Border
  ctx.strokeStyle = "#e2e8f0"
  ctx.lineWidth = 1
  ctx.strokeRect(0, 0, canvas.width, canvas.height)
  
  // Header
  ctx.fillStyle = "#1f2937"
  ctx.font = "bold 12px system-ui"
  ctx.textAlign = "left"
  ctx.fillText("PDF Document", 15, 25)
  
  // Content lines
  ctx.fillStyle = "#374151"
  ctx.font = "10px system-ui"
  
  const lines = [
    "Lorem ipsum dolor sit amet,",
    "consectetur adipiscing elit.",
    "Sed do eiusmod tempor",
    "incididunt ut labore et",
    "dolore magna aliqua.",
    "Ut enim ad minim veniam,",
    "quis nostrud exercitation",
    "ullamco laboris nisi ut"
  ]
  
  lines.forEach((line, index) => {
    ctx.fillText(line, 15, 45 + index * 12)
  })
  
  // Page number
  ctx.fillStyle = "#9ca3af"
  ctx.font = "8px system-ui"
  ctx.textAlign = "center"
  ctx.fillText(`Page ${pageNumber}`, canvas.width / 2, canvas.height - 15)

  return canvas.toDataURL("image/png", 0.8)
}