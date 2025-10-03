"use client"

import { UnifiedToolLayout } from "@/components/unified-tool-layout"
import { QrCode } from "lucide-react"
import { EnhancedQRProcessor } from "@/lib/enhanced-qr-processor"
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
    section: "Design",
  },
  {
    key: "margin",
    label: "Margin",
    type: "slider" as const,
    defaultValue: 4,
    min: 0,
    max: 10,
    step: 1,
    section: "Design",
  },
  {
    key: "dotStyle",
    label: "Dot Style",
    type: "select" as const,
    defaultValue: "square",
    selectOptions: [
      { value: "square", label: "Square (Classic)" },
      { value: "rounded", label: "Rounded" },
      { value: "dots", label: "Dots" },
      { value: "classy", label: "Classy" },
    ],
    section: "Design",
  },
  {
    key: "cornerSquareStyle",
    label: "Corner Square Style",
    type: "select" as const,
    defaultValue: "square",
    selectOptions: [
      { value: "square", label: "Square" },
      { value: "extra-rounded", label: "Extra Rounded" },
      { value: "dot", label: "Dot" },
    ],
    section: "Design",
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
    key: "gradientType",
    label: "Gradient",
    type: "select" as const,
    defaultValue: "none",
    selectOptions: [
      { value: "none", label: "None" },
      { value: "linear", label: "Linear" },
      { value: "radial", label: "Radial" },
    ],
    section: "Colors",
  },
  {
    key: "gradientStart",
    label: "Gradient Start Color",
    type: "color" as const,
    defaultValue: "#000000",
    section: "Colors",
    condition: (options: any) => options.gradientType && options.gradientType !== "none"
  },
  {
    key: "gradientEnd",
    label: "Gradient End Color",
    type: "color" as const,
    defaultValue: "#4a00e0",
    section: "Colors",
    condition: (options: any) => options.gradientType && options.gradientType !== "none"
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

    const qrDataURL = await EnhancedQRProcessor.generateQRCode(options.content, {
      width: options.size,
      margin: options.margin,
      height: options.size,
      color: {
        dark: options.darkColor,
        light: options.lightColor,
      },
      errorCorrectionLevel: options.errorCorrection,
      dotStyle: options.dotStyle || "square",
      cornerSquareStyle: options.cornerSquareStyle || "square",
      cornerDotStyle: options.cornerDotStyle || "square",
      gradientType: options.gradientType || "none",
      gradientStart: options.gradientStart,
      gradientEnd: options.gradientEnd,
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
  return (
    <UnifiedToolLayout
      title="QR Code Generator"
      description="Create professional QR codes for websites, WiFi, contacts, payments, and more. Advanced customization with colors, logos, error correction levels, and multiple output formats for business and personal use."
      icon={QrCode}
      toolType="qr"
      processFunction={generateQRCode}
      options={qrOptions}
      maxFiles={0}
      allowBatchProcessing={false}
      supportedFormats={[]}
      outputFormats={["png", "svg", "pdf"]}
      richContent={
        <QRCodeGuide 
          toolName="QR Code Generator"
          toolType="generator"
          className="py-8"
        />
      }
    />
  )
}