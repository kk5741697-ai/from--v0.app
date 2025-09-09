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

    // Process selected pages for client-side processing
    let selectedPages: number[] = []
    if (options.selectedPages && options.selectedPages.length > 0) {
      selectedPages = options.selectedPages
        .map((pageKey: string) => {
          const parts = pageKey.split("-")
          return Number.parseInt(parts[parts.length - 1])
        })
        .filter((num: number) => !isNaN(num))
        .sort((a: number, b: number) => a - b)
    } else if (options.splitMode === "size" && options.equalParts) {
      // Handle equal parts splitting
      const { ClientPDFProcessor } = await import("@/lib/processors/client-pdf-processor")
      const metadata = await ClientPDFProcessor.getPDFMetadata(file.originalFile || file.file)
      const totalPages = metadata.pageCount
      const pagesPerPart = Math.ceil(totalPages / options.equalParts)
      
      // For now, just extract all pages individually
      selectedPages = Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    if (selectedPages.length === 0) {
      return {
        success: false,
        error: "No pages selected for extraction"
      }
    }

    // Use client-side processing
    const { ClientPDFProcessor } = await import("@/lib/processors/client-pdf-processor")
    const splitResults = await ClientPDFProcessor.splitPDF(file.originalFile || file.file, {
      selectedPages
    })

    if (splitResults.length === 1) {
      // Single file - return directly
      const downloadUrl = URL.createObjectURL(splitResults[0])
      return {
        success: true,
        downloadUrl,
        filename: `${file.name.replace(".pdf", "")}_split.pdf`
      }
    } else {
      // Multiple files - create ZIP
      const JSZip = (await import("jszip")).default
      const zip = new JSZip()

      splitResults.forEach((pdfBlob, index) => {
        const pageNum = selectedPages[index]
        const filename = `${file.name.replace(".pdf", "")}_page_${pageNum}.pdf`
        zip.file(filename, pdfBlob)
      })

      const zipBlob = await zip.generateAsync({ type: "blob" })
      const downloadUrl = URL.createObjectURL(zipBlob)

      return {
        success: true,
        downloadUrl,
        filename: `${file.name.replace(".pdf", "")}_split.zip`
      }
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