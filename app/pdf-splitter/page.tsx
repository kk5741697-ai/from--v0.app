"use client"

import { PDFToolsLayout } from "@/components/tools-layouts/pdf-tools-layout"
import { Scissors } from "lucide-react"
import { ClientPDFProcessor } from "@/lib/processors/client-pdf-processor"

const splitOptions = [
  {
    key: "mergeInSingle",
    label: "Merge in single PDF",
    type: "checkbox" as const,
    defaultValue: true,
    section: "Output Settings",
  },
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
    condition: (options: any) => options.splitMode === "size",
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

    // Check if mergeInSingle is enabled (default true)
    const mergeInSingle = options.mergeInSingle !== false

    if (mergeInSingle || splitResults.length === 1) {
      // Merge all selected pages into a single PDF
      const downloadUrl = URL.createObjectURL(splitResults[0])
      return {
        success: true,
        downloadUrl,
        filename: `${file.name.replace(".pdf", "")}_extracted.pdf`
      }
    } else {
      // Create separate PDFs for each page in a ZIP
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
  return (
    <PDFToolsLayout
      title="Split PDF"
      description="Extract specific pages from your PDF and merge them into a single file or download separately"
      icon={Scissors}
      toolType="split"
      processFunction={splitPDF}
      options={splitOptions}
      maxFiles={1}
      allowPageSelection={true}
      supportedFormats={["application/pdf"]}
    />
  )
}
