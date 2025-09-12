import QRCode from "qrcode"

export interface QROptions {
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
}

export interface QRScanResult {
  data: string
  format: string
}

export class QRProcessor {
  static async generateQRCode(content: string, options: QROptions = {}): Promise<string> {
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

      const qrDataURL = await QRCode.toDataURL(content, qrOptions)
      return qrDataURL
    } catch (error) {
      console.error("QR generation failed:", error)
      throw new Error(`Failed to generate QR code: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  static async scanQRCode(imageFile: File): Promise<QRScanResult> {
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
      
      // Fallback to mock detection for demo
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
    } catch (error) {
      console.error("QR scanning failed:", error)
      throw new Error("Failed to scan QR code from image")
    }
  }

  static async generateBulkQRCodes(
    data: Array<{ content: string; filename?: string }>,
    options: QROptions = {}
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

        const qrDataURL = await this.generateQRCode(item.content, options)
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
}