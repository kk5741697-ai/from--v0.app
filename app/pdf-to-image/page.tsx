"use client"

import { PDFToolsLayout } from "@/components/tools-layouts/pdf-tools-layout"
import { ImageIcon } from "lucide-react"
import { ClientPDFProcessor } from "@/lib/processors/client-pdf-processor"
import { PDFProcessingGuide } from "@/components/content/pdf-processing-guide"

const convertOptions = [
  {
    key: "outputFormat",
    label: "Output Format",
    type: "select" as const,
    defaultValue: "png",
    selectOptions: [
      { value: "jpeg", label: "JPEG" },
      { value: "png", label: "PNG" },
      { value: "webp", label: "WebP" },
    ],
    section: "Output",
  },
  {
    key: "resolution",
    label: "Resolution (DPI)",
    type: "select" as const,
    defaultValue: "150",
    selectOptions: [
      { value: "72", label: "72 DPI (Web)" },
      { value: "150", label: "150 DPI (Standard)" },
      { value: "300", label: "300 DPI (Print)" },
      { value: "600", label: "600 DPI (High Quality)" },
    ],
    section: "Quality",
  },
  {
    key: "colorMode",
    label: "Color Mode",
    type: "select" as const,
    defaultValue: "color",
    selectOptions: [
      { value: "color", label: "Full Color" },
      { value: "grayscale", label: "Grayscale" },
      { value: "monochrome", label: "Black & White" },
    ],
    section: "Quality",
  },
]

async function convertPDFToImage(files: any[], options: any) {
  try {
    if (files.length === 0) {
      return {
        success: false,
        error: "Please select at least one PDF file to convert",
      }
    }

    const conversionOptions: any = {
      outputFormat: options.outputFormat,
      dpi: Number.parseInt(options.resolution),
      colorMode: options.colorMode,
      quality: 90,
      selectedPages: options.selectedPages
    }

    if (files.length === 1) {
      const images = await ClientPDFProcessor.pdfToImages(files[0].originalFile || files[0].file, conversionOptions)
      
      if (images.length === 1) {
        const downloadUrl = URL.createObjectURL(images[0])
        return {
          success: true,
          downloadUrl,
          filename: `${files[0].name.replace(".pdf", "")}.${options.outputFormat}`
        }
      } else {
        const JSZip = (await import("jszip")).default
        const zip = new JSZip()

        images.forEach((imageBlob, pageIndex) => {
          const filename = `${files[0].name.replace(".pdf", "")}_page_${pageIndex + 1}.${options.outputFormat}`
          zip.file(filename, imageBlob)
        })

        const zipBlob = await zip.generateAsync({ type: "blob" })
        const downloadUrl = URL.createObjectURL(zipBlob)

        return {
          success: true,
          downloadUrl,
          filename: `${files[0].name.replace(".pdf", "")}_images.zip`
        }
      }
    }

    return {
      success: false,
      error: "Multiple file conversion not supported yet"
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to convert PDF to images",
    }
  }
}

export default function PDFToImagePage() {
  const richContent = (
    <PDFProcessingGuide 
      toolName="PDF to Image Converter"
      toolType="convert"
      className="py-8"
    />
  )

  return (
    <PDFToolsLayout
      title="PDF to Image Converter"
      description="Convert PDF pages to high-quality images in multiple formats including PNG, JPEG, and WebP. Advanced resolution controls, color mode options, and batch processing for professional results."
      icon={ImageIcon}
      toolType="convert"
      processFunction={convertPDFToImage}
      options={convertOptions}
      maxFiles={3}
      allowPageSelection={true}
      supportedFormats={["application/pdf"]}
      richContent={richContent}
    />
  )
}