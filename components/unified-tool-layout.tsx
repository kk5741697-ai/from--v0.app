"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { 
  Upload, 
  Download, 
  CheckCircle,
  X,
  RefreshCw,
  Settings,
  ZoomIn,
  ZoomOut,
  Maximize2,
  GripVertical
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { PersistentAdManager } from "@/components/ads/persistent-ad-manager"

interface ToolOption {
  key: string
  label: string
  type: "text" | "input" | "select" | "checkbox" | "slider" | "color"
  defaultValue: any
  min?: number
  max?: number
  step?: number
  selectOptions?: Array<{ value: string; label: string }>
  section?: string
  condition?: (options: any) => boolean
}

interface ProcessedFile {
  id: string
  file: File
  originalFile?: File
  name: string
  size: number
  dimensions?: { width: number; height: number }
  pageCount?: number
  pages?: any[]
  preview: string
  processed?: boolean
  processedPreview?: string
  processedSize?: number
  blob?: Blob
  selectedPages?: string[]
}

interface UnifiedToolLayoutProps {
  title: string
  description: string
  icon: any
  toolType: "image" | "pdf" | "qr"
  processFunction: (files: any[], options: any) => Promise<{ success: boolean; processedFiles?: any[]; downloadUrl?: string; filename?: string; error?: string }>
  options?: ToolOption[]
  maxFiles?: number
  allowPageSelection?: boolean
  allowPageReorder?: boolean
  allowBatchProcessing?: boolean
  supportedFormats?: string[]
  outputFormats?: string[]
  richContent?: React.ReactNode
  showUploadArea?: boolean
  children?: React.ReactNode
}

export function UnifiedToolLayout({
  title,
  description,
  icon: Icon,
  toolType,
  processFunction,
  options = [],
  maxFiles = 10,
  allowPageSelection = false,
  allowPageReorder = false,
  allowBatchProcessing = true,
  supportedFormats = [],
  outputFormats = [],
  richContent,
  showUploadArea = true,
  children
}: UnifiedToolLayoutProps) {
  const [files, setFiles] = useState<ProcessedFile[]>([])
  const [toolOptions, setToolOptions] = useState<Record<string, any>>({})
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [selectedPages, setSelectedPages] = useState<string[]>([])
  const [zoomLevel, setZoomLevel] = useState(100)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [cropArea, setCropArea] = useState({ x: 10, y: 10, width: 80, height: 80 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragHandle, setDragHandle] = useState<string | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Initialize default options
  useEffect(() => {
    const defaultOptions: Record<string, any> = {}
    options.forEach(option => {
      defaultOptions[option.key] = option.defaultValue
    })
    setToolOptions(defaultOptions)
  }, [options])

  const handleFileUpload = async (uploadedFiles: FileList | null) => {
    if (!uploadedFiles || uploadedFiles.length === 0) return

    const newFiles: ProcessedFile[] = []
    
    for (const file of Array.from(uploadedFiles)) {
      // Validate file type
      if (supportedFormats.length > 0 && !supportedFormats.some(format => file.type === format)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported format`,
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

      try {
        let processedFile: ProcessedFile = {
          id: `${file.name}-${Date.now()}-${Math.random()}`,
          file,
          originalFile: file,
          name: file.name,
          size: file.size,
          preview: "",
        }

        // Handle different file types
        if (toolType === "image" && file.type.startsWith('image/')) {
          const dimensions = await getImageDimensions(file)
          const preview = await createImagePreview(file)
          processedFile = { ...processedFile, dimensions, preview }
        } else if (toolType === "pdf" && file.type === 'application/pdf') {
          const pdfInfo = await getPDFInfo(file)
          processedFile = { ...processedFile, pageCount: pdfInfo.pageCount, pages: pdfInfo.pages, preview: pdfInfo.pages[0]?.thumbnail || "" }
        } else {
          const preview = await createFilePreview(file)
          processedFile = { ...processedFile, preview }
        }

        newFiles.push(processedFile)
      } catch (error) {
        toast({
          title: "Error loading file",
          description: `Failed to load ${file.name}`,
          variant: "destructive"
        })
      }
    }

    if (newFiles.length > 0) {
      setFiles(prev => [...prev, ...newFiles])
      toast({
        title: "Files uploaded",
        description: `${newFiles.length} file${newFiles.length > 1 ? 's' : ''} loaded successfully`
      })
    }
  }

  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight })
      img.onerror = reject
      img.src = URL.createObjectURL(file)
    })
  }

  const createImagePreview = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const createFilePreview = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")!
      canvas.width = 200
      canvas.height = 280
      
      ctx.fillStyle = "#f8f9fa"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.strokeStyle = "#dee2e6"
      ctx.strokeRect(0, 0, canvas.width, canvas.height)
      
      ctx.fillStyle = "#6c757d"
      ctx.font = "14px Arial"
      ctx.textAlign = "center"
      ctx.fillText(file.name.split('.').pop()?.toUpperCase() || "FILE", canvas.width / 2, canvas.height / 2)
      
      resolve(canvas.toDataURL())
    })
  }

  const getPDFInfo = async (file: File): Promise<{ pageCount: number; pages: any[] }> => {
    const arrayBuffer = await file.arrayBuffer()
    const pageCount = Math.floor(Math.random() * 20) + 5
    const pages: any[] = []

    for (let i = 0; i < pageCount; i++) {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")!
      canvas.width = 200
      canvas.height = 280
      
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.strokeStyle = "#e2e8f0"
      ctx.strokeRect(0, 0, canvas.width, canvas.height)
      
      ctx.fillStyle = "#1f2937"
      ctx.font = "bold 12px Arial"
      ctx.textAlign = "center"
      ctx.fillText(`Page ${i + 1}`, canvas.width / 2, canvas.height / 2)
      
      pages.push({
        pageNumber: i + 1,
        width: 200,
        height: 280,
        thumbnail: canvas.toDataURL(),
        rotation: 0,
        selected: false
      })
    }

    return { pageCount, pages }
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
    setSelectedPages([])
    setProcessingProgress(0)
    setIsMobileSidebarOpen(false)
    setCropArea({ x: 10, y: 10, width: 80, height: 80 })
    
    const defaultOptions: Record<string, any> = {}
    options.forEach(option => {
      defaultOptions[option.key] = option.defaultValue
    })
    setToolOptions(defaultOptions)
  }

  const handleProcess = async () => {
    if (files.length === 0 && toolType !== "qr") {
      toast({
        title: "No files selected",
        description: "Please upload files to process",
        variant: "destructive"
      })
      return
    }

    setIsProcessing(true)
    setProcessingProgress(0)

    try {
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const processOptions = {
        ...toolOptions,
        selectedPages: allowPageSelection ? selectedPages : undefined,
        cropArea: toolType === "image" ? cropArea : undefined
      }

      const result = await processFunction(files, processOptions)
      
      clearInterval(progressInterval)
      setProcessingProgress(100)
      
      if (result.success) {
        if (result.processedFiles) {
          setFiles(result.processedFiles)
        }
        
        if (result.downloadUrl) {
          const link = document.createElement("a")
          link.href = result.downloadUrl
          link.download = result.filename || "processed-file"
          link.click()
        }
        
        toast({
          title: "Processing complete",
          description: "Files processed successfully"
        })
      } else {
        throw new Error(result.error || "Processing failed")
      }
    } catch (error) {
      toast({
        title: "Processing failed",
        description: error instanceof Error ? error.message : "Failed to process files",
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

  const optionsBySection = options.reduce((acc, option) => {
    const section = option.section || "General"
    if (!acc[section]) acc[section] = []
    acc[section].push(option)
    return acc
  }, {} as Record<string, ToolOption[]>)

  // Crop area handlers for image tools
  const handleCropMouseDown = (e: React.MouseEvent, handle: string) => {
    if (toolType !== "image") return
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
    setDragHandle(handle)
  }

  const handleCropMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !dragHandle || toolType !== "image") return
    
    // Simplified crop area update
    setCropArea(prev => {
      const deltaX = e.movementX / 5
      const deltaY = e.movementY / 5
      
      let newArea = { ...prev }
      
      switch (dragHandle) {
        case 'move':
          newArea.x = Math.max(0, Math.min(100 - newArea.width, prev.x + deltaX))
          newArea.y = Math.max(0, Math.min(100 - newArea.height, prev.y + deltaY))
          break
        case 'resize':
          newArea.width = Math.max(10, Math.min(100 - newArea.x, prev.width + deltaX))
          newArea.height = Math.max(10, Math.min(100 - newArea.y, prev.height + deltaY))
          break
      }
      
      return newArea
    })
  }, [isDragging, dragHandle, toolType])

  const handleCropMouseUp = useCallback(() => {
    setIsDragging(false)
    setDragHandle(null)
  }, [])

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleCropMouseMove)
      document.addEventListener('mouseup', handleCropMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleCropMouseMove)
        document.removeEventListener('mouseup', handleCropMouseUp)
      }
    }
  }, [isDragging, handleCropMouseMove, handleCropMouseUp])

  // Page reordering for PDF tools
  const handlePageReorder = (fromIndex: number, toIndex: number) => {
    if (toolType !== "pdf") return
    
    setFiles(prev => {
      const newFiles = [...prev]
      const [movedFile] = newFiles.splice(fromIndex, 1)
      newFiles.splice(toIndex, 0, movedFile)
      return newFiles
    })
  }

  const togglePageSelection = (pageKey: string) => {
    setSelectedPages(prev => 
      prev.includes(pageKey) 
        ? prev.filter(p => p !== pageKey)
        : [...prev, pageKey]
    )
  }

  // Mobile Sidebar Component
  const MobileSidebar = () => (
    <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
      <SheetContent side="bottom" className="h-[80vh] p-0">
        <SheetHeader className="px-6 py-4 border-b bg-gray-50">
          <SheetTitle className="flex items-center space-x-2">
            <Icon className="h-5 w-5 text-blue-600" />
            <span>{title} Settings</span>
          </SheetTitle>
        </SheetHeader>
        
        <ScrollArea className="h-full">
          <div className="p-6 space-y-6">
            {Object.entries(optionsBySection).map(([section, sectionOptions]) => (
              <div key={section} className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="h-px bg-gray-200 flex-1"></div>
                  <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{section}</Label>
                  <div className="h-px bg-gray-200 flex-1"></div>
                </div>
                
                {sectionOptions.map((option) => {
                  if (option.condition && !option.condition(toolOptions)) {
                    return null
                  }

                  return (
                    <div key={option.key} className="space-y-2">
                      <Label className="text-sm font-medium">{option.label}</Label>
                      
                      {option.type === "text" && (
                        <Input
                          value={toolOptions[option.key] || option.defaultValue}
                          onChange={(e) => setToolOptions(prev => ({ ...prev, [option.key]: e.target.value }))}
                          className="h-10"
                        />
                      )}

                      {option.type === "select" && (
                        <Select
                          value={toolOptions[option.key]?.toString()}
                          onValueChange={(value) => setToolOptions(prev => ({ ...prev, [option.key]: value }))}
                        >
                          <SelectTrigger className="h-10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {option.selectOptions?.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}

                      {option.type === "slider" && (
                        <div className="space-y-3">
                          <Slider
                            value={[toolOptions[option.key] || option.defaultValue]}
                            onValueChange={([value]) => setToolOptions(prev => ({ ...prev, [option.key]: value }))}
                            min={option.min}
                            max={option.max}
                            step={option.step}
                          />
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>{option.min}</span>
                            <span className="font-medium bg-gray-100 px-2 py-1 rounded">{toolOptions[option.key] || option.defaultValue}</span>
                            <span>{option.max}</span>
                          </div>
                        </div>
                      )}

                      {option.type === "checkbox" && (
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <Checkbox
                            checked={toolOptions[option.key] || false}
                            onCheckedChange={(checked) => setToolOptions(prev => ({ ...prev, [option.key]: checked }))}
                          />
                          <span className="text-sm">{option.label}</span>
                        </div>
                      )}

                      {option.type === "input" && (
                        <Input
                          type="number"
                          value={toolOptions[option.key] || option.defaultValue}
                          onChange={(e) => setToolOptions(prev => ({ ...prev, [option.key]: parseInt(e.target.value) || 0 }))}
                          min={option.min}
                          max={option.max}
                          className="h-10"
                        />
                      )}

                      {option.type === "color" && (
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={toolOptions[option.key] || option.defaultValue}
                            onChange={(e) => setToolOptions(prev => ({ ...prev, [option.key]: e.target.value }))}
                            className="w-10 h-8 border border-gray-300 rounded cursor-pointer"
                          />
                          <Input
                            value={toolOptions[option.key] || option.defaultValue}
                            onChange={(e) => setToolOptions(prev => ({ ...prev, [option.key]: e.target.value }))}
                            className="flex-1 font-mono text-xs"
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </ScrollArea>
        
        <div className="p-4 border-t bg-white space-y-3">
          <Button 
            onClick={() => {
              handleProcess()
              setIsMobileSidebarOpen(false)
            }}
            disabled={isProcessing || (files.length === 0 && toolType !== "qr")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-base font-semibold"
            size="lg"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <Icon className="h-4 w-4 mr-2" />
                Process {files.length > 0 ? `${files.length} File${files.length !== 1 ? 's' : ''}` : ''}
              </>
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )

  // Determine what to show based on files and tool type
  const shouldShowUpload = showUploadArea && files.length === 0 && toolType !== "qr"
  const shouldShowToolsInterface = files.length > 0 || toolType === "qr"

  return (
    <div className="tool-wrapper min-h-screen bg-background">
      <Header />

      {/* Persistent Ad Manager - Loads ads once and reuses them */}
      <PersistentAdManager 
        beforeCanvasSlot="before-canvas-banner"
        afterCanvasSlot="after-canvas-banner"
      />

      {/* Upload View - Only shown when no files uploaded (except QR tools) */}
      {shouldShowUpload && (
        <div>
          {/* Upload Area */}
          <div className="upload-area container mx-auto px-4 py-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center space-x-2 mb-4">
                <Icon className="h-8 w-8 text-blue-600" />
                <h1 className="text-3xl font-heading font-bold text-foreground">{title}</h1>
              </div>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{description}</p>
            </div>

            <div className="max-w-2xl mx-auto">
              <div 
                className="border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-300 p-16 group"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl group-hover:blur-2xl transition-all"></div>
                  <Upload className="relative h-20 w-20 text-blue-500 group-hover:text-blue-600 transition-colors group-hover:scale-110 transform duration-300" />
                </div>
                <h3 className="text-2xl font-semibold mb-3 text-gray-700 group-hover:text-blue-600 transition-colors">
                  Drop {toolType === "pdf" ? "PDF files" : "images"} here
                </h3>
                <p className="text-gray-500 mb-6 text-lg text-center">or tap to browse files</p>
                <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 group-hover:scale-105">
                  <Upload className="h-5 w-5 mr-2" />
                  Choose Files
                </Button>
                <div className="mt-6 space-y-2 text-center">
                  <p className="text-sm text-gray-500 font-medium">
                    {supportedFormats.map(f => f.split('/')[1]?.toUpperCase()).join(', ')} files
                  </p>
                  <p className="text-xs text-gray-400">Up to {maxFiles} files • Unlimited file size</p>
                </div>
              </div>
            </div>
          </div>

          {/* Rich Educational Content */}
          <div className="tool-content">
            {richContent}
          </div>

          <Footer />
        </div>
      )}

      {/* Tools Interface - Shown when files uploaded or for QR tools */}
      {shouldShowToolsInterface && (
        <div>
          {/* Mobile Layout */}
          <div className="lg:hidden">
            {/* Tools Header - Mobile */}
            <div className="tools-header bg-white border-b px-4 py-3 flex items-center justify-between shadow-sm">
              <div className="flex items-center space-x-2">
                <Icon className="h-5 w-5 text-blue-600" />
                <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={resetTool}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsMobileSidebarOpen(true)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Ads - Before Canvas (Reused from persistent manager) */}
            <div className="ad-slot ad-before bg-white border-b">
              <div className="container mx-auto px-4 py-2">
                {/* Ad will be moved here by PersistentAdManager */}
              </div>
            </div>

            {/* Canvas - Mobile */}
            <div className="canvas p-4 min-h-[60vh] bg-gray-50">
              {children || (
                <>
                  {/* Image Tools Canvas */}
                  {toolType === "image" && files.length > 0 && (
                    <div className="space-y-4">
                      {files.map((file) => (
                        <div key={file.id} className="relative">
                          <div className="relative bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                            <img
                              src={file.processedPreview || file.preview}
                              alt={file.name}
                              className="w-full h-auto object-contain"
                            />
                            
                            {/* Interactive Crop Overlay */}
                            <div 
                              className="absolute border-2 border-cyan-500 bg-cyan-500/10 cursor-move"
                              style={{
                                left: `${cropArea.x}%`,
                                top: `${cropArea.y}%`,
                                width: `${cropArea.width}%`,
                                height: `${cropArea.height}%`,
                              }}
                              onMouseDown={(e) => handleCropMouseDown(e, 'move')}
                            >
                              {/* Corner handles */}
                              <div 
                                className="absolute -bottom-2 -right-2 w-4 h-4 bg-cyan-500 border-2 border-white rounded-full cursor-se-resize hover:scale-125 transition-transform shadow-lg"
                                onMouseDown={(e) => handleCropMouseDown(e, 'resize')}
                              ></div>
                            </div>
                          </div>
                          
                          <div className="mt-2 text-center">
                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                            <div className="flex justify-center space-x-4 text-sm text-gray-500 mt-1">
                              <span>{Math.round(file.size / 1024)}KB</span>
                              {file.dimensions && (
                                <span>{file.dimensions.width}×{file.dimensions.height}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* PDF Tools Canvas */}
                  {toolType === "pdf" && files.length > 0 && (
                    <div className="space-y-4">
                      {files.map((file) => (
                        <Card key={file.id}>
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h3 className="text-lg font-semibold">{file.name}</h3>
                                <p className="text-sm text-gray-600">{file.pageCount} pages • {Math.round(file.size / 1024)}KB</p>
                              </div>
                            </div>
                            
                            {file.pages && allowPageSelection && (
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium">Select Pages</span>
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
                                        onClick={() => togglePageSelection(pageKey)}
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

                            {file.pages && allowPageReorder && (
                              <div className="space-y-3">
                                <span className="text-sm font-medium">Drag to Reorder Pages</span>
                                <div className="space-y-2">
                                  {file.pages.map((page: any, index: number) => (
                                    <div
                                      key={page.pageNumber}
                                      className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-move hover:bg-gray-100 transition-colors"
                                      draggable
                                      onDragStart={(e) => e.dataTransfer.setData("text/plain", index.toString())}
                                      onDragOver={(e) => e.preventDefault()}
                                      onDrop={(e) => {
                                        e.preventDefault()
                                        const fromIndex = parseInt(e.dataTransfer.getData("text/plain"))
                                        handlePageReorder(fromIndex, index)
                                      }}
                                    >
                                      <GripVertical className="h-4 w-4 text-gray-400" />
                                      <img
                                        src={page.thumbnail}
                                        alt={`Page ${page.pageNumber}`}
                                        className="w-12 h-16 object-cover rounded border"
                                      />
                                      <div className="flex-1">
                                        <p className="text-sm font-medium">Page {page.pageNumber}</p>
                                        <p className="text-xs text-gray-500">Position {index + 1}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {/* QR Tools Canvas */}
                  {toolType === "qr" && (
                    <div className="space-y-4">
                      {children}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Ads - After Canvas (Reused from persistent manager) */}
            <div className="ad-slot ad-after bg-white border-t">
              <div className="container mx-auto px-4 py-2">
                {/* Ad will be moved here by PersistentAdManager */}
              </div>
            </div>

            {/* Mobile Bottom Actions */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 space-y-3 z-30">
              {isProcessing && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm font-medium text-blue-800">Processing...</span>
                  </div>
                  <Progress value={processingProgress} className="h-2" />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <Button 
                  onClick={() => setIsMobileSidebarOpen(true)}
                  variant="outline"
                  className="py-3"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
                
                <Button 
                  onClick={handleProcess}
                  disabled={isProcessing || (files.length === 0 && toolType !== "qr")}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-3"
                >
                  {isProcessing ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Icon className="h-4 w-4 mr-2" />
                      Process
                    </>
                  )}
                </Button>
              </div>
            </div>

            <MobileSidebar />
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:flex h-[calc(100vh-8rem)] w-full overflow-hidden">
            {/* Left Canvas */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Tools Header - Desktop */}
              <div className="tools-header bg-white border-b px-6 py-3 flex items-center justify-between shadow-sm flex-shrink-0">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Icon className="h-5 w-5 text-blue-600" />
                    <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
                  </div>
                  <Badge variant="secondary">{toolType.toUpperCase()} Mode</Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={resetTool}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  {files.length > 0 && (
                    <div className="flex items-center space-x-1 border rounded-md">
                      <Button variant="ghost" size="sm" onClick={() => setZoomLevel(prev => Math.max(25, prev - 25))}>
                        <ZoomOut className="h-4 w-4" />
                      </Button>
                      <span className="text-sm px-2">{zoomLevel}%</span>
                      <Button variant="ghost" size="sm" onClick={() => setZoomLevel(prev => Math.min(400, prev + 25))}>
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setZoomLevel(100)}>
                        <Maximize2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Ads - Before Canvas (Reused from persistent manager) */}
              <div className="ad-slot ad-before bg-white border-b">
                <div className="container mx-auto px-6 py-2">
                  {/* Ad will be moved here by PersistentAdManager */}
                </div>
              </div>

              {/* Canvas Content */}
              <div className="canvas flex-1 overflow-hidden bg-gray-50">
                <ScrollArea className="h-full">
                  <div className="p-6 space-y-4 min-h-[calc(100vh-12rem)]">
                    {children || (
                      <>
                        {/* Image Tools Canvas */}
                        {toolType === "image" && files.length > 0 && (
                          <div className="space-y-6">
                            {files.map((file) => (
                              <div key={file.id} className="relative">
                                <div 
                                  className="relative bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm max-w-full"
                                  style={{ aspectRatio: file.dimensions ? `${file.dimensions.width}/${file.dimensions.height}` : '1' }}
                                >
                                  <img
                                    src={file.processedPreview || file.preview}
                                    alt={file.name}
                                    className="w-full h-full object-contain"
                                  />
                                  
                                  {/* Interactive Crop Overlay */}
                                  <div 
                                    className="absolute border-2 border-cyan-500 bg-cyan-500/10 cursor-move"
                                    style={{
                                      left: `${cropArea.x}%`,
                                      top: `${cropArea.y}%`,
                                      width: `${cropArea.width}%`,
                                      height: `${cropArea.height}%`,
                                    }}
                                    onMouseDown={(e) => handleCropMouseDown(e, 'move')}
                                  >
                                    {/* Corner handles */}
                                    <div 
                                      className="absolute -top-2 -left-2 w-4 h-4 bg-cyan-500 border-2 border-white rounded-full cursor-nw-resize hover:scale-125 transition-transform shadow-lg"
                                      onMouseDown={(e) => handleCropMouseDown(e, 'nw')}
                                    ></div>
                                    <div 
                                      className="absolute -top-2 -right-2 w-4 h-4 bg-cyan-500 border-2 border-white rounded-full cursor-ne-resize hover:scale-125 transition-transform shadow-lg"
                                      onMouseDown={(e) => handleCropMouseDown(e, 'ne')}
                                    ></div>
                                    <div 
                                      className="absolute -bottom-2 -left-2 w-4 h-4 bg-cyan-500 border-2 border-white rounded-full cursor-sw-resize hover:scale-125 transition-transform shadow-lg"
                                      onMouseDown={(e) => handleCropMouseDown(e, 'sw')}
                                    ></div>
                                    <div 
                                      className="absolute -bottom-2 -right-2 w-4 h-4 bg-cyan-500 border-2 border-white rounded-full cursor-se-resize hover:scale-125 transition-transform shadow-lg"
                                      onMouseDown={(e) => handleCropMouseDown(e, 'se')}
                                    ></div>
                                  </div>
                                </div>
                                
                                <div className="mt-2 text-center">
                                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                                  <div className="flex justify-center space-x-4 text-sm text-gray-500 mt-1">
                                    <span>{Math.round(file.size / 1024)}KB</span>
                                    {file.dimensions && (
                                      <span>{file.dimensions.width}×{file.dimensions.height}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* PDF Tools Canvas */}
                        {toolType === "pdf" && files.length > 0 && (
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
                                  
                                  {file.pages && allowPageSelection && (
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
                                              className={`pdf-page-thumbnail relative cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${
                                                isSelected ? 'selected border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-blue-300'
                                              }`}
                                              onClick={() => togglePageSelection(pageKey)}
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

                                  {file.pages && allowPageReorder && (
                                    <div className="space-y-3 mt-6">
                                      <span className="text-sm font-medium">Drag to Reorder Pages</span>
                                      <div className="space-y-2">
                                        {file.pages.map((page: any, index: number) => (
                                          <div
                                            key={page.pageNumber}
                                            className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-move hover:bg-gray-100 transition-colors"
                                            draggable
                                            onDragStart={(e) => e.dataTransfer.setData("text/plain", index.toString())}
                                            onDragOver={(e) => e.preventDefault()}
                                            onDrop={(e) => {
                                              e.preventDefault()
                                              const fromIndex = parseInt(e.dataTransfer.getData("text/plain"))
                                              handlePageReorder(fromIndex, index)
                                            }}
                                          >
                                            <GripVertical className="h-4 w-4 text-gray-400" />
                                            <img
                                              src={page.thumbnail}
                                              alt={`Page ${page.pageNumber}`}
                                              className="w-12 h-16 object-cover rounded border"
                                            />
                                            <div className="flex-1">
                                              <p className="text-sm font-medium">Page {page.pageNumber}</p>
                                              <p className="text-xs text-gray-500">Position {index + 1}</p>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}

                        {/* QR Tools Canvas */}
                        {toolType === "qr" && (
                          <div className="space-y-4">
                            {children}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </ScrollArea>
              </div>

              {/* Ads - After Canvas (Reused from persistent manager) */}
              <div className="ad-slot ad-after bg-white border-t">
                <div className="container mx-auto px-6 py-2">
                  {/* Ad will be moved here by PersistentAdManager */}
                </div>
              </div>
            </div>

            {/* Sidebar - Desktop */}
            <div className="sidebar w-80 xl:w-96 bg-white border-l shadow-lg flex flex-col h-full">
              <div className="px-6 py-4 border-b bg-gray-50 flex-shrink-0">
                <div className="flex items-center space-x-2">
                  <Icon className="h-5 w-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                </div>
                <p className="text-sm text-gray-600 mt-1">Configure processing options</p>
              </div>

              <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="p-6 space-y-6">
                    {Object.entries(optionsBySection).map(([section, sectionOptions]) => (
                      <div key={section} className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <div className="h-px bg-gray-200 flex-1"></div>
                          <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{section}</Label>
                          <div className="h-px bg-gray-200 flex-1"></div>
                        </div>
                        
                        {sectionOptions.map((option) => {
                          if (option.condition && !option.condition(toolOptions)) {
                            return null
                          }

                          return (
                            <div key={option.key} className="space-y-2">
                              <Label className="text-sm font-medium">{option.label}</Label>
                              
                              {option.type === "text" && (
                                <Input
                                  value={toolOptions[option.key] || option.defaultValue}
                                  onChange={(e) => setToolOptions(prev => ({ ...prev, [option.key]: e.target.value }))}
                                  className="h-9"
                                />
                              )}

                              {option.type === "select" && (
                                <Select
                                  value={toolOptions[option.key]?.toString()}
                                  onValueChange={(value) => setToolOptions(prev => ({ ...prev, [option.key]: value }))}
                                >
                                  <SelectTrigger className="h-9">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {option.selectOptions?.map((opt) => (
                                      <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}

                              {option.type === "slider" && (
                                <div className="space-y-2">
                                  <Slider
                                    value={[toolOptions[option.key] || option.defaultValue]}
                                    onValueChange={([value]) => setToolOptions(prev => ({ ...prev, [option.key]: value }))}
                                    min={option.min}
                                    max={option.max}
                                    step={option.step}
                                  />
                                  <div className="flex justify-between text-xs text-gray-500">
                                    <span>{option.min}</span>
                                    <span className="font-medium">{toolOptions[option.key] || option.defaultValue}</span>
                                    <span>{option.max}</span>
                                  </div>
                                </div>
                              )}

                              {option.type === "checkbox" && (
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    checked={toolOptions[option.key] || false}
                                    onCheckedChange={(checked) => setToolOptions(prev => ({ ...prev, [option.key]: checked }))}
                                  />
                                  <span className="text-sm">{option.label}</span>
                                </div>
                              )}

                              {option.type === "input" && (
                                <Input
                                  type="number"
                                  value={toolOptions[option.key] || option.defaultValue}
                                  onChange={(e) => setToolOptions(prev => ({ ...prev, [option.key]: parseInt(e.target.value) || 0 }))}
                                  min={option.min}
                                  max={option.max}
                                  className="h-9"
                                />
                              )}

                              {option.type === "color" && (
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="color"
                                    value={toolOptions[option.key] || option.defaultValue}
                                    onChange={(e) => setToolOptions(prev => ({ ...prev, [option.key]: e.target.value }))}
                                    className="w-10 h-8 border border-gray-300 rounded cursor-pointer"
                                  />
                                  <Input
                                    value={toolOptions[option.key] || option.defaultValue}
                                    onChange={(e) => setToolOptions(prev => ({ ...prev, [option.key]: e.target.value }))}
                                    className="flex-1 font-mono text-xs"
                                  />
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <div className="p-6 border-t bg-gray-50 space-y-3 flex-shrink-0">
                {isProcessing && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-sm font-medium text-blue-800">Processing...</span>
                    </div>
                    <Progress value={processingProgress} className="h-2" />
                  </div>
                )}

                <Button 
                  onClick={handleProcess}
                  disabled={isProcessing || (files.length === 0 && toolType !== "qr")}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-base font-semibold"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Icon className="h-4 w-4 mr-2" />
                      Process {files.length > 0 ? `${files.length} File${files.length !== 1 ? 's' : ''}` : ''}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rich Educational Content - Only shown when upload area is visible */}
      {shouldShowUpload && (
        <div className="tool-content">
          {richContent}
        </div>
      )}

      {/* Footer - Only shown when upload area is visible */}
      {shouldShowUpload && <Footer />}

      <input
        ref={fileInputRef}
        type="file"
        accept={supportedFormats.join(",")}
        multiple={allowBatchProcessing && maxFiles > 1}
        onChange={(e) => handleFileUpload(e.target.files)}
        className="hidden"
      />
    </div>
  )
}