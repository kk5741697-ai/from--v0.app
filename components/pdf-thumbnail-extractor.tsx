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
    let isMounted = true
    
    async function extractThumbnails() {
      if (!file || !isMounted) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        setProgress(0)

        // Validate file type
        if (file.type !== "application/pdf") {
          throw new Error("Invalid file type. Please select a PDF file.")
        }

        // Check file size (limit to 50MB for stability)
        if (file.size > 50 * 1024 * 1024) {
          throw new Error("PDF file too large. Please use a file smaller than 50MB.")
        }

        // Use PDF.js for real thumbnail extraction
        const arrayBuffer = await file.arrayBuffer()
        
        if (!isMounted) return
        
        // Dynamic import with better error handling
        let pdfjsLib: any
        try {
          // Import PDF.js with correct path
          pdfjsLib = await import("pdfjs-dist")
        } catch (importError) {
          console.warn("PDF.js import failed, trying CDN fallback:", importError)
          pdfjsLib = await loadPDFFromCDN()
        }

        // Set worker source with fallback
        try {
          if (pdfjsLib.GlobalWorkerOptions) {
            // Set worker source to the correct path
            pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`
          }
        } catch (workerError) {
          console.warn("Worker setup failed:", workerError)
          // Continue without worker (slower but more compatible)
        }

        const loadingTask = pdfjsLib.getDocument({ 
          data: arrayBuffer,
          useWorkerFetch: false,
          isEvalSupported: false,
          useSystemFonts: true
        })
        
        const pdfDoc = await loadingTask.promise
        const pageCount = pdfDoc.numPages
        
        if (pageCount === 0) {
          throw new Error("PDF appears to be empty")
        }

        if (pageCount > 100) {
          throw new Error("PDF has too many pages. Maximum 100 pages supported.")
        }

        if (!isMounted) return
        
        const thumbnails: PDFPage[] = []

        // Thumbnail target size
        const thumbW = 200
        const thumbH = 280
        
        for (let i = 1; i <= pageCount; i++) {
          if (!isMounted) break
          
          try {
            const page = await pdfDoc.getPage(i)

            // Compute scale so the resulting viewport fits target thumb size while preserving aspect ratio
            const viewport = page.getViewport({ scale: 1 })
            const thumbScale = Math.min(thumbW / viewport.width, thumbH / viewport.height)

            const scaledViewport = page.getViewport({ scale: thumbScale })

            // Create canvas sized for the scaled viewport
            const canvas = document.createElement("canvas")
            const context = canvas.getContext("2d", {
              alpha: false,
              willReadFrequently: false
            })!

            // Use devicePixelRatio for crisper thumbnails on high-dpi displays
            const dpr = Math.min(window.devicePixelRatio || 1, 2) // Limit DPR to 2 for performance
            canvas.width = Math.round(scaledViewport.width * dpr)
            canvas.height = Math.round(scaledViewport.height * dpr)
            canvas.style.width = `${Math.round(scaledViewport.width)}px`
            canvas.style.height = `${Math.round(scaledViewport.height)}px`

            // Scale context for DPR
            context.setTransform(dpr, 0, 0, dpr, 0, 0)
            context.fillStyle = "#fff"
            context.fillRect(0, 0, scaledViewport.width, scaledViewport.height)

            const renderContext = {
              canvasContext: context,
              viewport: scaledViewport,
              enableWebGL: false,
              renderInteractiveForms: false,
              intent: "display"
            }

            await page.render(renderContext).promise

            // Export thumbnail as dataURL (png)
            const dataUrl = canvas.toDataURL("image/png", quality)
            
            thumbnails.push({
              pageNumber: i,
              width: Math.round(scaledViewport.width),
              height: Math.round(scaledViewport.height),
              thumbnail: dataUrl,
              selected: false
            })
            
            setProgress((i / pageCount) * 100)
            
            // Cleanup
            if (page.cleanup) {
              page.cleanup()
            }
            
            // Allow browser to breathe and check if component is still mounted
            await new Promise(resolve => {
              if (isMounted) {
                setTimeout(resolve, 10)
              } else {
                resolve(undefined)
              }
            })
          } catch (pageError) {
            console.error(`Error processing page ${i}:`, pageError)
            // Continue with other pages
          }
        }
        
        if (isMounted && thumbnails.length > 0) {
          onPagesExtracted(thumbnails)
          setProgress(100)
        }
      } catch (err) {
        if (isMounted) {
          const errorMessage = err instanceof Error ? err.message : "Failed to process the PDF."
          setError(errorMessage)
          console.error("PDF processing error:", err)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    extractThumbnails()
    
    // Cleanup function to prevent memory leaks
    return () => {
      isMounted = false
    }
  }, [file, scale, quality, onPagesExtracted])

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="text-sm text-gray-500 mb-2">Extracting PDF pages...</div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${Math.min(progress, 100)}%` }}
          ></div>
        </div>
        <div className="text-xs text-gray-400 mt-1">{Math.round(Math.min(progress, 100))}%</div>
        {progress > 95 && (
          <div className="text-xs text-gray-500 mt-2">Finalizing...</div>
        )}
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <div className="text-sm text-red-600 mb-2">{error}</div>
        <div className="text-xs text-gray-500">
          Please try with a different PDF file or check if the file is corrupted.
        </div>
      </div>
    )
  }

  return null // Component only handles extraction, doesn't render thumbnails
}

// Fallback function to load PDF.js from CDN if local imports fail
async function loadPDFFromCDN(): Promise<any> {
  return new Promise((resolve, reject) => {
    // Check if PDF.js is already loaded
    if ((window as any).pdfjsLib) {
      resolve((window as any).pdfjsLib)
      return
    }

    // Load PDF.js from CDN
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
    script.onload = () => {
      setTimeout(() => {
        if ((window as any).pdfjsLib) {
          try {
            (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = 
              'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
          } catch (e) {
            console.warn("Worker setup failed:", e)
          }
          resolve((window as any).pdfjsLib)
        } else {
          reject(new Error("PDF.js not available after loading"))
        }
      }, 100)
    }
    script.onerror = () => {
      reject(new Error("Failed to load PDF.js from CDN"))
    }
    
    // Only add script if not already present
    if (!document.querySelector('script[src*="pdf.min.js"]')) {
      document.head.appendChild(script)
    } else {
      // Script already exists, wait for it to load
      setTimeout(() => {
        if ((window as any).pdfjsLib) {
          resolve((window as any).pdfjsLib)
        } else {
          reject(new Error("PDF.js script exists but library not available"))
        }
      }, 500)
      }
    }
  })
}