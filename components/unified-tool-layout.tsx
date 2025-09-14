"use client"

import { 
  ImageToolsLayout,
  PDFToolsLayout,
  QRCodeToolsLayout,
  TextToolsLayout,
  NetworkToolsLayout,
  SEOToolsLayout,
  UtilitiesToolsLayout
} from "@/components/tools-layouts"

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
      return (
        <ImageToolsLayout 
          {...commonProps}
          toolType={toolType}
        />
      )
    case "pdf":
      return (
        <PDFToolsLayout 
          {...commonProps}
          toolType={toolType}
        />
      )
    case "qr":
      return (
        <QRCodeToolsLayout 
          {...commonProps}
          toolType={toolType}
        />
      )
    case "text":
      return (
        <TextToolsLayout 
          {...commonProps}
          toolType={toolType}
        />
      )
    case "network":
      return (
        <NetworkToolsLayout 
          {...commonProps}
          toolType={toolType}
        />
      )
    case "seo":
      return (
        <SEOToolsLayout 
          {...commonProps}
          toolType={toolType}
        />
      )
    case "utilities":
      return (
        <UtilitiesToolsLayout 
          {...commonProps}
          toolType={toolType}
        />
      )
    default:
      return (
        <ImageToolsLayout 
          {...commonProps}
          toolType="image"
        />
      )
  }
}