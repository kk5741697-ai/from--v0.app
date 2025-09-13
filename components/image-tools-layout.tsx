"use client"

import { UnifiedToolLayout } from "@/components/unified-tool-layout"

interface ImageToolsLayoutProps {
  title: string
  description: string
  icon: any
  toolType: string
  processFunction: (files: any[], options: any) => Promise<{ success: boolean; processedFiles?: any[]; error?: string }>
  options?: any[]
  maxFiles?: number
  allowBatchProcessing?: boolean
  supportedFormats?: string[]
  outputFormats?: string[]
  richContent?: React.ReactNode
}

export function ImageToolsLayout(props: ImageToolsLayoutProps) {
  return (
    <UnifiedToolLayout
      {...props}
      toolType="image"
    />
  )
}