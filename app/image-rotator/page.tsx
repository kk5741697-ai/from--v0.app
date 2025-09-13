"use client"

import { UnifiedToolLayout } from "@/components/unified-tool-layout"
import { RotateCw } from "lucide-react"
import { ImageProcessor } from "@/lib/processors/image-processor"
import { ImageProcessingGuide } from "@/components/content/image-processing-guide"

export const metadata = {
  title: "Image Rotator - Rotate Images Online",
  description: "Rotate images by preset angles (90°, 180°, 270°) or any custom angle. Perfect for fixing orientation and creating artistic effects with precise control."
}
const rotateOptions = [
  {
    key: "angle",
    label: "Rotation Angle",
    type: "select" as const,
    defaultValue: "90",
    selectOptions: [
      { value: "90", label: "90° (Quarter Turn Right)" },
      { value: "-90", label: "-90° (Quarter Turn Left)" },
      { value: "180", label: "180° (Half Turn)" },
      { value: "270", label: "270° (Three Quarter Turn)" },
      { value: "custom", label: "Custom Angle" },
    ],
    section: "Rotation",
  },
  {
    key: "customAngle",
    label: "Custom Angle (degrees)",
    type: "input" as const,
    defaultValue: 0,
    min: -360,
    max: 360,
    section: "Rotation",
    condition: (options) => options.angle === "custom",
  }
]

async function rotateImages(files: any[], options: any) {
  try {
    if (files.length === 0) {
      return {
        success: false,
        error: "No files to process",
      }
    }

    const processedFiles = await Promise.all(
      files.map(async (file) => {
        const angle =
          options.angle === "custom" ? options.customAngle || 0 : Number.parseInt(options.angle) || 90

        const processedBlob = await ImageProcessor.rotateImage(file.originalFile || file.file, {
          customRotation: angle,
          outputFormat: "png",
        })

        const processedUrl = URL.createObjectURL(processedBlob)

        const baseName = file.name.split(".")[0]
        const newName = `${baseName}_rotated_${angle}deg.png`

        // Calculate new dimensions for 90° and 270° rotations
        const shouldSwapDimensions = Math.abs(angle) === 90 || Math.abs(angle) === 270
        const newDimensions =
          shouldSwapDimensions && file.dimensions
            ? { width: file.dimensions.height, height: file.dimensions.width }
            : file.dimensions

        return {
          ...file,
          processed: true,
          processedPreview: processedUrl,
          name: newName,
          processedSize: processedBlob.size,
          blob: processedBlob,
          dimensions: newDimensions,
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
      error: error instanceof Error ? error.message : "Failed to rotate images",
    }
  }
}

export default function ImageRotatorPage() {
  const richContent = (
    <ImageProcessingGuide 
      toolName="Image Rotator"
      toolType="rotate"
      className="py-8"
    />
  )

  return (
    <UnifiedToolLayout
      title="Image Rotator"
      description="Rotate images by preset angles (90°, 180°, 270°) or any custom angle. Perfect for fixing orientation and creating artistic effects with precise control."
      icon={RotateCw}
      toolType="image"
      processFunction={rotateImages}
      options={rotateOptions}
      maxFiles={10}
      allowBatchProcessing={true}
      supportedFormats={["image/jpeg", "image/png", "image/webp"]}
      outputFormats={["jpeg", "png", "webp"]}
      richContent={richContent}
    />
  )
}
