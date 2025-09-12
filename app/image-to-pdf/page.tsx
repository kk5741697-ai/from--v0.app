"use client"

import { UnifiedToolLayout } from "@/components/unified-tool-layout"
import { FileImage } from "lucide-react"
import { ClientPDFProcessor } from "@/lib/processors/client-pdf-processor"

const convertOptions = [
  {
    key: "pageSize",
    label: "Page Size",
    type: "select" as const,
    defaultValue: "a4",
    selectOptions: [
      { value: "a4", label: "A4" },
      { value: "letter", label: "Letter" },
      { value: "legal", label: "Legal" },
      { value: "a3", label: "A3" },
    ],
    section: "Page Settings",
  },
  {
    key: "orientation",
    label: "Orientation",
    type: "select" as const,
    defaultValue: "portrait",
    selectOptions: [
      { value: "portrait", label: "Portrait" },
      { value: "landscape", label: "Landscape" },
    ],
    section: "Page Settings",
  },
  {
    key: "margin",
    label: "Margin (px)",
    type: "slider" as const,
    defaultValue: 20,
    min: 0,
    max: 100,
    step: 5,
    section: "Layout",
  },
  {
    key: "fitToPage",
    label: "Fit Images to Page",
    type: "checkbox" as const,
    defaultValue: true,
    section: "Layout",
  },
  {
    key: "maintainAspectRatio",
    label: "Maintain Aspect Ratio",
    type: "checkbox" as const,
    defaultValue: true,
    section: "Layout",
  },
]

async function convertImagesToPDF(files: any[], options: any) {
  try {
    if (files.length === 0) {
      return {
        success: false,
        error: "Please select at least one image file to convert",
      }
    }

    // Extract actual File objects
    const imageFiles = files.map((f) => f.originalFile || f.file)

    // Process image to PDF conversion using client-side processor
    const pdfBytes = await ClientPDFProcessor.imagesToPDF(imageFiles, options)
    const pdfBlob = new Blob([pdfBytes], { type: "application/pdf" })

    const downloadUrl = URL.createObjectURL(pdfBlob)

    return {
      success: true,
      downloadUrl,
      filename: "images_to_pdf.pdf",
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to convert images to PDF",
    }
  }
}

export default function ImageToPDFPage() {
  return (
    <UnifiedToolLayout
      title="Image to PDF Converter"
      description="Convert multiple images (JPG, PNG, WebP) into a single PDF document with custom page layouts, margins, and sizing options."
      icon={FileImage}
      toolType="pdf"
      processFunction={convertImagesToPDF}
      options={convertOptions}
      maxFiles={20}
      supportedFormats={["image/jpeg", "image/png", "image/webp", "image/gif"]}
      outputFormats={["pdf"]}
    />
  )
}
