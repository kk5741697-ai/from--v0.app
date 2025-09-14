"use client"

import { PDFToolsLayout } from "@/components/tools-layouts/pdf-tools-layout"
import { FileType } from "lucide-react"
import { ClientPDFProcessor } from "@/lib/processors/client-pdf-processor"
import { PDFProcessingGuide } from "@/components/content/pdf-processing-guide"

const mergeOptions = [
  {
    key: "addBookmarks",
    label: "Add Bookmarks",
    type: "checkbox" as const,
    defaultValue: true,
    section: "Options",
  },
  {
    key: "preserveMetadata",
    label: "Preserve Metadata",
    type: "checkbox" as const,
    defaultValue: true,
    section: "Options",
  },
  {
    key: "mergeMode",
    label: "Merge Mode",
    type: "select" as const,
    defaultValue: "sequential",
    selectOptions: [
      { value: "sequential", label: "Sequential Order" },
      { value: "interleave", label: "Interleave Pages" },
      { value: "custom", label: "Custom Order" },
    ],
    section: "Merge Settings",
  },
]

async function mergePDFs(files: any[], options: any): Promise<{ success: boolean; downloadUrl?: string; filename?: string; error?: string }> {
  try {
    if (files.length < 2) {
      return {
        success: false,
        error: "At least 2 PDF files are required for merging",
      }
    }

    const fileObjects = files.map((f: any) => f.originalFile || f.file)
    const mergedBlob = await ClientPDFProcessor.mergePDFs(fileObjects, {
      addBookmarks: options.addBookmarks,
      preserveMetadata: options.preserveMetadata
    })

    const downloadUrl = URL.createObjectURL(mergedBlob)

    return {
      success: true,
      downloadUrl,
      filename: "merged_document.pdf"
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to merge PDFs",
    }
  }
}

export default function PDFMergerPage() {
  const richContent = (
    <PDFProcessingGuide 
      toolName="PDF Merger"
      toolType="merge"
      className="py-8"
    />
  )

  return (
    <PDFToolsLayout
      title="Merge PDF"
      description="Combine multiple PDF files into one document with custom page ordering, bookmark preservation, and advanced merging options. Drag-and-drop interface for easy file organization."
      icon={FileType}
      toolType="merge"
      processFunction={mergePDFs}
      options={mergeOptions}
      maxFiles={10}
      allowPageReorder={true}
      supportedFormats={["application/pdf"]}
      richContent={richContent}
    />
  )
}