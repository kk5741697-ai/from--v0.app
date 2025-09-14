"use client"

import { ImageToolsLayout } from "@/components/tools-layouts/image-tools-layout"
import { PDFToolsLayout } from "@/components/tools-layouts/pdf-tools-layout"
import { QRCodeToolsLayout } from "@/components/tools-layouts/qrcode-tools-layout"
import { TextToolsLayout } from "@/components/tools-layouts/text-tools-layout"
import { NetworkToolsLayout } from "@/components/tools-layouts/network-tools-layout"
import { SEOToolsLayout } from "@/components/tools-layouts/seo-tools-layout"
import { UtilitiesToolsLayout } from "@/components/tools-layouts/utilities-tools-layout"

interface UnifiedToolLayoutProps {
  title: string
  description: string
  icon: any
  toolType: "image" | "pdf" | "qr" | "text" | "network" | "seo" | "utilities"
  processFunction: (files: any[], options: any) => Promise<any>
  options?: any[]
  maxFiles?: number
  allowBatchProcessing?: boolean
  allowPageSelection?: boolean
  allowPageReorder?: boolean
  supportedFormats?: string[]
  outputFormats?: string[]
  richContent?: React.ReactNode
  children?: React.ReactNode
}

export function UnifiedToolLayout({
  title,
  description,
  icon,
  toolType,
  processFunction,
  options = [],
  maxFiles = 10,
  allowBatchProcessing = true,
  allowPageSelection = false,
  allowPageReorder = false,
  supportedFormats = [],
  outputFormats = [],
  richContent,
  children
}: UnifiedToolLayoutProps) {
  const commonProps = {
    title,
    description,
    icon,
    toolType,
    processFunction,
    options,
    maxFiles,
    allowBatchProcessing,
    allowPageSelection,
    allowPageReorder,
    supportedFormats,
    outputFormats,
    richContent,
    children
  }

  switch (toolType) {
    case "image":
      return <ImageToolsLayout {...commonProps} />
    case "pdf":
      return <PDFToolsLayout {...commonProps} />
    case "qr":
      return <QRCodeToolsLayout {...commonProps} />
    case "text":
      return <TextToolsLayout {...commonProps} />
    case "network":
      return <NetworkToolsLayout {...commonProps} />
    case "seo":
      return <SEOToolsLayout {...commonProps} />
    case "utilities":
      return <UtilitiesToolsLayout {...commonProps} />
    default:
      return <ImageToolsLayout {...commonProps} />
  }
}