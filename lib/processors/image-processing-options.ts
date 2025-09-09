export interface ImageProcessingOptions {
  // Basic options
  quality?: number
  width?: number
  height?: number
  maintainAspectRatio?: boolean
  outputFormat?: "jpeg" | "png" | "webp"
  backgroundColor?: string
  
  // Flip options
  flipDirection?: "horizontal" | "vertical" | "both"
  
  // Rotation options
  rotation?: number
  customRotation?: number
  
  // Compression options
  compressionLevel?: "low" | "medium" | "high" | "maximum"
  
  // Watermark options
  watermarkText?: string
  watermarkOpacity?: number
  fontSize?: number
  textColor?: string
  position?: "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right" | "diagonal"
  useImageWatermark?: boolean
  watermarkImageUrl?: string
  
  // Filter options
  filters?: {
    brightness?: number
    contrast?: number
    saturation?: number
    blur?: number
    sepia?: boolean
    grayscale?: boolean
  }
  
  // Crop options
  cropArea?: { x: number; y: number; width: number; height: number }
  
  // Background removal options
  algorithm?: "auto" | "edge-detection" | "color-clustering"
  sensitivity?: number
  featherEdges?: boolean
  preserveDetails?: boolean
}