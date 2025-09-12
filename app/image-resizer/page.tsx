"use client"

import { UnifiedToolLayout } from "@/components/unified-tool-layout"
import { Maximize2 } from "lucide-react"
import { ImageProcessor } from "@/lib/processors/image-processor"
import { ImageProcessingGuide } from "@/components/content/image-processing-guide"

const resizeOptions = [
  {
    key: "width",
    label: "Width (px)",
    type: "input" as const,
    defaultValue: 800,
    min: 1,
    max: 10000,
    section: "Dimensions",
  },
  {
    key: "height",
    label: "Height (px)",
    type: "input" as const,
    defaultValue: 600,
    min: 1,
    max: 10000,
    section: "Dimensions",
  },
  {
    key: "maintainAspectRatio",
    label: "Lock Aspect Ratio",
    type: "checkbox" as const,
    defaultValue: true,
    section: "Dimensions",
  },
  {
    key: "outputFormat",
    label: "Output Format",
    type: "select" as const,
    defaultValue: "png",
    selectOptions: [
      { value: "png", label: "PNG" },
      { value: "jpeg", label: "JPEG" },
      { value: "webp", label: "WebP" },
    ],
    section: "Output",
  },
  {
    key: "quality",
    label: "Quality",
    type: "slider" as const,
    defaultValue: 90,
    min: 10,
    max: 100,
    step: 5,
    section: "Output",
  },
]

async function resizeImages(files: any[], options: any): Promise<{ success: boolean; processedFiles?: any[]; error?: string }> {
  try {
    if (files.length === 0) {
      return {
        success: false,
        error: "No files to process",
      }
    }

    const processedFiles = await Promise.all(
      files.map(async (file) => {
        const processedBlob = await ImageProcessor.resizeImage(file.originalFile || file.file, {
          width: options.width,
          height: options.height,
          maintainAspectRatio: options.maintainAspectRatio,
          outputFormat: options.outputFormat,
          quality: options.quality,
          backgroundColor: options.outputFormat === "jpeg" ? "#ffffff" : undefined
        })

        const processedUrl = URL.createObjectURL(processedBlob)
        const baseName = file.name.split(".")[0]
        const newName = `${baseName}_resized.${options.outputFormat}`

        return {
          ...file,
          processed: true,
          processedPreview: processedUrl,
          name: newName,
          processedSize: processedBlob.size,
          blob: processedBlob,
          dimensions: { width: options.width || file.dimensions?.width, height: options.height || file.dimensions?.height }
        }
      })
    )

    return {
      success: true,
      processedFiles,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to resize images",
    }
  }
}

export default function ImageResizerPage() {
  const richContent = (
    <ImageProcessingGuide 
      toolName="Image Resizer"
      toolType="resize"
      className="py-8"
    />
  )

  return (
    <UnifiedToolLayout
      title="Resize Image"
      description="Resize images with precision using custom dimensions, percentage scaling, and aspect ratio presets. Advanced algorithms maintain quality while optimizing for web, social media, and print applications."
      icon={Maximize2}
      toolType="image"
      processFunction={resizeImages}
      options={resizeOptions}
      maxFiles={20}
      allowBatchProcessing={true}
      supportedFormats={["image/jpeg", "image/png", "image/webp", "image/gif"]}
      outputFormats={["jpeg", "png", "webp"]}
      richContent={richContent}
    />
  )
}