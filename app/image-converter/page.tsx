"use client"

import { UnifiedToolLayout } from "@/components/unified-tool-layout"
import { RefreshCw } from "lucide-react"
import { ImageProcessor } from "@/lib/processors/image-processor"
import { ImageProcessingGuide } from "@/components/content/image-processing-guide"
import { PersistentAdManager } from "@/components/ads/persistent-ad-manager"

const convertOptions = [
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
  {
    key: "backgroundColor",
    label: "Background Color (JPEG)",
    type: "color" as const,
    defaultValue: "#ffffff",
    section: "Output",
    condition: (options) => options.outputFormat === "jpeg",
  },
]

async function convertImages(files: any[], options: any) {
  try {
    if (files.length === 0) {
      return {
        success: false,
        error: "No files to process",
      }
    }

    const processedFiles = await Promise.all(
      files.map(async (file) => {
        const processedBlob = await ImageProcessor.convertFormat(
          file.originalFile || file.file,
          options.outputFormat as "jpeg" | "png" | "webp",
          {
            outputFormat: options.outputFormat as "jpeg" | "png" | "webp",
            quality: options.quality,
            backgroundColor: options.backgroundColor,
          },
        )

        const processedUrl = URL.createObjectURL(processedBlob)
        const baseName = file.name.split(".")[0]
        const newName = `${baseName}.${options.outputFormat}`

        return {
          ...file,
          processed: true,
          processedPreview: processedUrl,
          name: newName,
          processedSize: processedBlob.size,
          blob: processedBlob,
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
      error: error instanceof Error ? error.message : "Failed to convert images",
    }
  }
}

export default function ImageConverterPage() {
  const richContent = (
    <ImageProcessingGuide 
      toolName="Image Converter"
      toolType="convert"
      className="py-8"
    />
  )

  return (
    <UnifiedToolLayout
      title="Image Converter"
      description="Convert images between different formats including JPEG, PNG, WebP, and AVIF. Advanced quality controls and background color options for professional results."
      icon={RefreshCw}
      toolType="image"
      processFunction={convertImages}
      options={convertOptions}
      maxFiles={15}
      allowBatchProcessing={true}
      supportedFormats={["image/jpeg", "image/png", "image/gif", "image/webp"]}
      outputFormats={["jpeg", "png", "webp"]}
      richContent={richContent}
    />
  )
}