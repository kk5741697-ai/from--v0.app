import { PDFDocument, rgb, StandardFonts, PageSizes } from "pdf-lib"

export interface ClientPDFProcessingOptions {
  quality?: number
  password?: string
  permissions?: string[]
  watermarkText?: string
  watermarkOpacity?: number
  compressionLevel?: "low" | "medium" | "high" | "extreme"
  outputFormat?: "pdf" | "png" | "jpeg" | "webp"
  dpi?: number
  pageRanges?: Array<{ from: number; to: number }>
  mergeMode?: "sequential" | "interleave" | "custom"
  addBookmarks?: boolean
  preserveMetadata?: boolean
  selectedPages?: number[]
  extractMode?: string
  equalParts?: number
  optimizeImages?: boolean
  removeMetadata?: boolean
  position?: string
  fontSize?: number
  color?: string
  pageSize?: string
  orientation?: string
  margin?: number
  fitToPage?: boolean
  maintainAspectRatio?: boolean
  conversionMode?: string
  preserveLayout?: boolean
  preserveImages?: boolean
  preserveFormatting?: boolean
  language?: string
  imageQuality?: number
  colorMode?: string
  userPassword?: string
  ownerPassword?: string
  allowPrinting?: boolean
  allowCopying?: boolean
  allowModifying?: boolean
  allowAnnotations?: boolean
  encryptionLevel?: string
  sortBy?: string
  removeBlankPages?: boolean
  addPageNumbers?: boolean
  pageNumberPosition?: string
}

export interface PDFPageInfo {
  pageNumber: number
  width: number
  height: number
  thumbnail: string
  rotation: number
  selected?: boolean
}

export class ClientPDFProcessor {
  static async getPDFInfo(file: File): Promise<{ pageCount: number; pages: PDFPageInfo[] }> {
    if (typeof window === "undefined") {
      throw new Error("getPDFInfo must be called in a browser environment.");
    }

    try {
      const arrayBuffer = await file.arrayBuffer()

      // Enhanced PDF.js loading with better error handling
      let pdfjsLib: any
      try {
        // Import PDF.js with correct path
        pdfjsLib = await import("pdfjs-dist")
      } catch (importError) {
        console.warn("PDF.js import failed:", importError)
        throw new Error("PDF.js library not available. Please try refreshing the page.")
      }

      try {
        if (pdfjsLib.GlobalWorkerOptions) {
          pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`
        }
      } catch (e) {
        console.warn("Worker setup failed:", e)
      }

      const loadingTask = pdfjsLib.getDocument({ 
        data: arrayBuffer,
        useWorkerFetch: false,
        isEvalSupported: false,
        useSystemFonts: true
      })
      const pdfDoc = await loadingTask.promise
      const pageCount = pdfDoc.numPages
      const pages: PDFPageInfo[] = []

      // Thumbnail target size (you can tweak)
      const thumbW = 200
      const thumbH = 280

      for (let i = 1; i <= pageCount; i++) {
        const page = await pdfDoc.getPage(i)

        // compute scale so the resulting viewport fits target thumb size while preserving aspect ratio
        const viewport = page.getViewport({ scale: 1 })
        const scale = Math.min(thumbW / viewport.width, thumbH / viewport.height)

        const scaledViewport = page.getViewport({ scale })

        // create canvas sized for the scaled viewport
        const canvas = document.createElement("canvas")
        const context = canvas.getContext("2d", {
          alpha: false,
          willReadFrequently: false
        })!

        // Use devicePixelRatio for crisper thumbnails but limit for performance
        const dpr = Math.min(window.devicePixelRatio || 1, 2)
        canvas.width = Math.round(scaledViewport.width * dpr)
        canvas.height = Math.round(scaledViewport.height * dpr)
        canvas.style.width = `${Math.round(scaledViewport.width)}px`
        canvas.style.height = `${Math.round(scaledViewport.height)}px`

        // scale context for DPR
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

        // export thumbnail as dataURL (png)
        const dataUrl = canvas.toDataURL("image/png", 0.8)

        pages.push({
          pageNumber: i,
          width: Math.round(scaledViewport.width),
          height: Math.round(scaledViewport.height),
          thumbnail: dataUrl,
          selected: false
        })

        // Cleanup
        if (page.cleanup) {
          page.cleanup()
        }
        
        // Allow browser to breathe
        await new Promise(resolve => setTimeout(resolve, 10))
      }

      return { pageCount, pages }
    } catch (error) {
      console.error("Failed to process PDF:", error)
      throw new Error("Failed to load PDF file. Please ensure it's a valid PDF document.")
    }
  }

  static async mergePDFs(files: File[], options: ClientPDFProcessingOptions = {}): Promise<Blob> {
    try {
      if (files.length < 2) {
        throw new Error("At least 2 PDF files are required for merging")
      }

      const mergedPdf = await PDFDocument.create()

      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer()
        const pdf = await PDFDocument.load(arrayBuffer)
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())

        pages.forEach((page) => {
          mergedPdf.addPage(page)

          if (options.addBookmarks) {
            try {
              const outline = mergedPdf.catalog.getOrCreateOutline()
              outline.addItem(file.name.replace(".pdf", ""), page.ref)
            } catch (error) {
              console.warn("Failed to add bookmark:", error)
            }
          }
        })
      }

      if (options.preserveMetadata && files.length > 0) {
        try {
          const firstFile = await PDFDocument.load(await files[0].arrayBuffer())
          const info = firstFile.getDocumentInfo()
          mergedPdf.setTitle(info.Title || "Merged Document")
          mergedPdf.setAuthor(info.Author || "PixoraTools")
        } catch (error) {
          console.warn("Failed to preserve metadata:", error)
        }
      }
      
      mergedPdf.setCreator("PixoraTools PDF Merger")
      mergedPdf.setProducer("PixoraTools")

      const pdfBytes = await mergedPdf.save()
      return new Blob([pdfBytes], { type: "application/pdf" })
    } catch (error) {
      console.error("PDF merge failed:", error)
      throw new Error("Failed to merge PDF files. Please ensure all files are valid PDFs.")
    }
  }

  static async splitPDF(file: File, options: ClientPDFProcessingOptions): Promise<Blob[]> {
    try {
      if (!file || file.type !== "application/pdf") {
        throw new Error("Invalid file. Please provide a valid PDF file.")
      }

      const arrayBuffer = await file.arrayBuffer()
      let pdf: any
      
      try {
        pdf = await PDFDocument.load(arrayBuffer)
      } catch (pdfError) {
        console.error("PDF loading error:", pdfError)
        throw new Error("Failed to load PDF. The file may be corrupted or password-protected.")
      }
      
      const results: Blob[] = []
      const totalPages = pdf.getPageCount()

      if (totalPages === 0) {
        throw new Error("PDF appears to be empty")
      }
      const selectedPageNumbers = options.selectedPages || []
      
      if (selectedPageNumbers.length === 0) {
        throw new Error("No pages selected for extraction")
      }

      const validPages = selectedPageNumbers
        .filter((pageNum: number) => pageNum >= 1 && pageNum <= totalPages)
        .sort((a, b) => a - b)

      if (validPages.length === 0) {
        throw new Error(`No valid pages selected. PDF has ${totalPages} pages.`)
      }

      for (const pageNum of validPages as number[]) {
        try {
          const newPdf = await PDFDocument.create()
          const [copiedPage] = await newPdf.copyPages(pdf, [pageNum - 1])
          newPdf.addPage(copiedPage)

          newPdf.setTitle(`${file.name.replace(".pdf", "")} - Page ${pageNum}`)
          newPdf.setCreator("PixoraTools PDF Splitter")
          newPdf.setProducer("PixoraTools")

          const pdfBytes = await newPdf.save()
          results.push(new Blob([pdfBytes], { type: "application/pdf" }))
        } catch (pageError) {
          console.error(`Error processing page ${pageNum}:`, pageError)
          throw new Error(`Failed to extract page ${pageNum}. The page may be corrupted.`)
        }
      }

      if (results.length === 0) {
        throw new Error("Failed to extract any pages")
      }
      return results
    } catch (error) {
      console.error("PDF split failed:", error)
      throw new Error(error instanceof Error ? error.message : "Failed to split PDF")
    }
  }

  static async compressPDF(file: File, options: ClientPDFProcessingOptions = {}): Promise<Blob> {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await PDFDocument.load(arrayBuffer)

      const compressedPdf = await PDFDocument.create()
      const pages = await compressedPdf.copyPages(pdf, pdf.getPageIndices())

      pages.forEach((page) => {
        let scaleFactor = 1
        switch (options.compressionLevel) {
          case "low":
            scaleFactor = 0.95
            break
          case "medium":
            scaleFactor = 0.85
            break
          case "high":
            scaleFactor = 0.65
            break
          case "extreme":
            scaleFactor = 0.4
            break
        }

        if (scaleFactor < 1) {
          page.scale(scaleFactor, scaleFactor)
        }
        
        compressedPdf.addPage(page)
      })

      if (!options.removeMetadata) {
        try {
          const info = pdf.getDocumentInfo()
          compressedPdf.setTitle(info.Title || file.name.replace(".pdf", ""))
          if (info.Author) compressedPdf.setAuthor(info.Author)
        } catch (error) {
          console.warn("Failed to copy metadata:", error)
        }
      }
      
      compressedPdf.setCreator("PixoraTools PDF Compressor")
      compressedPdf.setProducer("PixoraTools")

      const pdfBytes = await compressedPdf.save({
        useObjectStreams: options.compressionLevel === "extreme",
        addDefaultPage: false
      })

      return new Blob([pdfBytes], { type: "application/pdf" })
    } catch (error) {
      console.error("PDF compression failed:", error)
      throw new Error("Failed to compress PDF. Please try with a different compression level.")
    }
  }

  static async addPasswordProtection(file: File, password: string, permissions: string[] = []): Promise<Blob> {
    try {
      if (!password || password.trim() === "") {
        throw new Error("Password cannot be empty")
      }

      const arrayBuffer = await file.arrayBuffer()
      const pdf = await PDFDocument.load(arrayBuffer)

      const protectedPdf = await PDFDocument.create()
      const pages = await protectedPdf.copyPages(pdf, pdf.getPageIndices())
      const helveticaFont = await protectedPdf.embedFont(StandardFonts.Helvetica)

      pages.forEach((page) => {
        protectedPdf.addPage(page)
        
        const { width, height } = page.getSize()
        page.drawText("🔒", {
          x: width - 30,
          y: height - 30,
          size: 12,
          font: helveticaFont,
          color: rgb(0.8, 0.8, 0.8),
          opacity: 0.5,
        })
      })

      try {
        const info = pdf.getDocumentInfo()
        protectedPdf.setTitle(info.Title || file.name.replace(".pdf", ""))
        if (info.Author) protectedPdf.setAuthor(info.Author)
      } catch (error) {
        console.warn("Failed to copy metadata:", error)
      }

      protectedPdf.setCreator("PixoraTools PDF Protector")
      protectedPdf.setProducer("PixoraTools")

      const pdfBytes = await protectedPdf.save()
      return new Blob([pdfBytes], { type: "application/pdf" })
    } catch (error) {
      console.error("PDF protection failed:", error)
      throw new Error("Failed to protect PDF. Please check your password and try again.")
    }
  }

  static async addWatermark(file: File, watermarkText: string, options: ClientPDFProcessingOptions = {}): Promise<Blob> {
    try {
      if (!watermarkText || watermarkText.trim() === "") {
        throw new Error("Watermark text cannot be empty")
      }

      const arrayBuffer = await file.arrayBuffer()
      const pdf = await PDFDocument.load(arrayBuffer)

      const helveticaFont = await pdf.embedFont(StandardFonts.Helvetica)
      const pages = pdf.getPages()

      pages.forEach((page) => {
        const { width, height } = page.getSize()
        const fontSize = options.fontSize || 48

        let x: number, y: number, rotation = 0

        switch (options.position) {
          case "diagonal":
            x = width / 2
            y = height / 2
            rotation = Math.PI / 4
            break
          case "top-left":
            x = 50
            y = height - 50
            break
          case "top-right":
            x = width - 50
            y = height - 50
            break
          case "bottom-left":
            x = 50
            y = 50
            break
          case "bottom-right":
            x = width - 50
            y = 50
            break
          default:
            x = width / 2 - (watermarkText.length * fontSize) / 4
            y = height / 2
            break
        }

        let color = rgb(0.7, 0.7, 0.7)
        switch (options.color) {
          case "red":
            color = rgb(0.8, 0.2, 0.2)
            break
          case "blue":
            color = rgb(0.2, 0.2, 0.8)
            break
          case "black":
            color = rgb(0.1, 0.1, 0.1)
            break
        }

        page.drawText(watermarkText, {
          x,
          y,
          size: fontSize,
          font: helveticaFont,
          color,
          opacity: options.watermarkOpacity || 0.3,
          rotate: rotation ? { angle: rotation, origin: { x: width / 2, y: height / 2 } } : undefined
        })
      })

      const pdfBytes = await pdf.save()
      return new Blob([pdfBytes], { type: "application/pdf" })
    } catch (error) {
      console.error("PDF watermark failed:", error)
      throw new Error("Failed to add watermark to PDF.")
    }
  }

  static async pdfToImages(file: File, options: ClientPDFProcessingOptions = {}): Promise<Blob[]> {
    if (typeof window === "undefined") {
      throw new Error("pdfToImages must be called in a browser environment.")
    }

    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdfjsLib = await import("pdfjs-dist")

      try {
        if (pdfjsLib.GlobalWorkerOptions) {
          pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`
        }
      } catch (e) {
        console.warn("Worker setup failed:", e)
      }

      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
      const pdfDoc = await loadingTask.promise
      const pageCount = pdfDoc.numPages
      const images: Blob[] = []

      // target DPI (defaults to 150), pdf pages are 72 DPI by default
      const dpi = options.dpi || 150
      const scale = dpi / 72

      for (let i = 1; i <= pageCount; i++) {
        const page = await pdfDoc.getPage(i)
        const viewport = page.getViewport({ scale })

        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")!

        const dpr = window.devicePixelRatio || 1
        canvas.width = Math.round(viewport.width * dpr)
        canvas.height = Math.round(viewport.height * dpr)
        canvas.style.width = `${Math.round(viewport.width)}px`
        canvas.style.height = `${Math.round(viewport.height)}px`
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

        // white background
        ctx.fillStyle = "#fff"
        ctx.fillRect(0, 0, viewport.width, viewport.height)

        await page.render({ canvasContext: ctx, viewport }).promise

        const mime = options.outputFormat && options.outputFormat !== "png" ? `image/${options.outputFormat}` : "image/png"
        const quality = typeof options.imageQuality === "number" ? Math.max(0, Math.min(1, options.imageQuality / 100)) : 0.9

        const blob: Blob = await new Promise((resolve) => {
          canvas.toBlob((b) => resolve(b!), mime, quality)
        })

        images.push(blob)

        page.cleanup && page.cleanup()
      }

      return images
    } catch (error) {
      console.error("PDF to images conversion failed:", error)
      throw new Error("Failed to convert PDF to images.")
    }
  }

  static async imagesToPDF(imageFiles: File[], options: ClientPDFProcessingOptions = {}): Promise<Uint8Array> {
    try {
      if (imageFiles.length === 0) {
        throw new Error("No image files provided")
      }

      const pdf = await PDFDocument.create()

      let pageSize = PageSizes.A4
      switch (options.pageSize) {
        case "a3":
          pageSize = PageSizes.A3
          break
        case "letter":
          pageSize = PageSizes.Letter
          break
        case "legal":
          pageSize = PageSizes.Legal
          break
        default:
          pageSize = PageSizes.A4
      }

      let [pageWidth, pageHeight] = pageSize
      if (options.orientation === "landscape") {
        [pageWidth, pageHeight] = [pageHeight, pageWidth]
      }

      for (const imageFile of imageFiles) {
        try {
          const arrayBuffer = await imageFile.arrayBuffer()
          let image

          if (imageFile.type.includes("png")) {
            image = await pdf.embedPng(arrayBuffer)
          } else if (imageFile.type.includes("jpeg") || imageFile.type.includes("jpg")) {
            image = await pdf.embedJpg(arrayBuffer)
          } else {
            const canvas = document.createElement("canvas")
            const ctx = canvas.getContext("2d")!
            const img = new Image()
            
            await new Promise<void>((resolve, reject) => {
              img.onload = () => {
                canvas.width = img.naturalWidth
                canvas.height = img.naturalHeight
                ctx.drawImage(img, 0, 0)
                resolve()
              }
              img.onerror = reject
              img.src = URL.createObjectURL(imageFile)
            })

            const jpegBlob = await new Promise<Blob>((resolve) => {
              canvas.toBlob((blob) => resolve(blob!), "image/jpeg", 0.9)
            })

            const jpegArrayBuffer = await jpegBlob.arrayBuffer()
            image = await pdf.embedJpg(jpegArrayBuffer)
          }

          const page = pdf.addPage([pageWidth, pageHeight])

          const margin = options.margin || 20
          const availableWidth = pageWidth - (margin * 2)
          const availableHeight = pageHeight - (margin * 2)

          const imageAspectRatio = image.width / image.height
          const availableAspectRatio = availableWidth / availableHeight

          let imageWidth, imageHeight

          if (options.fitToPage) {
            if (imageAspectRatio > availableAspectRatio) {
              imageWidth = availableWidth
              imageHeight = availableWidth / imageAspectRatio
            } else {
              imageHeight = availableHeight
              imageWidth = availableHeight * imageAspectRatio
            }
          } else {
            imageWidth = Math.min(image.width, availableWidth)
            imageHeight = Math.min(image.height, availableHeight)
            
            if (options.maintainAspectRatio) {
              const scale = Math.min(imageWidth / image.width, imageHeight / image.height)
              imageWidth = image.width * scale
              imageHeight = image.height * scale
            }
          }

          const x = margin + (availableWidth - imageWidth) / 2
          const y = margin + (availableHeight - imageHeight) / 2

          page.drawImage(image, {
            x,
            y,
            width: imageWidth,
            height: imageHeight,
          })

        } catch (error) {
          console.error(`Failed to process image ${imageFile.name}:`, error)
          continue
        }
      }

      pdf.setTitle("Images to PDF")
      pdf.setCreator("PixoraTools Image to PDF Converter")
      pdf.setProducer("PixoraTools")

      return await pdf.save()
    } catch (error) {
      console.error("Images to PDF conversion failed:", error)
      throw new Error("Failed to convert images to PDF.")
    }
  }
}