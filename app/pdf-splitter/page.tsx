"use client"

import { PDFToolsLayout } from "@/components/tools-layouts/pdf-tools-layout"
import { Scissors } from "lucide-react"
import { ClientPDFProcessor } from "@/lib/processors/client-pdf-processor"
import { PDFProcessingGuide } from "@/components/content/pdf-processing-guide"

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

async function splitPDF(files: any[], options: any): Promise<{ success: boolean; downloadUrl?: string; filename?: string; error?: string }> {
  try {
    if (files.length !== 1) {
      return {
        success: false,
        error: "Please select exactly one PDF file to split",
      }
    }

    const file = files[0]

    // Validate file
    if (!file.originalFile && !file.file) {
      return {
        success: false,
        error: "Invalid file object"
      }
    }
    const selectedPages: number[] = []
    if (options.selectedPages && Array.isArray(options.selectedPages)) {
      options.selectedPages.forEach((pageKey: string) => {
        if (typeof pageKey === 'string' && pageKey.includes('-page-')) {
          const parts = pageKey.split("-")
          const pageNum = Number.parseInt(parts[parts.length - 1])
          if (!isNaN(pageNum)) {
            selectedPages.push(pageNum)
          }
        }
      })
      selectedPages.sort((a, b) => a - b)
    }

    if (selectedPages.length === 0) {
      return {
        success: false,
        error: "Please select at least one page to extract"
      }
    }

    console.log(`Splitting PDF: ${selectedPages.length} pages selected:`, selectedPages)
    const splitResults = await ClientPDFProcessor.splitPDF(file.originalFile || file.file, {
      selectedPages
    })

    if (splitResults.length === 1) {
      const downloadUrl = URL.createObjectURL(splitResults[0])
      return {
        success: true,
        downloadUrl,
        filename: `${file.name.replace(".pdf", "")}_split.pdf`
      }
    } else {
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
    console.error("PDF splitting error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to split PDF",
    }
  }
}

export default function PDFSplitterPage() {
  const richContent = (
    <PDFProcessingGuide 
      toolName="PDF Splitter"
      toolType="split"
      className="py-8"
    />
  )

  return (
    <PDFToolsLayout
      title="Split PDF"
      description="Split large PDF files into smaller documents by extracting specific pages, page ranges, or equal parts. Advanced page selection with visual thumbnails and drag-to-reorder functionality."
      icon={Scissors}
      toolType="split"
      processFunction={splitPDF}
      options={splitOptions}
      maxFiles={1}
      allowPageSelection={true}
      supportedFormats={["application/pdf"]}
      richContent={richContent}
    />
  )
}