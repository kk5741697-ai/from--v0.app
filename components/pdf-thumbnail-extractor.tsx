"use client"

import { useEffect, useState } from "react"
import * as pdfjs from "pdfjs-dist"

// Set the worker source
if (typeof window !== "undefined") {
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`
}

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

        const arrayBuffer = await file.arrayBuffer()
        const loadingTask = pdfjs.getDocument(arrayBuffer)
        const pdf = await loadingTask.promise
        
        const pagePromises = []
        const totalPages = pdf.numPages

        for (let i = 1; i <= totalPages; i++) {
          pagePromises.push(
            pdf.getPage(i).then(async (page) => {
              const viewport = page.getViewport({ scale })
              const canvas = document.createElement("canvas")
              const canvasContext = canvas.getContext("2d") as CanvasRenderingContext2D
              canvas.height = viewport.height
              canvas.width = viewport.width

              // Render the PDF page into the canvas
              await page.render({ canvasContext, viewport }).promise
              
              // Update progress
              setProgress((i / totalPages) * 100)
              
              return {
                pageNumber: i,
                thumbnail: canvas.toDataURL("image/jpeg", quality),
                width: viewport.width,
                height: viewport.height,
                selected: false
              }
            })
          )
        }

        const thumbnails = await Promise.all(pagePromises)
        onPagesExtracted(thumbnails)
        setProgress(100)
      } catch (err) {
        setError("Failed to load or process the PDF.")
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