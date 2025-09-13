"use client"

import { UnifiedToolLayout } from "@/components/unified-tool-layout"
import { Crop } from "lucide-react"
import { ImageProcessor } from "@/lib/processors/image-processor"
import { ImageProcessingGuide } from "@/components/content/image-processing-guide"

export const metadata = {
  title: "Image Cropper - Crop Images Online",
  description: "Crop images with precision using our advanced visual editor, aspect ratio presets, and grid guides. Professional cropping tools for social media, web optimization, and creative projects."
}

const cropOptions = [
  {
    key: "aspectRatio",
    label: "Aspect Ratio",
    type: "select" as const,
    defaultValue: "free",
    selectOptions: [
      { value: "free", label: "Free Form" },
      { value: "1:1", label: "Square (1:1)" },
      { value: "4:3", label: "Standard (4:3)" },
      { value: "16:9", label: "Widescreen (16:9)" },
      { value: "3:2", label: "Photo (3:2)" },
      { value: "9:16", label: "Portrait (9:16)" },
    ],
    section: "Crop Settings",
  },
  {
    key: "cropX",
    label: "X Position (%)",
    type: "input" as const,
    defaultValue: 20,
    min: 0,
    max: 100,
    section: "Position",
  },
  {
    key: "cropY",
    label: "Y Position (%)",
    type: "input" as const,
    defaultValue: 20,
    min: 0,
    max: 100,
    section: "Position",
  },
  {
    key: "cropWidth",
    label: "Width (%)",
    type: "input" as const,
    defaultValue: 60,
    min: 1,
    max: 100,
    section: "Dimensions",
  },
  {
    key: "cropHeight",
    label: "Height (%)",
    type: "input" as const,
    defaultValue: 60,
    min: 1,
    max: 100,
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
]

async function cropImages(files: any[], options: any): Promise<{ success: boolean; processedFiles?: any[]; error?: string }> {
  try {
    if (files.length === 0) {
      return {
        success: false,
        error: "No files to process",
      }
    }

    const processedFiles = await Promise.all(
      files.map(async (file) => {
        const cropArea = {
          x: options.cropX || 20,
          y: options.cropY || 20,
          width: options.cropWidth || 60,
          height: options.cropHeight || 60
        }
        
        const processedBlob = await ImageProcessor.cropImage(file.originalFile || file.file, cropArea, {
          outputFormat: options.outputFormat as "jpeg" | "png" | "webp",
          quality: 95,
          backgroundColor: options.outputFormat === "jpeg" ? "#ffffff" : undefined
        })

        const processedUrl = URL.createObjectURL(processedBlob)
        const baseName = file.name.split(".")[0]
        const newName = `${baseName}_cropped.${options.outputFormat}`

        return {
          ...file,
          processed: true,
          processedPreview: processedUrl,
          name: newName,
          processedSize: processedBlob.size,
          blob: processedBlob
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
      error: error instanceof Error ? error.message : "Failed to crop images",
    }
  }
}

export default function ImageCropperPage() {
  const richContent = (
    <ImageProcessingGuide 
      toolName="Image Cropper"
      toolType="crop"
      className="py-8"
    />
  )

  return (
    <UnifiedToolLayout
      title="Crop Image"
      description="Crop images with precision using our advanced visual editor, aspect ratio presets, and grid guides. Professional cropping tools for social media, web optimization, and creative projects."
      icon={Crop}
      toolType="image"
      processFunction={cropImages}
      options={cropOptions}
      maxFiles={1}
      allowBatchProcessing={false}
      supportedFormats={["image/jpeg", "image/png", "image/webp"]}
      outputFormats={["jpeg", "png", "webp"]}
      richContent={richContent}
    />
  )
}