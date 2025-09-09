"use client"

import { PDFToolsLayout } from "@/components/pdf-tools-layout"
import { Scissors } from "lucide-react"

const splitOptions = [
  {
    key: "splitMode",
    label: "Split Mode",
    type: "select" as const,
    defaultValue: "pages",
    selectOptions: [
      { value: "pages", label: "Extract Selected Pages" },
      { value: "range", label: "Page Ranges" },
      { value: "size", label: "Equal Parts" },
    ],
    section: "Split Settings",
  },
  {
    key: "equalParts",
    label: "Number of Parts",
    type: "input" as const,
    defaultValue: 2,
    min: 2,
    max: 20,
    section: "Split Settings",
    condition: (options) => options.splitMode === "size",
  },
  {
    key: "preserveMetadata",
    label: "Preserve Metadata",
    type: "checkbox" as const,
    defaultValue: true,
    section: "Options",
  },
]

async function splitPDF(files: any[], options: any) {
  try {
    if (files.length !== 1) {
      return {
        success: false,
        error: "Please select exactly one PDF file to split",
      }
    }

    const file = files[0]

    // Prepare form data for server-side processing
    const formData = new FormData()
    formData.append("file", file.originalFile || file.file)

    // Process selected pages for server
    const processedOptions = { ...options }
    if (options.selectedPages && options.selectedPages.length > 0) {
      processedOptions.selectedPages = options.selectedPages
        .map((pageKey: string) => {
          const parts = pageKey.split("-")
          return Number.parseInt(parts[parts.length - 1])
        })
        .filter((num: number) => !isNaN(num))
        .sort((a: number, b: number) => a - b)
    }

    formData.append("options", JSON.stringify(processedOptions))

    // Call server-side API
    const response = await fetch("/api/pdf/split", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to split PDF")
    }

    // Get the response as blob for download
    const blob = await response.blob()
    const downloadUrl = URL.createObjectURL(blob)

    // Determine filename from response headers
    const contentDisposition = response.headers.get("content-disposition")
    let filename = `${file.name.replace(".pdf", "")}_split.pdf`

    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="([^"]+)"/)
      if (filenameMatch) {
        filename = filenameMatch[1]
      }
    }

    return {
      success: true,
      downloadUrl,
      filename,
    }
  } catch (error) {
    console.error("Split PDF error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to split PDF",
    }
  }
}

export default function PDFSplitterPage() {
  return (
    <PDFToolsLayout
      title="Split PDF"
      description="Split large PDF files into smaller documents by extracting specific pages, page ranges, or equal parts. Real server-side processing ensures accurate results."
      icon={Scissors}
      toolType="split"
      processFunction={splitPDF}
      options={splitOptions}
      maxFiles={1}
      allowPageSelection={true}
    />
  )
}
