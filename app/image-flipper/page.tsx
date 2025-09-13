"use client"

import { UnifiedToolLayout } from "@/components/unified-tool-layout"
import { FlipHorizontal } from "lucide-react"
import { ImageProcessor } from "@/lib/processors/image-processor"
import { ImageProcessingGuide } from "@/components/content/image-processing-guide"

const flipOptions = [
  {
    key: "flipDirection",
    label: "Flip Direction",
    type: "select" as const,
    defaultValue: "horizontal",
    selectOptions: [
      { value: "horizontal", label: "Horizontal (Left ↔ Right)" },
      { value: "vertical", label: "Vertical (Top ↔ Bottom)" },
      { value: "both", label: "Both Directions" },
    ],
    section: "Flip Settings",
  },
]

async function flipImages(files: any[], options: any) {
  try {
    const processedFiles = await Promise.all(
      files.map(async (file) => {
        const processedBlob = await ImageProcessor.flipImage(file.originalFile || file.file, {
          flipDirection: options.flipDirection,
          outputFormat: "png",
        })

        const processedUrl = URL.createObjectURL(processedBlob)

        const baseName = file.name.split(".")[0]
        const newName = `${baseName}_flipped.png`

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
      error: error instanceof Error ? error.message : "Failed to flip images",
    }
  }
}

export default function ImageFlipperPage() {
  const richContent = (
    <ImageProcessingGuide 
      toolName="Image Flipper"
      toolType="flip"
      className="py-8"
    />
  )

  return (
    <UnifiedToolLayout
      title="Flip Image"
      description="Flip images horizontally, vertically, or both directions with batch processing support. Perfect for creating mirror effects and correcting image orientation."
      icon={FlipHorizontal}
      toolType="image"
      processFunction={flipImages}
      options={flipOptions}
      maxFiles={20}
      allowBatchProcessing={true}
      supportedFormats={["image/jpeg", "image/png", "image/webp", "image/gif"]}
      outputFormats={["png", "jpeg", "webp"]}
      richContent={richContent}
    />
  )
}
