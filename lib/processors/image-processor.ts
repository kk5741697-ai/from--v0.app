import type { ImageProcessingOptions } from "./image-processing-options" // Assuming ImageProcessingOptions is declared in another file

export class ImageProcessor {
  private static readonly MAX_SAFE_PIXELS = 1024 * 1024 // 1MP max for stability
  private static readonly MAX_CANVAS_SIZE = 2048 // Max canvas dimension

  // Enhanced memory management
  private static activeCanvases = new Set<HTMLCanvasElement>()

  static async flipImage(file: File, options: ImageProcessingOptions): Promise<Blob> {
    return this.processImageSafely(
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
    return this.processImageSafely(
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
}
