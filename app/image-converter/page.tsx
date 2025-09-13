"use client"

import { UnifiedToolLayout } from "@/components/unified-tool-layout"
import { RefreshCw } from "lucide-react"
import { ImageProcessor } from "@/lib/processors/image-processor"
import { ImageProcessingGuide } from "@/components/content/image-processing-guide"

export const metadata = {
  title: "Image Converter - Convert Image Formats Online",
  description: "Convert images between different formats including JPEG, PNG, WebP, and AVIF. Advanced quality controls and background color options for professional results."
}

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
      { value: "avif", label: "AVIF" },
    ],
    section: "Output",
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
            quality: 90,
            backgroundColor: "#ffffff",
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