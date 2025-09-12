"use client"

import { useState } from "react"
import { UnifiedToolLayout } from "@/components/unified-tool-layout"
import { Scissors } from "lucide-react"
import { ClientPDFProcessor } from "@/lib/processors/client-pdf-processor"
import { PDFProcessingGuide } from "@/components/content/pdf-processing-guide"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"

const splitOptions = [
  {
    key: "splitMode",
    label: "Split Mode",
    type: "select" as const,
    defaultValue: "pages",
    selectOptions: [
      { value: "pages", label: "Extract Selected Pages" },
      { value: "range", label: "Page Ranges" },
      { value: "size", label: "Equal Parts" },
    ],
    section: "Split Settings",
  },
  {
    key: "equalParts",
    label: "Number of Parts",
    type: "input" as const,
    defaultValue: 2,
    min: 2,
    max: 20,
    section: "Split Settings",
    condition: (options) => options.splitMode === "size",
  },
  {
    key: "preserveMetadata",
    label: "Preserve Metadata",
    type: "checkbox" as const,
    defaultValue: true,
    section: "Options",
  },
]

async function splitPDF(files: any[], options: any) {
  try {
    if (files.length !== 1) {
      return {
        success: false,
        error: "Please select exactly one PDF file to split",
      }
    }

    const file = files[0]

    let selectedPages: number[] = []
    if (options.selectedPages && options.selectedPages.length > 0) {
      selectedPages = options.selectedPages
        .map((pageKey: string) => {
          const parts = pageKey.split("-")
          return Number.parseInt(parts[parts.length - 1])
        })
        .filter((num: number) => !isNaN(num))
        .sort((a: number, b: number) => a - b)
    }

    if (selectedPages.length === 0) {
      return {
        success: false,
        error: "No pages selected for extraction"
      }
    }

    const splitResults = await ClientPDFProcessor.splitPDF(file.originalFile || file.file, {
      selectedPages
    })

    if (splitResults.length === 1) {
      const downloadUrl = URL.createObjectURL(splitResults[0])
      return {
        success: true,
        downloadUrl,
        filename: `${file.name.replace(".pdf", "")}_split.pdf`
      }
    } else {
      const JSZip = (await import("jszip")).default
      const zip = new JSZip()

      splitResults.forEach((pdfBlob, index) => {
        const pageNum = selectedPages[index]
        const filename = `${file.name.replace(".pdf", "")}_page_${pageNum}.pdf`
        zip.file(filename, pdfBlob)
      })

      const zipBlob = await zip.generateAsync({ type: "blob" })
      const downloadUrl = URL.createObjectURL(zipBlob)

      return {
        success: true,
        downloadUrl,
        filename: `${file.name.replace(".pdf", "")}_split.zip`
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to split PDF",
    }
  }
}

function PDFPagesCanvas({ files, selectedPages, onPageToggle }: { 
  files: any[], 
  selectedPages: string[], 
  onPageToggle: (pageKey: string) => void 
}) {
  if (files.length === 0) return null

  return (
    <div className="space-y-6">
      {files.map((file) => (
        <Card key={file.id}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">{file.name}</h3>
                <p className="text-sm text-gray-600">{file.pageCount} pages • {Math.round(file.size / 1024)}KB</p>
              </div>
            </div>
            
            {file.pages && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Select Pages to Extract</span>
                  <span className="text-sm text-gray-500">
                    {selectedPages.length} page{selectedPages.length !== 1 ? 's' : ''} selected
                  </span>
                </div>
                
                <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 max-h-64 overflow-y-auto">
                  {file.pages.map((page: any) => {
                    const pageKey = `${file.id}-page-${page.pageNumber}`
                    const isSelected = selectedPages.includes(pageKey)
                    
                    return (
                      <div
                        key={pageKey}
                        className={`relative cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${
                          isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-blue-300'
                        }`}
                        onClick={() => onPageToggle(pageKey)}
                      >
                        <img
                          src={page.thumbnail}
                          alt={`Page ${page.pageNumber}`}
                          className="w-full aspect-[3/4] object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs text-center py-1">
                          {page.pageNumber}
                        </div>
                        {isSelected && (
                          <div className="absolute top-1 right-1">
                            <CheckCircle className="h-4 w-4 text-blue-600 bg-white rounded-full" />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function PDFSplitterPage() {
  const [selectedPages, setSelectedPages] = useState<string[]>([])

  const togglePageSelection = (pageKey: string) => {
    setSelectedPages(prev => 
      prev.includes(pageKey) 
        ? prev.filter(p => p !== pageKey)
        : [...prev, pageKey]
    )
  }

  const processWithSelectedPages = async (files: any[], options: any) => {
    return splitPDF(files, { ...options, selectedPages })
  }

  const richContent = (
    <PDFProcessingGuide 
      toolName="PDF Splitter"
      toolType="split"
      className="py-8"
    />
  )

  return (
    <UnifiedToolLayout
      title="Split PDF"
      description="Split large PDF files into smaller documents by extracting specific pages, page ranges, or equal parts."
      icon={Scissors}
      toolType="pdf"
      processFunction={processWithSelectedPages}
      options={splitOptions}
      maxFiles={1}
      allowPageSelection={true}
      supportedFormats={["application/pdf"]}
      richContent={richContent}
    >
      <PDFPagesCanvas 
        files={[]} 
        selectedPages={selectedPages} 
        onPageToggle={togglePageSelection} 
      />
    </UnifiedToolLayout>
  )
}