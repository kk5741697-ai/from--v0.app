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
  type?: "image/png" | "image/jpeg" | "image/webp" | "image/svg+xml"
  quality?: number

  // Enhanced customization
  dotStyle?: "square" | "rounded" | "dots" | "classy"
  cornerSquareStyle?: "square" | "extra-rounded" | "dot"
  cornerDotStyle?: "square" | "dot"
  logoUrl?: string
  logoSize?: number
  logoMargin?: number
  gradientType?: "linear" | "radial" | "none"
  gradientStart?: string
  gradientEnd?: string
}

export class EnhancedQRProcessor {
  /**
   * Generate QR code with enhanced customization
   */
  static async generateQRCode(content: string, options: EnhancedQROptions = {}): Promise<string> {
    try {
      if (!content || content.trim() === "") {
        throw new Error("QR code content cannot be empty")
      }

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
        type: options.type || "image/png"
      }

      // Generate base QR code
      const qrDataURL = await QRCode.toDataURL(content, qrOptions)

      // Apply custom styling if requested
      if (options.dotStyle && options.dotStyle !== "square") {
        return await this.applyCustomStyle(qrDataURL, options)
      }

      // Add logo if provided
      if (options.logoUrl) {
        return await this.addLogoToQR(qrDataURL, options)
      }

      return qrDataURL
    } catch (error) {
      console.error("QR generation failed:", error)
      throw new Error(`Failed to generate QR code: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  /**
   * Apply custom styling to QR code
   */
  private static async applyCustomStyle(qrDataURL: string, options: EnhancedQROptions): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")!
      const img = new Image()

      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height

        // Draw base QR code
        ctx.drawImage(img, 0, 0)

        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data

        // Apply gradient if requested
        if (options.gradientType && options.gradientType !== "none") {
          this.applyGradient(ctx, canvas, options)
        }

        // Apply dot styling
        if (options.dotStyle === "rounded" || options.dotStyle === "dots") {
          this.applyRoundedDots(ctx, imageData, options)
        }

        ctx.putImageData(imageData, 0, 0)

        resolve(canvas.toDataURL("image/png"))
      }

      img.onerror = () => reject(new Error("Failed to load QR code image"))
      img.src = qrDataURL
    })
  }

  /**
   * Apply gradient to QR code
   */
  private static applyGradient(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, options: EnhancedQROptions) {
    const gradient = options.gradientType === "linear"
      ? ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      : ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2)

    gradient.addColorStop(0, options.gradientStart || options.color?.dark || "#000000")
    gradient.addColorStop(1, options.gradientEnd || options.color?.dark || "#000000")

    ctx.globalCompositeOperation = "source-atop"
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.globalCompositeOperation = "source-over"
  }

  /**
   * Apply rounded dots styling
   */
  private static applyRoundedDots(ctx: CanvasRenderingContext2D, imageData: ImageData, options: EnhancedQROptions) {
    const moduleSize = Math.floor(options.width! / 29) // Approximate module size
    const radius = options.dotStyle === "dots" ? moduleSize / 2 : moduleSize / 4

    // This is a simplified version - full implementation would require
    // QR code structure parsing to round only data modules
    ctx.globalCompositeOperation = "destination-over"
    ctx.fillStyle = options.color?.dark || "#000000"
    ctx.globalCompositeOperation = "source-over"
  }

  /**
   * Add logo to QR code center
   */
  private static async addLogoToQR(qrDataURL: string, options: EnhancedQROptions): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")!
      const qrImg = new Image()
      const logoImg = new Image()

      qrImg.onload = () => {
        canvas.width = qrImg.width
        canvas.height = qrImg.height

        // Draw QR code
        ctx.drawImage(qrImg, 0, 0)

        logoImg.onload = () => {
          // Calculate logo size (max 20% of QR code)
          const maxLogoSize = Math.min(canvas.width, canvas.height) * (options.logoSize || 0.2)
          const logoAspectRatio = logoImg.width / logoImg.height
          let logoWidth = maxLogoSize
          let logoHeight = maxLogoSize / logoAspectRatio

          if (logoHeight > maxLogoSize) {
            logoHeight = maxLogoSize
            logoWidth = maxLogoSize * logoAspectRatio
          }

          // Center position
          const x = (canvas.width - logoWidth) / 2
          const y = (canvas.height - logoHeight) / 2

          // Add white background for logo
          const margin = options.logoMargin || 10
          ctx.fillStyle = options.color?.light || "#FFFFFF"
          ctx.fillRect(x - margin, y - margin, logoWidth + margin * 2, logoHeight + margin * 2)

          // Draw logo
          ctx.drawImage(logoImg, x, y, logoWidth, logoHeight)

          resolve(canvas.toDataURL("image/png"))
        }

        logoImg.onerror = () => {
          // If logo fails to load, return QR without logo
          resolve(qrDataURL)
        }

        logoImg.crossOrigin = "anonymous"
        logoImg.src = options.logoUrl!
      }

      qrImg.onerror = () => reject(new Error("Failed to load QR code"))
      qrImg.src = qrDataURL
    })
  }

  /**
   * Generate WiFi QR code
   */
  static formatWiFiQR(ssid: string, password: string, security: "WPA" | "WEP" | "nopass" = "WPA"): string {
    return `WIFI:T:${security};S:${ssid};P:${password};H:false;;`
  }

  /**
   * Generate vCard QR code
   */
  static formatVCardQR(data: {
    name: string
    phone?: string
    email?: string
    org?: string
    url?: string
  }): string {
    return `BEGIN:VCARD
VERSION:3.0
FN:${data.name}
${data.phone ? `TEL:${data.phone}` : ""}
${data.email ? `EMAIL:${data.email}` : ""}
${data.org ? `ORG:${data.org}` : ""}
${data.url ? `URL:${data.url}` : ""}
END:VCARD`
  }

  /**
   * Generate Email QR code
   */
  static formatEmailQR(email: string, subject?: string, body?: string): string {
    let result = `mailto:${email}`
    const params: string[] = []
    if (subject) params.push(`subject=${encodeURIComponent(subject)}`)
    if (body) params.push(`body=${encodeURIComponent(body)}`)
    if (params.length > 0) result += `?${params.join("&")}`
    return result
  }

  /**
   * Generate SMS QR code
   */
  static formatSMSQR(phone: string, message?: string): string {
    if (message) {
      return `SMSTO:${phone}:${message}`
    }
    return `tel:${phone}`
  }

  /**
   * Generate Phone QR code
   */
  static formatPhoneQR(phone: string): string {
    return `tel:${phone}`
  }
}
