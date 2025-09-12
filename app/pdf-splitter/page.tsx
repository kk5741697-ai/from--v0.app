"use client"

import { UnifiedToolLayout } from "@/components/unified-tool-layout"
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

async function splitPDF(files: any[], options: any) {
  try {
    if (files.length !== 1) {
      return {
        success: false,
        error: "Please select exactly one PDF file to split",
      }
    }

    const file = files[0]

    let selectedPages: number[] = []
    if (options.selectedPages && options.selectedPages.length > 0) {
      selectedPages = options.selectedPages
        .map((pageKey: string) => {
          const parts = pageKey.split("-")
          return Number.parseInt(parts[parts.length - 1])
        })
        .filter((num: number) => !isNaN(num))
        .sort((a: number, b: number) => a - b)
    }

    if (selectedPages.length === 0) {
      return {
        success: false,
        error: "No pages selected for extraction"
      }
    }

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
    <UnifiedToolLayout
      title="Split PDF"
      description="Split large PDF files into smaller documents by extracting specific pages, page ranges, or equal parts."
      icon={Scissors}
      toolType="pdf"
      processFunction={splitPDF}
      options={splitOptions}
      maxFiles={1}
      allowPageSelection={true}
      supportedFormats={["application/pdf"]}
      richContent={richContent}
    />
  )
}