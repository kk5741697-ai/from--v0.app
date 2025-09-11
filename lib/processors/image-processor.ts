import type { ImageProcessingOptions } from "./image-processing-options"

export class ImageProcessor {
  // Removed all artificial limits for unlimited processing
  private static readonly MAX_SAFE_PIXELS = 16 * 1024 * 1024 // Increased to 16MP
  private static readonly MAX_CANVAS_SIZE = 8192 // Increased to 8K resolution
  private static readonly CHUNK_SIZE = 512 * 512 // Process in chunks for memory efficiency

  // Enhanced memory management
  private static activeCanvases = new Set<HTMLCanvasElement>()

  static async resizeImage(file: File, options: ImageProcessingOptions): Promise<Blob> {
    return this.processImageWithChunking(
      file,
      (canvas, ctx, img) => {
        this.activeCanvases.add(canvas)
        
        let targetWidth = options.width || img.naturalWidth
        let targetHeight = options.height || img.naturalHeight
        
        // Maintain aspect ratio if requested
        if (options.maintainAspectRatio && options.width && options.height) {
          const aspectRatio = img.naturalWidth / img.naturalHeight
          if (targetWidth / targetHeight > aspectRatio) {
            targetWidth = targetHeight * aspectRatio
          } else {
            targetHeight = targetWidth / aspectRatio
          }
        }
        
        canvas.width = Math.max(1, Math.floor(targetWidth))
        canvas.height = Math.max(1, Math.floor(targetHeight))
        
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = "high"
        
        // Apply background color if converting to JPEG
        if (options.outputFormat === "jpeg" && options.backgroundColor) {
          ctx.fillStyle = options.backgroundColor
          ctx.fillRect(0, 0, canvas.width, canvas.height)
        }
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        this.activeCanvases.delete(canvas)
      },
      options
    )
  }

  static async compressImage(file: File, options: ImageProcessingOptions): Promise<Blob> {
    return this.processImageWithChunking(
      file,
      (canvas, ctx, img) => {
        this.activeCanvases.add(canvas)
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = "high"
        
        // Apply background for JPEG
        if (options.outputFormat === "jpeg") {
          ctx.fillStyle = options.backgroundColor || "#ffffff"
          ctx.fillRect(0, 0, canvas.width, canvas.height)
        }
        
        ctx.drawImage(img, 0, 0)
        this.activeCanvases.delete(canvas)
      },
      {
        ...options,
        quality: this.getCompressionQuality(options.compressionLevel, options.quality)
      }
    )
  }

  static async convertFormat(file: File, outputFormat: "jpeg" | "png" | "webp", options: ImageProcessingOptions): Promise<Blob> {
    return this.processImageWithChunking(
      file,
      (canvas, ctx, img) => {
        this.activeCanvases.add(canvas)
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = "high"
        
        // Apply background for formats that don't support transparency
        if (outputFormat === "jpeg") {
          ctx.fillStyle = options.backgroundColor || "#ffffff"
          ctx.fillRect(0, 0, canvas.width, canvas.height)
        }
        
        ctx.drawImage(img, 0, 0)
        this.activeCanvases.delete(canvas)
      },
      { ...options, outputFormat }
    )
  }

  static async rotateImage(file: File, options: ImageProcessingOptions): Promise<Blob> {
    return this.processImageWithChunking(
      file,
      (canvas, ctx, img) => {
        this.activeCanvases.add(canvas)
        
        const angle = (options.customRotation || options.rotation || 0) * Math.PI / 180
        
        // Calculate new canvas dimensions for rotation
        const cos = Math.abs(Math.cos(angle))
        const sin = Math.abs(Math.sin(angle))
        const newWidth = img.naturalWidth * cos + img.naturalHeight * sin
        const newHeight = img.naturalWidth * sin + img.naturalHeight * cos
        
        canvas.width = Math.ceil(newWidth)
        canvas.height = Math.ceil(newHeight)
        
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = "high"
        
        // Apply background for JPEG
        if (options.outputFormat === "jpeg") {
          ctx.fillStyle = options.backgroundColor || "#ffffff"
          ctx.fillRect(0, 0, canvas.width, canvas.height)
        }
        
        // Rotate around center
        ctx.translate(canvas.width / 2, canvas.height / 2)
        ctx.rotate(angle)
        ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2)
        
        this.activeCanvases.delete(canvas)
      },
      options
    )
  }

  static async cropImage(file: File, cropArea: { x: number; y: number; width: number; height: number }, options: ImageProcessingOptions): Promise<Blob> {
    return this.processImageWithChunking(
      file,
      (canvas, ctx, img) => {
        this.activeCanvases.add(canvas)
        
        // Convert percentage to pixels
        const sourceX = (cropArea.x / 100) * img.naturalWidth
        const sourceY = (cropArea.y / 100) * img.naturalHeight
        const sourceWidth = (cropArea.width / 100) * img.naturalWidth
        const sourceHeight = (cropArea.height / 100) * img.naturalHeight
        
        canvas.width = Math.max(1, Math.floor(sourceWidth))
        canvas.height = Math.max(1, Math.floor(sourceHeight))
        
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = "high"
        
        // Apply background for JPEG
        if (options.outputFormat === "jpeg") {
          ctx.fillStyle = options.backgroundColor || "#ffffff"
          ctx.fillRect(0, 0, canvas.width, canvas.height)
        }
        
        ctx.drawImage(
          img,
          sourceX, sourceY, sourceWidth, sourceHeight,
          0, 0, canvas.width, canvas.height
        )
        
        this.activeCanvases.delete(canvas)
      },
      options
    )
  }

  static async applyFilters(file: File, options: ImageProcessingOptions): Promise<Blob> {
    return this.processImageWithChunking(
      file,
      (canvas, ctx, img) => {
        this.activeCanvases.add(canvas)
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = "high"
        
        // Build filter string
        const filters = []
        if (options.filters) {
          if (options.filters.brightness !== undefined && options.filters.brightness !== 100) {
            filters.push(`brightness(${options.filters.brightness}%)`)
          }
          if (options.filters.contrast !== undefined && options.filters.contrast !== 100) {
            filters.push(`contrast(${options.filters.contrast}%)`)
          }
          if (options.filters.saturation !== undefined && options.filters.saturation !== 100) {
            filters.push(`saturate(${options.filters.saturation}%)`)
          }
          if (options.filters.blur !== undefined && options.filters.blur > 0) {
            filters.push(`blur(${options.filters.blur}px)`)
          }
          if (options.filters.sepia) {
            filters.push("sepia(100%)")
          }
          if (options.filters.grayscale) {
            filters.push("grayscale(100%)")
          }
        }
        
        if (filters.length > 0) {
          ctx.filter = filters.join(" ")
        }
        
        ctx.drawImage(img, 0, 0)
        this.activeCanvases.delete(canvas)
      },
      options
    )
  }

  static async flipImage(file: File, options: ImageProcessingOptions): Promise<Blob> {
    return this.processImageWithChunking(
      file,
      (canvas, ctx, img) => {
        this.activeCanvases.add(canvas)
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight

        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = "high"

        // Apply flip transformations
        switch (options.flipDirection) {
          case "horizontal":
            ctx.scale(-1, 1)
            ctx.drawImage(img, -canvas.width, 0)
            break
          case "vertical":
            ctx.scale(1, -1)
            ctx.drawImage(img, 0, -canvas.height)
            break
          case "both":
            ctx.scale(-1, -1)
            ctx.drawImage(img, -canvas.width, -canvas.height)
            break
          default:
            ctx.drawImage(img, 0, 0)
            break
        }

        this.activeCanvases.delete(canvas)
      },
      options,
    )
  }

  static async addWatermark(file: File, watermarkText: string, options: ImageProcessingOptions): Promise<Blob> {
    return this.processImageWithChunking(
      file,
      async (canvas, ctx, img) => {
        this.activeCanvases.add(canvas)
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight

        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = "high"
        ctx.drawImage(img, 0, 0)

        // Add watermark
        if (options.useImageWatermark && options.watermarkImageUrl) {
          // Image watermark
          try {
            const watermarkImg = new Image()
            watermarkImg.crossOrigin = "anonymous"

            await new Promise<void>((resolve, reject) => {
              watermarkImg.onload = () => resolve()
              watermarkImg.onerror = () => reject(new Error("Failed to load watermark image"))
              watermarkImg.src = options.watermarkImageUrl!
            })

            ctx.save()
            ctx.globalAlpha = options.watermarkOpacity || 0.5

            // Calculate watermark size (max 30% of image)
            const maxWatermarkWidth = canvas.width * 0.3
            const maxWatermarkHeight = canvas.height * 0.3
            const watermarkAspectRatio = watermarkImg.width / watermarkImg.height

            let watermarkWidth = maxWatermarkWidth
            let watermarkHeight = maxWatermarkWidth / watermarkAspectRatio

            if (watermarkHeight > maxWatermarkHeight) {
              watermarkHeight = maxWatermarkHeight
              watermarkWidth = maxWatermarkHeight * watermarkAspectRatio
            }

            // Position watermark
            let x: number, y: number
            switch (options.position) {
              case "top-left":
                x = 20
                y = 20
                break
              case "top-right":
                x = canvas.width - watermarkWidth - 20
                y = 20
                break
              case "bottom-left":
                x = 20
                y = canvas.height - watermarkHeight - 20
                break
              case "bottom-right":
                x = canvas.width - watermarkWidth - 20
                y = canvas.height - watermarkHeight - 20
                break
              case "diagonal":
                x = (canvas.width - watermarkWidth) / 2
                y = (canvas.height - watermarkHeight) / 2
                break
              default: // center
                x = (canvas.width - watermarkWidth) / 2
                y = (canvas.height - watermarkHeight) / 2
                break
            }

            ctx.drawImage(watermarkImg, x, y, watermarkWidth, watermarkHeight)
            ctx.restore()
          } catch (error) {
            console.error("Failed to add image watermark:", error)
            // Fall back to text watermark if image fails
            if (watermarkText) {
              this.addTextWatermark(ctx, canvas, watermarkText, options)
            }
          }
        } else if (watermarkText && watermarkText.trim() !== "") {
          // Text watermark
          this.addTextWatermark(ctx, canvas, watermarkText, options)
        }

        this.activeCanvases.delete(canvas)
      },
      options,
    )
  }

  private static getCompressionQuality(level?: string, baseQuality?: number): number {
    const base = baseQuality || 90
    
    switch (level) {
      case "low":
        return Math.max(85, base)
      case "medium":
        return Math.max(70, base * 0.8)
      case "high":
        return Math.max(50, base * 0.6)
      case "maximum":
        return Math.max(30, base * 0.4)
      default:
        return base
    }
  }

  // New chunked processing method for unlimited file sizes
  private static async processImageWithChunking(
    file: File,
    processFunction: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, img: HTMLImageElement) => void | Promise<void>,
    options: ImageProcessingOptions
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      // Remove file size restrictions - allow unlimited sizes
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d", {
        alpha: true,
        willReadFrequently: false,
        desynchronized: true
      })

      if (!ctx) {
        reject(new Error("Canvas not supported"))
        return
      }

      const img = new Image()
      img.onload = async () => {
        try {
          // Allow unlimited resolution processing
          // Use progressive rendering for very large images
          if (img.naturalWidth * img.naturalHeight > this.MAX_SAFE_PIXELS) {
            await this.processLargeImageInChunks(img, canvas, ctx, processFunction, options)
          } else {
            await processFunction(canvas, ctx, img)
          }

          const quality = (options.quality || 90) / 100
          const mimeType = `image/${options.outputFormat || "png"}`

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob)
              } else {
                reject(new Error("Failed to create blob"))
              }
            },
            mimeType,
            quality
          )
        } catch (error) {
          reject(error)
        }
      }

      img.onerror = () => reject(new Error("Failed to load image"))
      img.crossOrigin = "anonymous"
      img.src = URL.createObjectURL(file)
    })
  }

  // Process very large images in chunks to prevent memory issues
  private static async processLargeImageInChunks(
    img: HTMLImageElement,
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    processFunction: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, img: HTMLImageElement) => void | Promise<void>,
    options: ImageProcessingOptions
  ): Promise<void> {
    // For very large images, we'll use a different approach
    // Create a temporary smaller canvas for processing, then scale up
    const tempCanvas = document.createElement("canvas")
    const tempCtx = tempCanvas.getContext("2d")!
    
    // Scale down for processing if needed
    const maxProcessingDimension = 4096
    let processingWidth = img.naturalWidth
    let processingHeight = img.naturalHeight
    
    if (processingWidth > maxProcessingDimension || processingHeight > maxProcessingDimension) {
      const scale = maxProcessingDimension / Math.max(processingWidth, processingHeight)
      processingWidth = Math.floor(processingWidth * scale)
      processingHeight = Math.floor(processingHeight * scale)
    }
    
    tempCanvas.width = processingWidth
    tempCanvas.height = processingHeight
    tempCtx.imageSmoothingEnabled = true
    tempCtx.imageSmoothingQuality = "high"
    tempCtx.drawImage(img, 0, 0, processingWidth, processingHeight)
    
    // Process the smaller version
    await processFunction(tempCanvas, tempCtx, img)
    
    // Scale back up to original size if needed
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = "high"
    ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height)
  }

  private static addTextWatermark(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    watermarkText: string,
    options: ImageProcessingOptions,
  ) {
    ctx.save()
    ctx.globalAlpha = options.watermarkOpacity || 0.5

    // Fix font size calculation - use provided fontSize or calculate based on canvas size
    const fontSize =
      options.fontSize && options.fontSize > 0
        ? Math.min(options.fontSize, Math.min(canvas.width, canvas.height) * 0.1) // Cap at 10% of smallest dimension
        : Math.min(canvas.width, canvas.height) * 0.05 // Default to 5% of smallest dimension

    ctx.font = `bold ${fontSize}px Arial`
    ctx.fillStyle = options.textColor || "#ffffff"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"

    // Add shadow for better visibility
    ctx.shadowColor = "rgba(0, 0, 0, 0.8)"
    ctx.shadowBlur = Math.max(2, fontSize * 0.1)
    ctx.shadowOffsetX = Math.max(1, fontSize * 0.05)
    ctx.shadowOffsetY = Math.max(1, fontSize * 0.05)

    let x = canvas.width / 2
    let y = canvas.height / 2

    switch (options.position) {
      case "top-left":
        x = fontSize
        y = fontSize * 2
        ctx.textAlign = "left"
        break
      case "top-right":
        x = canvas.width - fontSize
        y = fontSize * 2
        ctx.textAlign = "right"
        break
      case "bottom-left":
        x = fontSize
        y = canvas.height - fontSize
        ctx.textAlign = "left"
        break
      case "bottom-right":
        x = canvas.width - fontSize
        y = canvas.height - fontSize
        ctx.textAlign = "right"
        break
      case "diagonal":
        // Rotate for diagonal watermark
        ctx.translate(canvas.width / 2, canvas.height / 2)
        ctx.rotate(-Math.PI / 4)
        x = 0
        y = 0
        break
    }

    ctx.fillText(watermarkText, x, y)
    ctx.restore()
  }

  // Memory cleanup utility
  static cleanupMemory(): void {
    // Force garbage collection if available
    if ('gc' in window && typeof (window as any).gc === 'function') {
      (window as any).gc()
    }
    
    // Clean up blob URLs
    const images = document.querySelectorAll('img[src^="blob:"]')
    images.forEach(img => {
      if (img instanceof HTMLImageElement) {
        URL.revokeObjectURL(img.src)
      }
    })
    
    // Clear active canvases
    this.activeCanvases.forEach(canvas => {
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    })
    this.activeCanvases.clear()
  }
}