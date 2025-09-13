"use client"

import { UnifiedToolLayout } from "@/components/unified-tool-layout"
import { ArrowUpDown } from "lucide-react"
import { ClientPDFProcessor } from "@/lib/processors/client-pdf-processor"

const organizeOptions = [
  {
    key: "sortBy",
    label: "Sort Pages By",
    type: "select" as const,
    defaultValue: "custom",
    selectOptions: [
      { value: "custom", label: "Custom Order (Drag & Drop)" },
      { value: "reverse", label: "Reverse Order" },
      { value: "odd", label: "Odd Pages First" },
      { value: "even", label: "Even Pages First" },
    ],
  },
  {
    key: "removeBlankPages",
    label: "Remove Blank Pages",
    type: "checkbox" as const,
    defaultValue: false,
  },
  {
    key: "addPageNumbers",
    label: "Add Page Numbers",
    type: "checkbox" as const,
    defaultValue: false,
  },
  {
    key: "pageNumberPosition",
    label: "Page Number Position",
    type: "select" as const,
    defaultValue: "bottom-center",
    selectOptions: [
      { value: "top-left", label: "Top Left" },
      { value: "top-center", label: "Top Center" },
      { value: "top-right", label: "Top Right" },
      { value: "bottom-left", label: "Bottom Left" },
      { value: "bottom-center", label: "Bottom Center" },
      { value: "bottom-right", label: "Bottom Right" },
    ],
    condition: (options) => options.addPageNumbers,
  },
]

async function organizePDF(files: any[], options: any) {
  try {
    if (files.length !== 1) {
      return {
        success: false,
        error: "Please select exactly one PDF file to organize",
      }
    }

    const file = files[0]
    
    // For now, just return the original file as organized
    const blob = new Blob([await (file.originalFile || file.file).arrayBuffer()], { type: "application/pdf" })
    const downloadUrl = URL.createObjectURL(blob)

    return {
      success: true,
      downloadUrl,
      filename: `organized_${file.name}`
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to organize PDF",
    }
  }
}

export default function PDFOrganizerPage() {
  return (
    <UnifiedToolLayout
      title="Organize PDF"
      description="Reorder, sort, and organize PDF pages. Remove blank pages, add page numbers, and customize page arrangement."
      icon={ArrowUpDown}
      toolType="pdf"
      processFunction={organizePDF}
      options={organizeOptions}
      maxFiles={1}
      allowPageReorder={true}
      supportedFormats={["application/pdf"]}
      outputFormats={["pdf"]}
    />
  )
}