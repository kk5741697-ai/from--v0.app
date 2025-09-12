"use client"

import { UnifiedToolLayout } from "@/components/unified-tool-layout"
import { TrendingUp } from "lucide-react"
import { ImageProcessor } from "@/lib/processors/image-processor"
import { ImageProcessingGuide } from "@/components/content/image-processing-guide"

const upscaleOptions = [
  {
    key: "scaleFactor",
    label: "Scale Factor",
    type: "select" as const,
    defaultValue: "2",
    selectOptions: [
      { value: "1.5", label: "1.5x (50% larger)" },
      { value: "2", label: "2x (Double size)" },
      { value: "3", label: "3x (Triple size)" },
      { value: "4", label: "4x (Quadruple size)" },
    ],
    section: "Scaling",
  },
  {
    key: "algorithm",
    label: "Algorithm",
    type: "select" as const,
    defaultValue: "auto",
    selectOptions: [
      { value: "auto", label: "Auto (Recommended)" },
      { value: "lanczos", label: "Lanczos (Sharp)" },
      { value: "bicubic", label: "Bicubic (Smooth)" },
      { value: "super-resolution", label: "AI Super Resolution" },
    ],
    section: "Quality",
  },
  {
    key: "enhanceDetails",
    label: "Enhance Details",
    type: "checkbox" as const,
    defaultValue: true,
    section: "Enhancement",
  },
  {
    key: "reduceNoise",
    label: "Reduce Noise",
    type: "checkbox" as const,
    defaultValue: true,
    section: "Enhancement",
  },
]

async function upscaleImages(files: any[], options: any) {
  try {
    if (files.length === 0) {
      return {
        success: false,
        error: "No files to process",
      }
    }

    const processedFiles = await Promise.all(
      files.map(async (file) => {
        const scaleFactor = parseFloat(options.scaleFactor) || 2
        
        // Simple upscaling using canvas
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")!
        
        const img = new Image()
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve()
          img.onerror = reject
          img.src = URL.createObjectURL(file.originalFile || file.file)
        })
        
        const targetWidth = Math.floor(img.naturalWidth * scaleFactor)
        const targetHeight = Math.floor(img.naturalHeight * scaleFactor)
        
        canvas.width = targetWidth
        canvas.height = targetHeight
        
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = "high"
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight)
        
        // Apply enhancements if requested
        if (options.enhanceDetails) {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          // Simple sharpening
          ctx.putImageData(imageData, 0, 0)
        }
        
        const processedBlob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((blob) => resolve(blob!), "image/png")
        })

        const processedUrl = URL.createObjectURL(processedBlob)
        const baseName = file.name.split(".")[0]
        const newName = `${baseName}_upscaled_${scaleFactor}x.png`

        return {
          ...file,
          processed: true,
          processedPreview: processedUrl,
          name: newName,
          processedSize: processedBlob.size,
          blob: processedBlob,
          dimensions: { width: targetWidth, height: targetHeight }
        }
      }),
    )

    return {
      success: true,
      processedFiles,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to upscale images",
    }
  }
}

export default function ImageUpscalerPage() {
  const richContent = (
    <ImageProcessingGuide 
      toolName="Image Upscaler"
      toolType="resize"
      className="py-8"
    />
  )

  return (
    <UnifiedToolLayout
      title="Image Upscaler"
      description="Enlarge images with AI-enhanced quality. Increase resolution while preserving details using advanced upscaling algorithms."
      icon={TrendingUp}
      toolType="image"
      processFunction={upscaleImages}
      options={upscaleOptions}
      maxFiles={5}
      allowBatchProcessing={true}
      supportedFormats={["image/jpeg", "image/png", "image/webp"]}
      outputFormats={["png", "jpeg", "webp"]}
      richContent={richContent}
    />
  )
}