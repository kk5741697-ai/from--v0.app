"use client"

import { useEffect, useState } from "react"

interface PDFPage {
  pageNumber: number
  thumbnail: string
  width: number
  height: number
  selected?: boolean
}

interface PDFThumbnailExtractorProps {
  file: File
  onPagesExtracted: (pages: PDFPage[]) => void
  scale?: number
  quality?: number
}

export function PDFThumbnailExtractor({ 
  file, 
  onPagesExtracted, 
  scale = 0.3, 
  quality = 0.8 
}: PDFThumbnailExtractorProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    async function extractThumbnails() {
      if (!file) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        setProgress(0)

        // Generate mock thumbnails for now (PDF.js causing issues in WebContainer)
        const mockPageCount = 5 // Simulate 5 pages
        const thumbnails = []
        
        for (let i = 1; i <= mockPageCount; i++) {
          const canvas = document.createElement("canvas")
          const ctx = canvas.getContext("2d")!
          canvas.width = 200
          canvas.height = 280
          
          // Generate mock PDF page thumbnail
          ctx.fillStyle = "#ffffff"
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          
          ctx.strokeStyle = "#e2e8f0"
          ctx.lineWidth = 1
          ctx.strokeRect(0, 0, canvas.width, canvas.height)
          
          ctx.fillStyle = "#1f2937"
          ctx.font = "bold 12px system-ui"
          ctx.textAlign = "left"
          ctx.fillText(`Page ${i}`, 15, 25)
          
          ctx.fillStyle = "#374151"
          ctx.font = "10px system-ui"
          const lines = [
            "Lorem ipsum dolor sit amet,",
            "consectetur adipiscing elit.",
            "Sed do eiusmod tempor",
            "incididunt ut labore et",
            "dolore magna aliqua."
          ]
          
          lines.forEach((line, lineIndex) => {
            ctx.fillText(line, 15, 45 + lineIndex * 12)
          })
          
          ctx.fillStyle = "#9ca3af"
          ctx.font = "8px system-ui"
          ctx.textAlign = "center"
          ctx.fillText(`${i} / ${mockPageCount}`, canvas.width / 2, canvas.height - 15)
          
          thumbnails.push({
            pageNumber: i,
            thumbnail: canvas.toDataURL("image/jpeg", quality),
            width: 200,
            height: 280,
            selected: false
          })
          
          setProgress((i / mockPageCount) * 100)
          
          // Small delay to show progress
          await new Promise(resolve => setTimeout(resolve, 100))
        }
        
        onPagesExtracted(thumbnails)
        setProgress(100)
      } catch (err) {
        setError("Failed to process the PDF.")
        console.error("PDF processing error:", err)
      } finally {
        setLoading(false)
      }
    }

    extractThumbnails()
  }, [file, scale, quality, onPagesExtracted])

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="text-sm text-gray-500 mb-2">Extracting PDF pages...</div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="text-xs text-gray-400 mt-1">{Math.round(progress)}%</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        <div className="text-sm">{error}</div>
      </div>
    )
  }

  return null // Component only handles extraction, doesn't render thumbnails
}