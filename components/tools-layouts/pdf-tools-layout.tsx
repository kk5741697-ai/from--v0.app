"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Upload, X, Settings2, ChevronDown } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { EnhancedAdSense } from "@/components/ads/enhanced-adsense-manager"
import { PDFThumbnailExtractor } from "@/components/pdf-thumbnail-extractor"

interface PDFFile {
  id: string
  file: File
  originalFile?: File
  name: string
  size: number
  pages?: any[]
}

interface PDFToolsLayoutProps {
  title: string
  description: string
  icon: any
  toolType: string
  processFunction: (files: any[], options: any) => Promise<{ success: boolean; downloadUrl?: string; filename?: string; processedFiles?: any[]; error?: string }>
  options?: any[]
  maxFiles?: number
  allowPageSelection?: boolean
  supportedFormats?: string[]
}

export function PDFToolsLayout({
  title,
  description,
  icon: Icon,
  processFunction,
  options = [],
  maxFiles = 5,
  allowPageSelection = false,
  supportedFormats = ["application/pdf"],
}: PDFToolsLayoutProps) {
  const [files, setFiles] = useState<PDFFile[]>([])
  const [toolOptions, setToolOptions] = useState<Record<string, any>>({})
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [isMobileOptionsOpen, setIsMobileOptionsOpen] = useState(false)
  const [selectedPages, setSelectedPages] = useState<Set<string>>(new Set())
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const defaultOptions: Record<string, any> = {}
    options.forEach(option => {
      defaultOptions[option.key] = option.defaultValue
    })
    setToolOptions(defaultOptions)
  }, [options])

  const handleFileUpload = async (uploadedFiles: FileList | null) => {
    if (!uploadedFiles || uploadedFiles.length === 0) return

    const newFiles: PDFFile[] = []

    for (const file of Array.from(uploadedFiles)) {
      if (!supportedFormats.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not supported`,
          variant: "destructive"
        })
        continue
      }

      if (files.length + newFiles.length >= maxFiles) {
        toast({
          title: "Too many files",
          description: `Maximum ${maxFiles} files allowed`,
          variant: "destructive"
        })
        break
      }

      newFiles.push({
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        file,
        originalFile: file,
        name: file.name,
        size: file.size,
      })
    }

    if (newFiles.length > 0) {
      setFiles(prev => [...prev, ...newFiles])
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    handleFileUpload(e.dataTransfer.files)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const resetTool = () => {
    setFiles([])
    setProcessingProgress(0)
    setSelectedPages(new Set())
  }

  const processFiles = async () => {
    if (files.length === 0) return

    setIsProcessing(true)
    setProcessingProgress(0)

    try {
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const result = await processFunction(files, {
        ...toolOptions,
        selectedPages: allowPageSelection ? Array.from(selectedPages) : undefined
      })

      clearInterval(progressInterval)
      setProcessingProgress(100)

      if (result.success) {
        if (result.downloadUrl && result.filename) {
          const link = document.createElement("a")
          link.href = result.downloadUrl
          link.download = result.filename
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)

          toast({
            title: "Success",
            description: "Your file has been processed"
          })
        }
      } else {
        toast({
          title: "Error",
          description: result.error || "Processing failed",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
      setProcessingProgress(0)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
  }

  const renderOptionControl = (option: any) => {
    const shouldShow = !option.condition || option.condition(toolOptions)
    if (!shouldShow) return null

    switch (option.type) {
      case "select":
        return (
          <Select
            value={toolOptions[option.key]?.toString()}
            onValueChange={(value) => setToolOptions(prev => ({ ...prev, [option.key]: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {option.selectOptions?.map((opt: any) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={option.key}
              checked={toolOptions[option.key] || false}
              onCheckedChange={(checked) => setToolOptions(prev => ({ ...prev, [option.key]: checked }))}
            />
            <label htmlFor={option.key} className="text-sm cursor-pointer">
              {option.label}
            </label>
          </div>
        )

      case "slider":
        return (
          <div className="space-y-2">
            <Slider
              value={[toolOptions[option.key] || option.defaultValue]}
              onValueChange={([value]) => setToolOptions(prev => ({ ...prev, [option.key]: value }))}
              min={option.min}
              max={option.max}
              step={option.step}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{option.min}</span>
              <span className="font-medium">{toolOptions[option.key] || option.defaultValue}</span>
              <span>{option.max}</span>
            </div>
          </div>
        )

      case "input":
        return (
          <Input
            type="number"
            value={toolOptions[option.key] || option.defaultValue}
            onChange={(e) => setToolOptions(prev => ({ ...prev, [option.key]: parseInt(e.target.value) }))}
            min={option.min}
            max={option.max}
          />
        )

      default:
        return null
    }
  }

  const groupedOptions = options.reduce((groups, option) => {
    const section = option.section || "General"
    if (!groups[section]) groups[section] = []
    groups[section].push(option)
    return groups
  }, {} as Record<string, any[]>)

  const handlePageSelection = (pageKey: string) => {
    setSelectedPages(prev => {
      const newSet = new Set(prev)
      if (newSet.has(pageKey)) {
        newSet.delete(pageKey)
      } else {
        newSet.add(pageKey)
      }
      return newSet
    })
  }

  // Upload View
  if (files.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <Header />

        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-2xl mb-4">
              <Icon className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
            <p className="text-gray-600">{description}</p>
          </div>

          {/* Ad - Before Upload */}
          <div className="mb-8">
            <EnhancedAdSense
              adSlot="unified-before-canvas"
              adFormat="horizontal"
              persistent={true}
            />
          </div>

          {/* Upload Area */}
          <Card
            className="border-2 border-dashed hover:border-red-400 transition-colors cursor-pointer p-12 text-center"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Select PDF files</h3>
            <p className="text-gray-600 mb-4">or drop PDFs here</p>
            <Button className="bg-red-600 hover:bg-red-700">
              Select PDF files
            </Button>
          </Card>

          {/* Ad - After Upload */}
          <div className="mt-8">
            <EnhancedAdSense
              adSlot="unified-after-canvas"
              adFormat="horizontal"
              persistent={true}
            />
          </div>
        </div>

        <Footer />

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          multiple={maxFiles > 1}
          onChange={(e) => handleFileUpload(e.target.files)}
          className="hidden"
        />
      </div>
    )
  }

  // Tool Interface
  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header />

      <div className="container mx-auto px-4 py-4">
        {/* Tools Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Icon className="h-5 w-5 text-red-600" />
            <h1 className="text-xl font-bold text-gray-900">{title}</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={resetTool}>
              New files
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMobileOptionsOpen(true)}
              className="lg:hidden"
            >
              <Settings2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Layout: Canvas + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Canvas Area */}
          <div className="lg:col-span-3 space-y-4">
            {/* Ad - Before Canvas */}
            <EnhancedAdSense
              adSlot="unified-before-canvas"
              adFormat="horizontal"
              persistent={true}
            />

            {/* Files List */}
            <div className="space-y-4">
              {files.map((file) => (
                <Card key={file.id} className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-medium">{file.name}</h3>
                      <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeFile(file.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {allowPageSelection && (
                    <PDFThumbnailExtractor
                      file={file.file}
                      onPagesExtracted={(pages) => {
                        if (pages && pages.length > 0) {
                          setFiles(prev => prev.map(f =>
                            f.id === file.id ? { ...f, pages } : f
                          ))
                        }
                      }}
                      allowSelection={allowPageSelection}
                      selectedPages={selectedPages}
                      onPageSelectionChange={handlePageSelection}
                    />
                  )}
                </Card>
              ))}
            </div>

            {/* Ad - After Canvas */}
            <EnhancedAdSense
              adSlot="unified-after-canvas"
              adFormat="horizontal"
              persistent={true}
            />
          </div>

          {/* Desktop Sidebar */}
          <div className="hidden lg:block">
            <Card className="p-4 sticky top-20">
              <h3 className="font-semibold mb-4">Options</h3>

              <div className="space-y-4">
                {Object.entries(groupedOptions).map(([section, sectionOptions]) => (
                  <div key={section} className="space-y-3">
                    <Label className="text-xs font-medium text-gray-500 uppercase">{section}</Label>
                    {sectionOptions.map((option) => (
                      <div key={option.key} className="space-y-2">
                        {option.type !== "checkbox" && <Label className="text-sm">{option.label}</Label>}
                        {renderOptionControl(option)}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <Button
                onClick={processFiles}
                disabled={isProcessing || files.length === 0 || (allowPageSelection && selectedPages.size === 0)}
                className="w-full mt-6 bg-red-600 hover:bg-red-700"
              >
                {isProcessing ? "Processing..." : `Process ${files.length} file${files.length > 1 ? 's' : ''}`}
              </Button>

              {isProcessing && (
                <div className="mt-4">
                  <Progress value={processingProgress} />
                  <p className="text-xs text-center text-gray-500 mt-2">{processingProgress}%</p>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Mobile Process Button */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg">
          <Button
            onClick={processFiles}
            disabled={isProcessing || files.length === 0}
            className="w-full bg-red-600 hover:bg-red-700"
            size="lg"
          >
            {isProcessing ? `Processing ${processingProgress}%` : `Process ${files.length} file${files.length > 1 ? 's' : ''}`}
          </Button>
        </div>
      </div>

      {/* Mobile Options Sheet */}
      <Sheet open={isMobileOptionsOpen} onOpenChange={setIsMobileOptionsOpen}>
        <SheetContent side="bottom" className="h-[80vh]">
          <SheetHeader>
            <SheetTitle>Options</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-4">
            {Object.entries(groupedOptions).map(([section, sectionOptions]) => (
              <div key={section} className="space-y-3">
                <Label className="text-xs font-medium text-gray-500 uppercase">{section}</Label>
                {sectionOptions.map((option) => (
                  <div key={option.key} className="space-y-2">
                    {option.type !== "checkbox" && <Label className="text-sm">{option.label}</Label>}
                    {renderOptionControl(option)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        multiple={maxFiles > 1}
        onChange={(e) => handleFileUpload(e.target.files)}
        className="hidden"
      />
    </div>
  )
}
