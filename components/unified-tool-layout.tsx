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
  ZoomIn,
  ZoomOut,
  Maximize2,
  AlertCircle,
  Settings,
  FileText,
  ImageIcon,
  QrCode,
  ArrowUpDown,
  Eye,
  Move,
  RotateCw
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { AdBanner } from "@/components/ads/ad-banner"

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
  type: string
  dimensions?: { width: number; height: number }
  pageCount?: number
  pages?: any[]
  preview?: string
  processed?: boolean
  processedPreview?: string
  processedSize?: number
  blob?: Blob
  selected?: boolean
  thumbnail?: string
}

interface UnifiedToolLayoutProps {
  title: string
  description: string
  icon: any
  toolType: "image" | "pdf" | "qr"
  processFunction: (files: any[], options: any) => Promise<{ success: boolean; processedFiles?: any[]; downloadUrl?: string; filename?: string; qrDataURL?: string; error?: string }>
  options?: ToolOption[]
  maxFiles?: number
  allowBatchProcessing?: boolean
  allowPageSelection?: boolean
  allowPageReorder?: boolean
  supportedFormats?: string[]
  outputFormats?: string[]
  showUploadArea?: boolean
  richContent?: React.ReactNode
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
  allowBatchProcessing = true,
  allowPageSelection = false,
  allowPageReorder = false,
  supportedFormats = [],
  outputFormats = [],
  showUploadArea = true,
  richContent,
  children
}: UnifiedToolLayoutProps) {
  const [files, setFiles] = useState<ProcessedFile[]>([])
  const [toolOptions, setToolOptions] = useState<Record<string, any>>({})
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [selectedPages, setSelectedPages] = useState<string[]>([])
  const [zoomLevel, setZoomLevel] = useState(100)
  const [cropArea, setCropArea] = useState({ x: 20, y: 20, width: 60, height: 60 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [showToolsInterface, setShowToolsInterface] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  // Initialize options with defaults
  useEffect(() => {
    const defaultOptions: Record<string, any> = {}
    options.forEach(option => {
      defaultOptions[option.key] = option.defaultValue
    })
    setToolOptions(defaultOptions)
  }, [options])

  // Show/hide tools interface based on files
  useEffect(() => {
    if (toolType === "qr") {
      setShowToolsInterface(true)
    } else {
      setShowToolsInterface(files.length > 0)
    }
  }, [files.length, toolType])

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
        const processedFile: ProcessedFile = {
          id: `${file.name}-${Date.now()}-${Math.random()}`,
          file,
          originalFile: file,
          name: file.name,
          size: file.size,
          type: file.type,
        }

        // Generate preview based on file type
        if (file.type.startsWith("image/")) {
          const dimensions = await getImageDimensions(file)
          const preview = await createImagePreview(file)
          processedFile.dimensions = dimensions
          processedFile.preview = preview
        } else if (file.type === "application/pdf") {
          const pdfInfo = await getPDFInfo(file)
          processedFile.pageCount = pdfInfo.pageCount
          processedFile.pages = pdfInfo.pages
          processedFile.preview = pdfInfo.pages[0]?.thumbnail
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

  const getPDFInfo = async (file: File): Promise<{ pageCount: number; pages: any[] }> => {
    // Simulate PDF page extraction
    const pageCount = Math.floor(Math.random() * 20) + 5
    const pages = Array.from({ length: pageCount }, (_, i) => ({
      pageNumber: i + 1,
      thumbnail: createPDFThumbnail(i + 1, pageCount),
      selected: false
    }))
    return { pageCount, pages }
  }

  const createPDFThumbnail = (pageNum: number, totalPages: number): string => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")!
    canvas.width = 200
    canvas.height = 280
    
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = "#e2e8f0"
    ctx.strokeRect(0, 0, canvas.width, canvas.height)
    
    ctx.fillStyle = "#6b7280"
    ctx.font = "14px Arial"
    ctx.textAlign = "center"
    ctx.fillText(`Page ${pageNum}`, canvas.width / 2, canvas.height / 2)
    ctx.fillText(`of ${totalPages}`, canvas.width / 2, canvas.height / 2 + 20)
    
    return canvas.toDataURL("image/png", 0.8)
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
    
    const defaultOptions: Record<string, any> = {}
    options.forEach(option => {
      defaultOptions[option.key] = option.defaultValue
    })
    setToolOptions(defaultOptions)
  }

  const togglePageSelection = (pageKey: string) => {
    setSelectedPages(prev => 
      prev.includes(pageKey) 
        ? prev.filter(p => p !== pageKey)
        : [...prev, pageKey]
    )
  }

  const handleProcess = async () => {
    if (toolType !== "qr" && files.length === 0) {
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
        setProcessingProgress(prev => Math.min(prev + 10, 85))
      }, 300)

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

  const downloadFile = (file: ProcessedFile) => {
    if (!file.blob && !file.processedPreview) return

    const link = document.createElement("a")
    link.href = file.processedPreview || file.preview || ""
    link.download = file.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast({
      title: "Download started",
      description: `${file.name} downloaded successfully`
    })
  }

  const downloadAll = async () => {
    const processedFiles = files.filter(f => f.processed && f.blob)
    
    if (processedFiles.length === 0) {
      toast({
        title: "No processed files",
        description: "Please process files first",
        variant: "destructive"
      })
      return
    }

    if (processedFiles.length === 1) {
      downloadFile(processedFiles[0])
      return
    }

    try {
      const JSZip = (await import("jszip")).default
      const zip = new JSZip()

      processedFiles.forEach((file) => {
        if (file.blob) {
          zip.file(file.name, file.blob)
        }
      })

      const zipBlob = await zip.generateAsync({ type: "blob" })
      const url = URL.createObjectURL(zipBlob)
      const link = document.createElement("a")
      link.href = url
      link.download = "processed-files.zip"
      link.click()
      URL.revokeObjectURL(url)
      
      toast({
        title: "Download started",
        description: "All processed files downloaded as ZIP"
      })
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to create ZIP file",
        variant: "destructive"
      })
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
  const handleCropMouseDown = (e: React.MouseEvent, handle?: string) => {
    if (toolType !== "image") return
    
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
    e.preventDefault()
  }

  const handleCropMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || toolType !== "image") return
    
    const deltaX = e.clientX - dragStart.x
    const deltaY = e.clientY - dragStart.y
    
    setCropArea(prev => ({
      ...prev,
      x: Math.max(0, Math.min(100 - prev.width, prev.x + deltaX * 0.1)),
      y: Math.max(0, Math.min(100 - prev.height, prev.y + deltaY * 0.1))
    }))
  }, [isDragging, dragStart, toolType])

  const handleCropMouseUp = useCallback(() => {
    setIsDragging(false)
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
            disabled={isProcessing || (toolType !== "qr" && files.length === 0)}
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
                {toolType === "qr" ? "Generate QR Code" : `Process ${files.length} File${files.length !== 1 ? 's' : ''}`}
              </>
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )

  // Render upload area when no files or QR tool
  if (!showToolsInterface && showUploadArea && toolType !== "qr") {
    return (
      <div className="tool-wrapper min-h-screen bg-background">
        <Header />
        
        {/* Persistent Ad Slot - Before Upload */}
        <div className="ad-slot ad-before bg-white border-b">
          <div className="container mx-auto px-4 py-3">
            <AdBanner 
              adSlot="before-upload-banner"
              adFormat="auto"
              className="max-w-4xl mx-auto"
              mobileOptimized={true}
            />
          </div>
        </div>

        <div className="upload-area bg-white">
          <div className="container mx-auto px-4 py-8">
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
        </div>

        {/* Persistent Ad Slot - After Upload */}
        <div className="ad-slot ad-after bg-white border-t">
          <div className="container mx-auto px-4 py-3">
            <AdBanner 
              adSlot="after-upload-banner"
              adFormat="auto"
              className="max-w-4xl mx-auto"
              mobileOptimized={true}
            />
          </div>
        </div>

        {/* Rich Educational Content */}
        <div className="tool-content bg-white">
          {richContent}
        </div>

        <Footer />

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

  // Tools interface after files are uploaded or for QR tools
  return (
    <div className="tool-wrapper min-h-screen bg-background">
      <Header />

      {/* Mobile Layout */}
      <div className="lg:hidden">
        {/* Tools Header */}
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

        {/* Persistent Ad Slot - Before Canvas */}
        <div className="ad-slot ad-before bg-white">
          <div className="container mx-auto px-4 py-2">
            <AdBanner 
              adSlot="before-canvas-banner"
              adFormat="auto"
              className="max-w-4xl mx-auto"
              mobileOptimized={true}
            />
          </div>
        </div>

        {/* Canvas */}
        <div className="canvas bg-gray-50 p-4 min-h-[60vh]">
          {toolType === "image" && files.length > 0 && (
            <div className="space-y-4">
              {files.map((file) => (
                <Card key={file.id} className="relative">
                  <CardContent className="p-3">
                    <div className="relative">
                      {/* Image with crop overlay */}
                      <div className="relative">
                        <img
                          src={file.processedPreview || file.preview}
                          alt={file.name}
                          className="w-full aspect-square object-cover border rounded"
                        />
                        
                        {/* Crop overlay for image cropper */}
                        {title.toLowerCase().includes("crop") && (
                          <div 
                            className="crop-area absolute border-2 border-cyan-500 bg-cyan-500/10 cursor-move"
                            style={{
                              left: `${cropArea.x}%`,
                              top: `${cropArea.y}%`,
                              width: `${cropArea.width}%`,
                              height: `${cropArea.height}%`
                            }}
                            onMouseDown={handleCropMouseDown}
                          >
                            {/* Crop handles */}
                            <div className="crop-handle absolute -top-2 -left-2 w-4 h-4 bg-cyan-500 border-2 border-white rounded-full"></div>
                            <div className="crop-handle absolute -top-2 -right-2 w-4 h-4 bg-cyan-500 border-2 border-white rounded-full"></div>
                            <div className="crop-handle absolute -bottom-2 -left-2 w-4 h-4 bg-cyan-500 border-2 border-white rounded-full"></div>
                            <div className="crop-handle absolute -bottom-2 -right-2 w-4 h-4 bg-cyan-500 border-2 border-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                      
                      {file.processed && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle className="h-5 w-5 text-green-600 bg-white rounded-full" />
                        </div>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                        className="absolute top-2 left-2"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="mt-2 text-center">
                      <p className="text-xs font-medium text-gray-900 truncate">{file.name}</p>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>{formatFileSize(file.size)}</span>
                        {file.processedSize && (
                          <span className="text-green-600">→ {formatFileSize(file.processedSize)}</span>
                        )}
                      </div>
                      {file.dimensions && (
                        <p className="text-xs text-gray-400">{file.dimensions.width}×{file.dimensions.height}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {toolType === "pdf" && files.length > 0 && (
            <div className="space-y-4">
              {files.map((file) => (
                <Card key={file.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-6 w-6 text-red-600" />
                        <div>
                          <CardTitle className="text-sm">{file.name}</CardTitle>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>{formatFileSize(file.size)}</span>
                            {file.pageCount && <span>{file.pageCount} pages</span>}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  
                  {allowPageSelection && file.pages && (
                    <CardContent>
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Select Pages</Label>
                        <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                          {file.pages.map((page) => {
                            const pageKey = `${file.id}-page-${page.pageNumber}`
                            const isSelected = selectedPages.includes(pageKey)
                            
                            return (
                              <div
                                key={pageKey}
                                className={`pdf-page-thumbnail relative cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${
                                  isSelected ? 'border-red-500 ring-2 ring-red-200 selected' : 'border-gray-200 hover:border-red-300'
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
                                    <CheckCircle className="h-4 w-4 text-red-600 bg-white rounded-full" />
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                        {selectedPages.length > 0 && (
                          <p className="text-sm text-gray-600">
                            {selectedPages.length} page{selectedPages.length !== 1 ? 's' : ''} selected
                          </p>
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}

          {toolType === "qr" && (
            <div className="space-y-4">
              {children}
            </div>
          )}
        </div>

        {/* Persistent Ad Slot - After Canvas */}
        <div className="ad-slot ad-after bg-white border-t">
          <div className="container mx-auto px-4 py-2">
            <AdBanner 
              adSlot="after-canvas-banner"
              adFormat="auto"
              className="max-w-4xl mx-auto"
              mobileOptimized={true}
            />
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
              disabled={isProcessing || (toolType !== "qr" && files.length === 0)}
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

          {files.some(f => f.processed) && (
            <Button 
              onClick={downloadAll}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-base font-semibold"
              size="lg"
            >
              <Download className="h-4 w-4 mr-2" />
              Download All
            </Button>
          )}
        </div>

        <MobileSidebar />
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex h-[calc(100vh-4rem)] w-full overflow-hidden">
        {/* Left Canvas */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tools Header */}
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
              {files.length > 0 && toolType === "image" && (
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

          {/* Persistent Ad Slot - Before Canvas */}
          <div className="ad-slot ad-before bg-white">
            <div className="container mx-auto px-6 py-2">
              <AdBanner 
                adSlot="before-canvas-banner"
                adFormat="horizontal"
                className="max-w-4xl mx-auto"
              />
            </div>
          </div>

          {/* Canvas Content */}
          <div className="canvas bg-gray-50 flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-6 space-y-4 min-h-[calc(100vh-16rem)]">
                {toolType === "image" && files.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {files.map((file) => (
                      <Card key={file.id} className="relative group">
                        <CardContent className="p-3">
                          <div className="relative">
                            <img
                              src={file.processedPreview || file.preview}
                              alt={file.name}
                              className="w-full aspect-square object-cover border rounded transition-transform group-hover:scale-105"
                              style={{ 
                                transform: `scale(${Math.min(zoomLevel / 100, 1)})`,
                                transition: "transform 0.2s ease"
                              }}
                            />
                            
                            {/* Advanced crop overlay for image cropper */}
                            {title.toLowerCase().includes("crop") && (
                              <div 
                                className="crop-area absolute border-2 border-cyan-500 bg-cyan-500/10 cursor-move hover:bg-cyan-500/20 transition-colors"
                                style={{
                                  left: `${cropArea.x}%`,
                                  top: `${cropArea.y}%`,
                                  width: `${cropArea.width}%`,
                                  height: `${cropArea.height}%`
                                }}
                                onMouseDown={handleCropMouseDown}
                              >
                                {/* Enhanced crop handles */}
                                <div className="crop-handle absolute -top-2 -left-2 w-4 h-4 bg-cyan-500 border-2 border-white rounded-full hover:scale-125 transition-transform cursor-nw-resize"></div>
                                <div className="crop-handle absolute -top-2 -right-2 w-4 h-4 bg-cyan-500 border-2 border-white rounded-full hover:scale-125 transition-transform cursor-ne-resize"></div>
                                <div className="crop-handle absolute -bottom-2 -left-2 w-4 h-4 bg-cyan-500 border-2 border-white rounded-full hover:scale-125 transition-transform cursor-sw-resize"></div>
                                <div className="crop-handle absolute -bottom-2 -right-2 w-4 h-4 bg-cyan-500 border-2 border-white rounded-full hover:scale-125 transition-transform cursor-se-resize"></div>
                                
                                {/* Center move handle */}
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-cyan-500/80 rounded-full flex items-center justify-center cursor-move">
                                  <Move className="h-3 w-3 text-white" />
                                </div>
                              </div>
                            )}
                            
                            {file.processed && (
                              <div className="absolute top-2 right-2">
                                <CheckCircle className="h-5 w-5 text-green-600 bg-white rounded-full" />
                              </div>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeFile(file.id)}
                              className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                            {file.processed && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => downloadFile(file)}
                                className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Download className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                          <div className="mt-2 text-center">
                            <p className="text-xs font-medium text-gray-900 truncate">{file.name}</p>
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                              <span>{formatFileSize(file.size)}</span>
                              {file.processedSize && (
                                <span className="text-green-600">→ {formatFileSize(file.processedSize)}</span>
                              )}
                            </div>
                            {file.dimensions && (
                              <p className="text-xs text-gray-400">{file.dimensions.width}×{file.dimensions.height}</p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {toolType === "pdf" && files.length > 0 && (
                  <div className="space-y-4">
                    {files.map((file) => (
                      <Card key={file.id} className="relative">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <FileText className="h-8 w-8 text-red-600" />
                              <div>
                                <CardTitle className="text-base">{file.name}</CardTitle>
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                  <span>{formatFileSize(file.size)}</span>
                                  {file.pageCount && <span>{file.pageCount} pages</span>}
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeFile(file.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        
                        {allowPageSelection && file.pages && (
                          <CardContent>
                            <div className="space-y-3">
                              <Label className="text-sm font-medium">Select Pages</Label>
                              <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 max-h-48 overflow-y-auto">
                                {file.pages.map((page) => {
                                  const pageKey = `${file.id}-page-${page.pageNumber}`
                                  const isSelected = selectedPages.includes(pageKey)
                                  
                                  return (
                                    <div
                                      key={pageKey}
                                      className={`pdf-page-thumbnail relative cursor-pointer border-2 rounded-lg overflow-hidden transition-all hover:shadow-md hover:scale-105 ${
                                        isSelected ? 'border-red-500 ring-2 ring-red-200 selected' : 'border-gray-200 hover:border-red-300'
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
                                          <CheckCircle className="h-4 w-4 text-red-600 bg-white rounded-full" />
                                        </div>
                                      )}
                                      
                                      {/* Drag handle for reordering */}
                                      {allowPageReorder && (
                                        <div className="pdf-page-reorder absolute top-1 left-1 p-1 bg-white/80 rounded cursor-move opacity-0 group-hover:opacity-100 transition-opacity">
                                          <ArrowUpDown className="grip-handle h-3 w-3 text-gray-600" />
                                        </div>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                              {selectedPages.length > 0 && (
                                <p className="text-sm text-gray-600">
                                  {selectedPages.length} page{selectedPages.length !== 1 ? 's' : ''} selected
                                </p>
                              )}
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    ))}
                  </div>
                )}

                {toolType === "qr" && (
                  <div className="max-w-2xl mx-auto">
                    {children}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Persistent Ad Slot - After Canvas */}
          <div className="ad-slot ad-after bg-white border-t">
            <div className="container mx-auto px-6 py-2">
              <AdBanner 
                adSlot="after-canvas-banner"
                adFormat="auto"
                className="max-w-4xl mx-auto"
              />
            </div>
          </div>
        </div>

        {/* Desktop Right Sidebar */}
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

                {/* File Info */}
                {files.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <h4 className="text-sm font-semibold text-blue-800 mb-2">File Info</h4>
                    <div className="text-xs text-blue-700 space-y-1">
                      <div className="flex justify-between">
                        <span>Total Files:</span>
                        <span className="font-medium">{files.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Size:</span>
                        <span className="font-medium">{formatFileSize(files.reduce((sum, f) => sum + f.size, 0))}</span>
                      </div>
                      {toolType === "pdf" && (
                        <div className="flex justify-between">
                          <span>Total Pages:</span>
                          <span className="font-medium">{files.reduce((sum, f) => sum + (f.pageCount || 0), 0)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Processed:</span>
                        <span className="font-medium">{files.filter(f => f.processed).length}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* Hidden File Input */}
      {toolType !== "qr" && (
        <input
          ref={fileInputRef}
          type="file"
          accept={supportedFormats.join(",")}
          multiple={allowBatchProcessing && maxFiles > 1}
          onChange={(e) => handleFileUpload(e.target.files)}
          className="hidden"
        />
      )}

      {/* Fixed Sidebar Footer */}
      <div className="hidden lg:block fixed bottom-0 right-0 w-80 xl:w-96 p-6 border-t bg-gray-50 space-y-3">
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
          disabled={isProcessing || (toolType !== "qr" && files.length === 0)}
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
              {toolType === "qr" ? "Generate QR Code" : `Process ${files.length} File${files.length !== 1 ? 's' : ''}`}
            </>
          )}
        </Button>

        {files.some(f => f.processed) && (
          <Button 
            onClick={downloadAll}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-base font-semibold"
            size="lg"
          >
            <Download className="h-4 w-4 mr-2" />
            Download All ({files.filter(f => f.processed).length})
          </Button>
        )}
      </div>

      <MobileSidebar />
    </div>
  )
}