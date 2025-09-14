"use client"

import { ImageToolsLayout } from "@/components/tools-layouts/image-tools-layout"
import { Droplets } from "lucide-react"
import { ImageProcessor } from "@/lib/processors/image-processor"

const watermarkOptions = [
  {
    key: "watermarkText",
    label: "Watermark Text",
    type: "text" as const,
    defaultValue: "© Your Brand",
    section: "Text Watermark",
    condition: (options) => !options.useImageWatermark,
  },
  {
    key: "useImageWatermark",
    label: "Use Image Watermark",
    type: "checkbox" as const,
    defaultValue: false,
    section: "Watermark Type",
  },
  {
    key: "watermarkImageUrl",
    label: "Watermark Image URL",
    type: "text" as const,
    defaultValue: "",
    section: "Image Watermark",
    condition: (options) => options.useImageWatermark,
  },
  {
    key: "fontSize",
    label: "Font Size",
    type: "slider" as const,
    defaultValue: 48,
    min: 8,
    max: 200,
    step: 4,
    section: "Text Watermark",
    condition: (options) => !options.useImageWatermark,
  },
  {
    key: "opacity",
    label: "Opacity",
    type: "slider" as const,
    defaultValue: 50,
    min: 10,
    max: 100,
    step: 5,
    section: "Appearance",
  },
  {
    key: "position",
    label: "Position",
    type: "select" as const,
    defaultValue: "center",
    selectOptions: [
      { value: "center", label: "Center" },
      { value: "top-left", label: "Top Left" },
      { value: "top-right", label: "Top Right" },
      { value: "bottom-left", label: "Bottom Left" },
      { value: "bottom-right", label: "Bottom Right" },
      { value: "diagonal", label: "Diagonal" },
    ],
    section: "Appearance",
  },
  {
    key: "textColor",
    label: "Text Color",
    type: "color" as const,
    defaultValue: "#ffffff",
    section: "Text Watermark",
    condition: (options) => !options.useImageWatermark,
  },
]

async function addWatermarkToImages(files: any[], options: any) {
  try {
    if (!options.useImageWatermark && (!options.watermarkText || options.watermarkText.trim() === "")) {
      return {
        success: false,
        error: "Please provide watermark text or enable image watermark",
      }
    }

    if (options.useImageWatermark && (!options.watermarkImageUrl || options.watermarkImageUrl.trim() === "")) {
      return {
        success: false,
        error: "Please provide a watermark image URL",
      }
    }

    const processedFiles = await Promise.all(
      files.map(async (file) => {
        const watermarkOptions = {
          watermarkOpacity: options.opacity / 100,
          outputFormat: "png",
          position: options.position,
          textColor: options.textColor,
          fontSize: options.fontSize,
          useImageWatermark: options.useImageWatermark,
          watermarkImageUrl: options.watermarkImageUrl,
        }

        const processedBlob = await ImageProcessor.addWatermark(
          file.originalFile || file.file,
          options.watermarkText || "",
          watermarkOptions,
        )

        const processedUrl = URL.createObjectURL(processedBlob)

        const baseName = file.name.split(".")[0]
        const newName = `${baseName}_watermarked.png`

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
      error: error instanceof Error ? error.message : "Failed to add watermark",
    }
  }
}

export default function ImageWatermarkPage() {
  return (
    <ImageToolsLayout
      title="Image Watermark"
      description="Add text or image watermarks to your images for copyright protection and branding. Customize opacity, position, size, and color with support for both text and image watermarks."
      icon={Droplets}
      toolType="watermark"
      processFunction={addWatermarkToImages}
      options={watermarkOptions}
      maxFiles={10}
      allowBatchProcessing={true}
      supportedFormats={["image/jpeg", "image/png", "image/webp"]}
      outputFormats={["jpeg", "png", "webp"]}
    />
  )
}
