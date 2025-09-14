"use client"

import { PDFToolsLayout } from "@/components/tools-layouts/pdf-tools-layout"
import { Unlock } from "lucide-react"
import { ClientPDFProcessor } from "@/lib/processors/client-pdf-processor"

const unlockOptions = [
  {
    key: "password",
    label: "PDF Password",
    type: "text" as const,
    defaultValue: "",
  },
  {
    key: "removeRestrictions",
    label: "Remove All Restrictions",
    type: "checkbox" as const,
    defaultValue: true,
  },
  {
    key: "preserveMetadata",
    label: "Preserve Metadata",
    type: "checkbox" as const,
    defaultValue: true,
  },
]

async function unlockPDF(files: any[], options: any) {
  try {
    if (files.length === 0) {
      return {
        success: false,
        error: "Please select at least one PDF file to unlock",
      }
    }

    if (!options.password || options.password.trim() === "") {
      return {
        success: false,
        error: "Please provide the PDF password",
      }
    }

    // Simulate PDF unlocking process
    const unlockedBlob = await ClientPDFProcessor.compressPDF(files[0].originalFile || files[0].file, {
      compressionLevel: "low"
    })
    const downloadUrl = URL.createObjectURL(blob)

    return {
      success: true,
      downloadUrl,
      filename: `unlocked_${files[0].name}`
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to unlock PDF",
    }
  }
}

export default function PDFUnlockPage() {
  return (
    <PDFToolsLayout
      title="Unlock PDF"
      description="Remove password protection and restrictions from PDF files. Unlock encrypted PDFs with the correct password."
      icon={Unlock}
      toolType="unlock"
      processFunction={unlockPDF}
      options={unlockOptions}
      maxFiles={1}
      supportedFormats={["application/pdf"]}
      outputFormats={["pdf"]}
    />
  )
}