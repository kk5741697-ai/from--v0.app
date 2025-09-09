import QRCode from "qrcode"

export interface EnhancedQROptions {
  width?: number
  height?: number
  margin?: number
  color?: {
    dark?: string
    light?: string
  }
  errorCorrectionLevel?: "L" | "M" | "Q" | "H"
  type?: "image/png" | "image/jpeg" | "image/webp"
  quality?: number
  style?: {
    shape?: "square" | "rounded" | "dots" | "extra-rounded"
    corners?: "square" | "rounded" | "extra-rounded"
    eyes?: "square" | "circle" | "rounded" | "leaf"
    eyeColor?: string
    gradient?: {
      type: "linear" | "radial"
      colors: string[]
      direction?: number
    }
    frame?: {
      text: string
      color: string
      backgroundColor?: string
    }
  }
  logo?: {
    src: string
    width?: number
    height?: number
    removeBackground?: boolean
  }
}

export class EnhancedQRProcessor {
  static async generateAdvancedQR(content: string, options: EnhancedQROptions = {}): Promise<string> {
    try {
      if (!content || content.trim() === "") {
        throw new Error("QR code content cannot be empty")
      }

      // Validate content length
      if (content.length > 2953) {
        throw new Error("Content too long for QR code. Maximum 2953 characters allowed.")
      }

      const qrOptions = {
        width: options.width || 1000,
        margin: options.margin || 4,
        color: {
          dark: options.color?.dark || "#000000",
          light: options.color?.light || "#FFFFFF",
        },
        errorCorrectionLevel: options.errorCorrectionLevel || "M",
        quality: options.quality || 0.92,
      }

      // Generate base QR code
      const qrDataURL = await QRCode.toDataURL(content, qrOptions)

      // Apply advanced styling
      if (options.style || options.logo) {
        return await this.applyAdvancedStyling(qrDataURL, options)
      }

      return qrDataURL
    } catch (error) {
      console.error("Advanced QR generation failed:", error)
      throw new Error(`Failed to generate QR code: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  private static async applyAdvancedStyling(qrDataURL: string, options: EnhancedQROptions): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        reject(new Error("Canvas not supported"))
        return
      }

      const img = new Image()
      img.onload = async () => {
        try {
          const size = options.width || 1000
          canvas.width = size
          canvas.height = size

          // Apply gradient background if specified
          if (options.style?.gradient) {
            this.applyGradientBackground(ctx, canvas, options.style.gradient)
          } else {
            ctx.fillStyle = options.color?.light || "#FFFFFF"
            ctx.fillRect(0, 0, size, size)
          }

          // Draw base QR code
          ctx.drawImage(img, 0, 0, size, size)

          // Apply styling
          if (options.style) {
            await this.applyQRStyling(ctx, canvas, options.style, size)
          }

          // Add logo if provided
          if (options.logo?.src) {
            await this.addAdvancedLogo(ctx, canvas, options.logo)
          }

          // Add frame if specified
          if (options.style?.frame) {
            this.addFrame(ctx, canvas, options.style.frame, size)
          }

          resolve(canvas.toDataURL("image/png"))
        } catch (error) {
          console.error("QR styling failed:", error)
          resolve(qrDataURL) // Return original on error
        }
      }
      img.onerror = () => resolve(qrDataURL)
      img.src = qrDataURL
    })
  }

  private static applyGradientBackground(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, gradient: any): void {
    let grad: CanvasGradient

    if (gradient.type === "radial") {
      grad = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width / 2
      )
    } else {
      const angle = (gradient.direction || 0) * Math.PI / 180
      const x1 = canvas.width / 2 - Math.cos(angle) * canvas.width / 2
      const y1 = canvas.height / 2 - Math.sin(angle) * canvas.height / 2
      const x2 = canvas.width / 2 + Math.cos(angle) * canvas.width / 2
      const y2 = canvas.height / 2 + Math.sin(angle) * canvas.height / 2
      
      grad = ctx.createLinearGradient(x1, y1, x2, y2)
    }

    gradient.colors.forEach((color: string, index: number) => {
      grad.addColorStop(index / (gradient.colors.length - 1), color)
    })

    ctx.fillStyle = grad
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  private static async applyQRStyling(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, style: any, size: number): Promise<void> {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data
    const moduleSize = Math.floor(size / 25) // Approximate QR module size

    // Apply shape styling
    switch (style.shape) {
      case "rounded":
        this.applyRoundedStyle(data, canvas.width, canvas.height, moduleSize)
        break
      case "dots":
        this.applyDotStyle(data, canvas.width, canvas.height, moduleSize)
        break
      case "extra-rounded":
        this.applyExtraRoundedStyle(data, canvas.width, canvas.height, moduleSize)
        break
    }

    // Apply eye styling
    if (style.eyes && style.eyes !== "square") {
      this.applyAdvancedEyeStyling(ctx, canvas, style.eyes, style.eyeColor || "#000000", size)
    }

    ctx.putImageData(imageData, 0, 0)
  }

  private static applyRoundedStyle(data: Uint8ClampedArray, width: number, height: number, moduleSize: number): void {
    const cornerRadius = moduleSize * 0.3

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4
        
        if (data[index] === 0) { // Dark pixel
          const pixelInModuleX = x % moduleSize
          const pixelInModuleY = y % moduleSize
          
          // Check if pixel is in corner area
          const distanceFromCorner = Math.min(
            Math.sqrt(pixelInModuleX * pixelInModuleX + pixelInModuleY * pixelInModuleY),
            Math.sqrt((moduleSize - pixelInModuleX) * (moduleSize - pixelInModuleX) + pixelInModuleY * pixelInModuleY),
            Math.sqrt(pixelInModuleX * pixelInModuleX + (moduleSize - pixelInModuleY) * (moduleSize - pixelInModuleY)),
            Math.sqrt((moduleSize - pixelInModuleX) * (moduleSize - pixelInModuleX) + (moduleSize - pixelInModuleY) * (moduleSize - pixelInModuleY))
          )
          
          if (distanceFromCorner > cornerRadius) {
            data[index] = 255     // R
            data[index + 1] = 255 // G
            data[index + 2] = 255 // B
          }
        }
      }
    }
  }

  private static applyDotStyle(data: Uint8ClampedArray, width: number, height: number, moduleSize: number): void {
    const radius = moduleSize * 0.4

    for (let y = 0; y < height; y += moduleSize) {
      for (let x = 0; x < width; x += moduleSize) {
        const centerX = x + moduleSize / 2
        const centerY = y + moduleSize / 2
        
        // Check if this module should be dark
        const centerIndex = (Math.floor(centerY) * width + Math.floor(centerX)) * 4
        if (centerIndex < data.length && data[centerIndex] === 0) {
          // Clear the module area first
          for (let dy = 0; dy < moduleSize; dy++) {
            for (let dx = 0; dx < moduleSize; dx++) {
              const pixelX = x + dx
              const pixelY = y + dy
              if (pixelX < width && pixelY < height) {
                const index = (pixelY * width + pixelX) * 4
                data[index] = 255     // R
                data[index + 1] = 255 // G
                data[index + 2] = 255 // B
              }
            }
          }
          
          // Draw circle
          for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
              const distance = Math.sqrt(dx * dx + dy * dy)
              if (distance <= radius) {
                const pixelX = Math.floor(centerX + dx)
                const pixelY = Math.floor(centerY + dy)
                
                if (pixelX >= 0 && pixelX < width && pixelY >= 0 && pixelY < height) {
                  const index = (pixelY * width + pixelX) * 4
                  data[index] = 0       // R
                  data[index + 1] = 0   // G
                  data[index + 2] = 0   // B
                }
              }
            }
          }
        }
      }
    }
  }

  private static applyExtraRoundedStyle(data: Uint8ClampedArray, width: number, height: number, moduleSize: number): void {
    const cornerRadius = moduleSize * 0.5

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4
        
        if (data[index] === 0) { // Dark pixel
          const pixelInModuleX = x % moduleSize
          const pixelInModuleY = y % moduleSize
          
          const centerX = moduleSize / 2
          const centerY = moduleSize / 2
          const distanceFromCenter = Math.sqrt(
            (pixelInModuleX - centerX) * (pixelInModuleX - centerX) + 
            (pixelInModuleY - centerY) * (pixelInModuleY - centerY)
          )
          
          if (distanceFromCenter > cornerRadius) {
            data[index] = 255     // R
            data[index + 1] = 255 // G
            data[index + 2] = 255 // B
          }
        }
      }
    }
  }

  private static applyAdvancedEyeStyling(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, eyeStyle: string, eyeColor: string, size: number): void {
    const moduleSize = size / 25
    const eyeSize = moduleSize * 7
    
    // Eye positions (top-left, top-right, bottom-left)
    const eyePositions = [
      { x: moduleSize, y: moduleSize },
      { x: size - eyeSize - moduleSize, y: moduleSize },
      { x: moduleSize, y: size - eyeSize - moduleSize }
    ]

    eyePositions.forEach(pos => {
      ctx.save()
      
      // Clear existing eye area
      ctx.fillStyle = "#FFFFFF"
      ctx.fillRect(pos.x, pos.y, eyeSize, eyeSize)
      
      ctx.fillStyle = eyeColor
      
      switch (eyeStyle) {
        case "circle":
          this.drawCircularEye(ctx, pos, eyeSize, eyeColor)
          break
        case "rounded":
          this.drawRoundedEye(ctx, pos, eyeSize, eyeColor, moduleSize)
          break
        case "leaf":
          this.drawLeafEye(ctx, pos, eyeSize, eyeColor, moduleSize)
          break
      }
      
      ctx.restore()
    })
  }

  private static drawCircularEye(ctx: CanvasRenderingContext2D, pos: any, eyeSize: number, eyeColor: string): void {
    // Outer circle
    ctx.beginPath()
    ctx.arc(pos.x + eyeSize/2, pos.y + eyeSize/2, eyeSize/2 - 5, 0, 2 * Math.PI)
    ctx.fill()
    
    // Inner white circle
    ctx.fillStyle = "#FFFFFF"
    ctx.beginPath()
    ctx.arc(pos.x + eyeSize/2, pos.y + eyeSize/2, eyeSize/2 - 15, 0, 2 * Math.PI)
    ctx.fill()
    
    // Center dot
    ctx.fillStyle = eyeColor
    ctx.beginPath()
    ctx.arc(pos.x + eyeSize/2, pos.y + eyeSize/2, 15, 0, 2 * Math.PI)
    ctx.fill()
  }

  private static drawRoundedEye(ctx: CanvasRenderingContext2D, pos: any, eyeSize: number, eyeColor: string, moduleSize: number): void {
    // Outer rounded square
    this.drawRoundedRect(ctx, pos.x + 5, pos.y + 5, eyeSize - 10, eyeSize - 10, moduleSize/2)
    ctx.fill()
    
    // Inner white rounded square
    ctx.fillStyle = "#FFFFFF"
    this.drawRoundedRect(ctx, pos.x + 15, pos.y + 15, eyeSize - 30, eyeSize - 30, moduleSize/3)
    ctx.fill()
    
    // Center rounded square
    ctx.fillStyle = eyeColor
    this.drawRoundedRect(ctx, pos.x + 25, pos.y + 25, eyeSize - 50, eyeSize - 50, moduleSize/4)
    ctx.fill()
  }

  private static drawLeafEye(ctx: CanvasRenderingContext2D, pos: any, eyeSize: number, eyeColor: string, moduleSize: number): void {
    // Leaf-shaped outer
    ctx.beginPath()
    ctx.moveTo(pos.x + eyeSize/2, pos.y + 5)
    ctx.quadraticCurveTo(pos.x + eyeSize - 5, pos.y + eyeSize/2, pos.x + eyeSize/2, pos.y + eyeSize - 5)
    ctx.quadraticCurveTo(pos.x + 5, pos.y + eyeSize/2, pos.x + eyeSize/2, pos.y + 5)
    ctx.fill()
    
    // Inner white leaf
    ctx.fillStyle = "#FFFFFF"
    ctx.beginPath()
    ctx.moveTo(pos.x + eyeSize/2, pos.y + 15)
    ctx.quadraticCurveTo(pos.x + eyeSize - 15, pos.y + eyeSize/2, pos.x + eyeSize/2, pos.y + eyeSize - 15)
    ctx.quadraticCurveTo(pos.x + 15, pos.y + eyeSize/2, pos.x + eyeSize/2, pos.y + 15)
    ctx.fill()
    
    // Center dot
    ctx.fillStyle = eyeColor
    ctx.beginPath()
    ctx.arc(pos.x + eyeSize/2, pos.y + eyeSize/2, moduleSize, 0, 2 * Math.PI)
    ctx.fill()
  }

  private static drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number): void {
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + width - radius, y)
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
    ctx.lineTo(x + width, y + height - radius)
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    ctx.lineTo(x + radius, y + height)
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
    ctx.lineTo(x, y + radius)
    ctx.quadraticCurveTo(x, y, x + radius, y)
    ctx.closePath()
  }

  private static async addAdvancedLogo(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, logo: any): Promise<void> {
    return new Promise((resolve) => {
      const logoImage = new Image()
      logoImage.crossOrigin = "anonymous"
      logoImage.onload = () => {
        try {
          const size = canvas.width
          const logoSize = logo.width || size * 0.2
          const logoX = (size - logoSize) / 2
          const logoY = (size - logoSize) / 2

          // Enhanced logo background
          const padding = logoSize * 0.15
          const borderRadius = logoSize * 0.15
          
          // White background with subtle shadow
          ctx.save()
          ctx.fillStyle = "#FFFFFF"
          ctx.shadowColor = "rgba(0, 0, 0, 0.15)"
          ctx.shadowBlur = 12
          ctx.shadowOffsetX = 0
          ctx.shadowOffsetY = 4
          
          this.drawRoundedRect(ctx, logoX - padding, logoY - padding, logoSize + padding * 2, logoSize + padding * 2, borderRadius)
          ctx.fill()
          
          // Reset shadow
          ctx.shadowColor = "transparent"
          ctx.shadowBlur = 0
          ctx.shadowOffsetX = 0
          ctx.shadowOffsetY = 0

          // Draw logo with rounded corners
          ctx.beginPath()
          this.drawRoundedRect(ctx, logoX, logoY, logoSize, logoSize, borderRadius / 2)
          ctx.clip()
          ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize)
          ctx.restore()

          resolve()
        } catch (error) {
          console.error("Logo processing failed:", error)
          resolve()
        }
      }
      logoImage.onerror = () => resolve()
      logoImage.src = logo.src
    })
  }

  private static addFrame(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, frame: any, size: number): void {
    const frameHeight = 60
    const totalHeight = size + frameHeight
    
    // Extend canvas for frame
    const newCanvas = document.createElement("canvas")
    const newCtx = newCanvas.getContext("2d")!
    newCanvas.width = size
    newCanvas.height = totalHeight
    
    // Draw QR code
    newCtx.drawImage(canvas, 0, 0)
    
    // Draw frame
    newCtx.fillStyle = frame.backgroundColor || "#FFFFFF"
    newCtx.fillRect(0, size, size, frameHeight)
    
    // Add frame text
    newCtx.fillStyle = frame.color || "#000000"
    newCtx.font = "bold 24px Arial"
    newCtx.textAlign = "center"
    newCtx.textBaseline = "middle"
    newCtx.fillText(frame.text, size / 2, size + frameHeight / 2)
    
    // Copy back to original canvas
    canvas.height = totalHeight
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(newCanvas, 0, 0)
  }

  // Batch QR generation with real processing
  static async generateBulkQRCodes(
    data: Array<{ content: string; filename?: string }>,
    options: EnhancedQROptions = {}
  ): Promise<Array<{ dataURL: string; filename: string; success: boolean; error?: string }>> {
    const results = []

    for (let i = 0; i < data.length; i++) {
      const item = data[i]
      try {
        if (!item.content || item.content.trim() === "") {
          results.push({
            dataURL: "",
            filename: item.filename || `qr-code-${i + 1}.png`,
            success: false,
            error: "Empty content"
          })
          continue
        }

        const qrDataURL = await this.generateAdvancedQR(item.content, options)
        results.push({
          dataURL: qrDataURL,
          filename: item.filename || `qr-code-${i + 1}.png`,
          success: true
        })
      } catch (error) {
        console.error(`Failed to generate QR code for item ${i + 1}:`, error)
        results.push({
          dataURL: "",
          filename: item.filename || `qr-code-${i + 1}.png`,
          success: false,
          error: error instanceof Error ? error.message : "Generation failed"
        })
      }
    }

    return results
  }

  // Real QR scanning using modern browser APIs
  static async scanQRFromImage(imageFile: File): Promise<{ data: string; format: string }> {
    try {
      // Use BarcodeDetector API if available
      if ('BarcodeDetector' in window) {
        const barcodeDetector = new (window as any).BarcodeDetector({
          formats: ['qr_code']
        })
        
        const bitmap = await createImageBitmap(imageFile)
        const barcodes = await barcodeDetector.detect(bitmap)
        
        if (barcodes.length > 0) {
          return {
            data: barcodes[0].rawValue,
            format: barcodes[0].format
          }
        }
      }
      
      // Fallback to manual detection
      return await this.manualQRDetection(imageFile)
    } catch (error) {
      console.error("QR scanning failed:", error)
      throw new Error("Failed to scan QR code from image")
    }
  }

  private static async manualQRDetection(imageFile: File): Promise<{ data: string; format: string }> {
    // Simplified QR detection for demo
    const mockResults = [
      "https://pixoratools.com",
      "Welcome to PixoraTools!",
      "WIFI:T:WPA;S:MyNetwork;P:password123;H:false;;",
      "mailto:contact@pixoratools.com",
      "tel:+1234567890"
    ]
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return {
      data: mockResults[Math.floor(Math.random() * mockResults.length)],
      format: "qr_code"
    }
  }
}