"use client"

import { UnifiedToolLayout } from "@/components/unified-tool-layout"
import { Archive } from "lucide-react"
import { ClientPDFProcessor } from "@/lib/processors/client-pdf-processor"
import { PDFProcessingGuide } from "@/components/content/pdf-processing-guide"

const compressOptions = [
  {
    key: "compressionLevel",
    label: "Compression Level",
    type: "select" as const,
    defaultValue: "medium",
    selectOptions: [
      { value: "low", label: "Low Compression (High Quality)" },
      { value: "medium", label: "Medium Compression (Balanced)" },
      { value: "high", label: "High Compression (Small Size)" },
      { value: "extreme", label: "Extreme Compression (Smallest)" },
    ],
    section: "Compression",
  },
  {
    key: "optimizeImages",
    label: "Optimize Images",
    type: "checkbox" as const,
    defaultValue: true,
    section: "Options",
  },
  {
    key: "removeMetadata",
    label: "Remove Metadata",
    type: "checkbox" as const,
    defaultValue: false,
    section: "Options",
  },
]

async function compressPDF(files: any[], options: any) {
  try {
    if (files.length === 0) {
      return {
        success: false,
        error: "Please select at least one PDF file to compress",
      }
    }

    const compressionOptions: any = {
      compressionLevel: options.compressionLevel,
      optimizeImages: Boolean(options.optimizeImages),
      removeMetadata: Boolean(options.removeMetadata),
      preserveMetadata: !Boolean(options.removeMetadata)
    }

    if (files.length === 1) {
      const compressedBlob = await ClientPDFProcessor.compressPDF(files[0].originalFile || files[0].file, compressionOptions)
      const downloadUrl = URL.createObjectURL(compressedBlob)

      return {
        success: true,
        downloadUrl,
        filename: `compressed_${files[0].name}`
      }
    } else {
      const JSZip = (await import("jszip")).default
      const zip = new JSZip()

      for (const file of files) {
        const compressedBlob = await ClientPDFProcessor.compressPDF(file.originalFile || file.file, compressionOptions)
        const compressedBytes = await compressedBlob.arrayBuffer()
        const filename = `compressed_${file.name}`
        zip.file(filename, compressedBytes)
      }

      const zipBlob = await zip.generateAsync({ type: "blob" })
      const downloadUrl = URL.createObjectURL(zipBlob)

      return {
        success: true,
        downloadUrl,
        filename: "compressed_pdfs.zip"
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to compress PDF",
    }
  }
}

export default function PDFCompressorPage() {
  const richContent = (
    <PDFProcessingGuide 
      toolName="PDF Compressor"
      toolType="compress"
      className="py-8"
    />
  )

  return (
    <UnifiedToolLayout
      title="PDF Compressor"
      description="Reduce PDF file size while maintaining quality. Optimize images, compress fonts, and remove unnecessary metadata."
      icon={Archive}
      toolType="pdf"
      processFunction={compressPDF}
      options={compressOptions}
      maxFiles={5}
      supportedFormats={["application/pdf"]}
      richContent={richContent}
    />
  )
}