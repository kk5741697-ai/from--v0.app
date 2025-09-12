"use client"

import { useState } from "react"
import { UnifiedToolLayout } from "@/components/unified-tool-layout"
import { FileType } from "lucide-react"
import { ClientPDFProcessor } from "@/lib/processors/client-pdf-processor"
import { PDFProcessingGuide } from "@/components/content/pdf-processing-guide"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, GripVertical } from "lucide-react"

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

async function mergePDFs(files: any[], options: any) {
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

function PDFMergerCanvas({ files, onReorder }: { 
  files: any[], 
  onReorder: (fromIndex: number, toIndex: number) => void 
}) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      onReorder(draggedIndex, dropIndex)
    }
    setDraggedIndex(null)
  }

  if (files.length === 0) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">PDF Files to Merge</h3>
        <span className="text-sm text-gray-500">{files.length} files</span>
      </div>
      
      <div className="space-y-3">
        {files.map((file, index) => (
          <Card 
            key={file.id}
            className={`cursor-move transition-all ${draggedIndex === index ? 'opacity-50 scale-95' : 'hover:shadow-md'}`}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <GripVertical className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {index + 1}
                  </span>
                </div>
                
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{file.name}</h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{Math.round(file.size / 1024)}KB</span>
                    {file.pageCount && <span>{file.pageCount} pages</span>}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onReorder(index, Math.max(0, index - 1))}
                    disabled={index === 0}
                  >
                    ↑
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onReorder(index, Math.min(files.length - 1, index + 1))}
                    disabled={index === files.length - 1}
                  >
                    ↓
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default function PDFMergerPage() {
  const [fileOrder, setFileOrder] = useState<string[]>([])

  const handleReorder = (fromIndex: number, toIndex: number) => {
    // This would be implemented to reorder files
    console.log(`Reorder from ${fromIndex} to ${toIndex}`)
  }

  const richContent = (
    <PDFProcessingGuide 
      toolName="PDF Merger"
      toolType="merge"
      className="py-8"
    />
  )

  return (
    <UnifiedToolLayout
      title="Merge PDF"
      description="Combine multiple PDF files into one document with custom page ordering and bookmark preservation."
      icon={FileType}
      toolType="pdf"
      processFunction={mergePDFs}
      options={mergeOptions}
      maxFiles={10}
      allowPageReorder={true}
      supportedFormats={["application/pdf"]}
      richContent={richContent}
    >
      <PDFMergerCanvas files={[]} onReorder={handleReorder} />
    </UnifiedToolLayout>
  )
}