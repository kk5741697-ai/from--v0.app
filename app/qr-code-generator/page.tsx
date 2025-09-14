"use client"

import { QRCodeToolsLayout } from "@/components/tools-layouts/qrcode-tools-layout"
import { QrCode } from "lucide-react"
import { QRProcessor } from "@/lib/qr-processor"
import { QRCodeGuide } from "@/components/content/qr-code-guide"

const qrOptions = [
  {
    key: "qrType",
    label: "QR Code Type",
    type: "select" as const,
    defaultValue: "url",
    selectOptions: [
      { value: "url", label: "Website URL" },
      { value: "text", label: "Plain Text" },
      { value: "email", label: "Email" },
      { value: "phone", label: "Phone" },
      { value: "wifi", label: "WiFi" },
      { value: "vcard", label: "Contact Card" },
    ],
    section: "Content",
  },
  {
    key: "size",
    label: "Size (px)",
    type: "slider" as const,
    defaultValue: 1000,
    min: 200,
    max: 2000,
    step: 50,
    section: "Appearance",
  },
  {
    key: "margin",
    label: "Margin",
    type: "slider" as const,
    defaultValue: 4,
    min: 0,
    max: 10,
    step: 1,
    section: "Appearance",
  },
  {
    key: "darkColor",
    label: "Dark Color",
    type: "color" as const,
    defaultValue: "#000000",
    section: "Colors",
  },
  {
    key: "lightColor",
    label: "Light Color",
    type: "color" as const,
    defaultValue: "#ffffff",
    section: "Colors",
  },
  {
    key: "errorCorrection",
    label: "Error Correction",
    type: "select" as const,
    defaultValue: "M",
    selectOptions: [
      { value: "L", label: "Low (~7%)" },
      { value: "M", label: "Medium (~15%)" },
      { value: "Q", label: "Quartile (~25%)" },
      { value: "H", label: "High (~30%)" },
    ],
    section: "Advanced",
  },
]

async function generateQRCode(files: any[], options: any) {
  try {
    if (!options.content || options.content.trim() === "") {
      return {
        success: false,
        error: "Please enter content for the QR code",
      }
    }

    const qrDataURL = await QRProcessor.generateQRCode(options.content, {
      width: options.size,
      margin: options.margin,
      height: options.size,
      color: {
        dark: options.darkColor,
        light: options.lightColor,
      },
      errorCorrectionLevel: options.errorCorrection,
    })

    return {
      success: true,
      qrDataURL
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate QR code",
    }
  }
}

export default function QRCodeGeneratorPage() {
  const richContent = (
    <QRCodeGuide 
      toolName="QR Code Generator"
      toolType="generator"
      className="py-8"
    />
  )

  return (
    <QRCodeToolsLayout
      title="QR Code Generator"
      description="Create professional QR codes for websites, WiFi, contacts, payments, and more. Advanced customization with colors, logos, error correction levels, and multiple output formats for business and personal use."
      icon={QrCode}
      toolType="generator"
      processFunction={generateQRCode}
      options={qrOptions}
      maxFiles={0}
      richContent={richContent}
      allowBatchProcessing={false}
      supportedFormats={[]}
      outputFormats={["png", "svg", "pdf"]}
    />
  )
}