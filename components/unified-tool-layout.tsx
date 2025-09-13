"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { 
  Upload, 
  Download, 
  CheckCircle,
  X,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Settings,
  FileText,
  Image as ImageIcon,
  QrCode,
  ArrowUpDown,
  GripVertical,
  Eye,
  EyeOff,
  Crop as CropIcon
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { PersistentAdManager } from "@/components/ads/persistent-ad-manager"
import { MobileOptionPanel } from "@/components/mobile-option-panel"

interface ToolFile {
  id: string
  file: File
  originalFile?: File
  name: string
  size: number
  type: string
  preview?: string
  processed?: boolean
  processedPreview?: string
  processedSize?: number
  blob?: Blob
  dimensions?: { width: number; height: number }
  pages?: Array<{
    pageNumber: number
    thumbnail: string
    selected: boolean
    width: number
    height: number
  }>
  selected?: boolean
}

interface ToolOption {
  key: string
  label: string
  type: "text" | "number" | "select" | "checkbox" | "slider" | "color" | "input"
  defaultValue: any
  min?: number
  max?: number
  step?: number
  selectOptions?: Array<{ value: string; label: string }>
  section?: string
  condition?: (options: any) => boolean
}

interface UnifiedToolLayoutProps {
  title: string
  description: string
  icon: any
  toolType: "image" | "pdf" | "qr"
  processFunction: (files: ToolFile[], options: any) => Promise<{ 
    success: boolean
    processedFiles?: ToolFile[]
    downloadUrl?: string
    filename?: string
    qrDataURL?: string
    error?: string 
  }>
  options?: ToolOption[]
  maxFiles?: number
  allowBatchProcessing?: boolean
  allowPageReorder?: boolean
  allowPageSelection?: boolean
  supportedFormats?: string[]
  outputFormats?: string[]
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
  allowPageReorder = false,
  allowPageSelection = false,
  supportedFormats = [],
  outputFormats = [],
  richContent,
  children
}: UnifiedToolLayoutProps) {
  const [files, setFiles] = useState<ToolFile[]>([])
  const [toolOptions, setToolOptions] = useState<Record<string, any>>({})
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [selectedPages, setSelectedPages] = useState<string[]>([])
  const [draggedPage, setDraggedPage] = useState<number | null>(null)
  const [qrPreview, setQrPreview] = useState("")
  const [cropArea, setCropArea] = useState({ x: 20, y: 20, width: 60, height: 60 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  
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

  const handleFileUpload = async (uploadedFiles: FileList | null) => {
    if (!uploadedFiles || uploadedFiles.length === 0) return

    if (files.length + uploadedFiles.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `Maximum ${maxFiles} files allowed`,
        variant: "destructive"
      })
      return
    }

    const newFiles: ToolFile[] = []

    for (const file of Array.from(uploadedFiles)) {
      if (supportedFormats.length > 0 && !supportedFormats.includes(file.type)) {
        toast({
          title: "Unsupported format",
          description: `${file.name} format not supported`,
          variant: "destructive"
        })
        continue
      }

      try {
        const toolFile: ToolFile = {
          id: `${file.name}-${Date.now()}-${Math.random()}`,
          file,
          originalFile: file,
          name: file.name,
          size: file.size,
          type: file.type,
        }

        // Generate preview for images
        if (file.type.startsWith("image/")) {
          const preview = await createImagePreview(file)
          const dimensions = await getImageDimensions(file)
          toolFile.preview = preview
          toolFile.dimensions = dimensions
        }

        // Extract PDF pages for PDF tools
        if (file.type === "application/pdf" && (allowPageReorder || allowPageSelection)) {
          const pages = await extractPDFPages(file)
          toolFile.pages = pages
        }

        newFiles.push(toolFile)
      } catch (error) {
        toast({
          title: "Error loading file",
          description: `Failed to load ${file.name}`,
          variant: "destructive"
        })
      }
    }

    setFiles(prev => [...prev, ...newFiles])
    
    if (newFiles.length > 0) {
      toast({
        title: "Files uploaded",
        description: `${newFiles.length} file(s) loaded successfully`
      })
    }
  }

  const createImagePreview = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight })
      img.onerror = reject
      img.src = URL.createObjectURL(file)
    })
  }

  const extractPDFPages = async (file: File): Promise<Array<{
    pageNumber: number
    thumbnail: string
    selected: boolean
    width: number
    height: number
  }>> => {
    try {
      // Use pdf-lib for page extraction
      const { PDFDocument } = await import('pdf-lib')
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await PDFDocument.load(arrayBuffer)
      const pageCount = pdf.getPageCount()
      
      const pages = []
      
      for (let i = 0; i < pageCount; i++) {
        // Create realistic PDF page thumbnail
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')!
        canvas.width = 200
        canvas.height = 280
        
        // White background
        ctx.fillStyle = "#ffffff"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        
        // Border
        ctx.strokeStyle = "#e2e8f0"
        ctx.lineWidth = 1
        ctx.strokeRect(0, 0, canvas.width, canvas.height)
        
        // Header
        ctx.fillStyle = "#1f2937"
        ctx.font = "bold 12px system-ui"
        ctx.textAlign = "left"
        ctx.fillText("Document Content", 15, 25)
        
        // Content simulation with varying content per page
        ctx.fillStyle = "#374151"
        ctx.font = "10px system-ui"
        const lines = [
          "Lorem ipsum dolor sit amet, consectetur",
          "adipiscing elit. Sed do eiusmod tempor",
          "incididunt ut labore et dolore magna",
          "aliqua. Ut enim ad minim veniam,",
          "quis nostrud exercitation ullamco",
          "laboris nisi ut aliquip ex ea commodo",
          "consequat. Duis aute irure dolor in",
          "reprehenderit in voluptate velit esse",
          "cillum dolore eu fugiat nulla pariatur."
        ]
        
        lines.forEach((line, lineIndex) => {
          if (lineIndex < 8) {
            // Vary content slightly per page
            const pageVariation = i % 3
            const adjustedLine = pageVariation === 0 ? line : 
                               pageVariation === 1 ? line.substring(0, 25) + "..." :
                               line.substring(0, 30)
            ctx.fillText(adjustedLine, 15, 45 + lineIndex * 12)
          }
        })
        
        // Add some visual elements
        ctx.fillStyle = "#e5e7eb"
        ctx.fillRect(15, 150, canvas.width - 30, 1)
        ctx.fillRect(15, 170, canvas.width - 50, 1)
        
        // Add page-specific elements
        if (i === 0) {
          ctx.fillStyle = "#3b82f6"
          ctx.fillRect(15, 180, 50, 20)
          ctx.fillStyle = "#ffffff"
          ctx.font = "8px system-ui"
          ctx.textAlign = "center"
          ctx.fillText("TITLE", 40, 192)
        }
        
        // Footer
        ctx.fillStyle = "#9ca3af"
        ctx.font = "8px system-ui"
        ctx.textAlign = "center"
        ctx.fillText(`Page ${i + 1} of ${pageCount}`, canvas.width / 2, canvas.height - 15)

        pages.push({
          pageNumber: i + 1,
          thumbnail: canvas.toDataURL('image/png', 0.8),
          selected: false,
          width: 200,
          height: 280
        })
      }
      
      return pages
    } catch (error) {
      console.error("Failed to extract PDF pages:", error)
      return []
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    handleFileUpload(e.dataTransfer.files)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const processFiles = async () => {
    if (files.length === 0) return

    setIsProcessing(true)
    setProcessingProgress(0)

    try {
      // Add selected pages to options for PDF tools
      if (allowPageSelection && selectedPages.length > 0) {
        setToolOptions(prev => ({ ...prev, selectedPages }))
      }

      // Add crop area for image cropper
      if (toolType === "image" && title.toLowerCase().includes("crop")) {
        setToolOptions(prev => ({ ...prev, cropArea }))
      }

      const result = await processFunction(files, toolOptions)
      
      if (result.success) {
        if (result.processedFiles) {
          setFiles(result.processedFiles)
        }
        
        if (result.downloadUrl && result.filename) {
          downloadFile(result.downloadUrl, result.filename)
        }
        
        if (result.qrDataURL) {
          setQrPreview(result.qrDataURL)
        }
        
        toast({
          title: "Processing complete",
          description: "Files processed successfully"
        })
      } else {
        toast({
          title: "Processing failed",
          description: result.error || "Unknown error occurred",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Processing failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
      setProcessingProgress(100)
    }
  }

  const downloadFile = (url: string, filename: string) => {
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const downloadAllFiles = () => {
    const processedFiles = files.filter(f => f.processed && f.blob)
    
    if (processedFiles.length === 0) {
      toast({
        title: "No files to download",
        description: "Process files first",
        variant: "destructive"
      })
      return
    }

    processedFiles.forEach((file, index) => {
      setTimeout(() => {
        const url = URL.createObjectURL(file.blob!)
        downloadFile(url, file.name)
        URL.revokeObjectURL(url)
      }, index * 500)
    })
  }

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const resetTool = () => {
    setFiles([])
    setSelectedPages([])
    setQrPreview("")
    setProcessingProgress(0)
    setIsMobileSidebarOpen(false)
    setCropArea({ x: 20, y: 20, width: 60, height: 60 })
  }

  const togglePageSelection = (pageKey: string) => {
    setSelectedPages(prev => 
      prev.includes(pageKey) 
        ? prev.filter(p => p !== pageKey)
        : [...prev, pageKey]
    )
  }

  const handlePageReorder = (fromIndex: number, toIndex: number) => {
    if (!allowPageReorder) return
    
    setFiles(prev => prev.map(file => {
      if (file.pages) {
        const newPages = [...file.pages]
        const [movedPage] = newPages.splice(fromIndex, 1)
        newPages.splice(toIndex, 0, movedPage)
        return { ...file, pages: newPages }
      }
      return file
    }))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
  }

  const getAcceptedTypes = () => {
    if (supportedFormats.length === 0) return "*/*"
    return supportedFormats.join(",")
  }

  // Crop area handlers for image cropper
  const handleCropMouseDown = (e: React.MouseEvent) => {
    if (toolType !== "image" || !title.toLowerCase().includes("crop")) return
    
    setIsDragging(true)
    const rect = canvasRef.current?.getBoundingClientRect()
    if (rect) {
      setDragStart({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      })
    }
  }

  const handleCropMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || toolType !== "image" || !title.toLowerCase().includes("crop")) return
    
    const rect = canvasRef.current?.getBoundingClientRect()
    if (rect) {
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      
      setCropArea(prev => ({
        ...prev,
        x: Math.max(0, Math.min(100 - prev.width, x)),
        y: Math.max(0, Math.min(100 - prev.height, y))
      }))
    }
  }

  const handleCropMouseUp = () => {
    setIsDragging(false)
  }

  // Upload View (when files.length === 0)
  if (files.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        
        <PersistentAdManager>
          <div className="container mx-auto px-4 py-6 lg:py-8">
            <div className="text-center mb-6 lg:mb-8">
              <div className="inline-flex items-center space-x-2 mb-4">
                <Icon className="h-6 w-6 lg:h-8 lg:w-8 text-primary" />
                <h1 className="text-2xl lg:text-3xl font-heading font-bold text-foreground">{title}</h1>
              </div>
              <p className="text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
                {description}
              </p>
            </div>

            <div className="max-w-2xl mx-auto">
              <div 
                className="border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all duration-300 p-8 lg:p-16 group"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="relative mb-4 lg:mb-6">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:blur-2xl transition-all"></div>
                  <Upload className="relative h-16 w-16 lg:h-20 lg:w-20 text-primary group-hover:scale-110 transform duration-300" />
                </div>
                <h3 className="text-xl lg:text-2xl font-semibold mb-2 lg:mb-3 text-gray-700 group-hover:text-primary transition-colors">
                  Drop {toolType === "qr" ? "files or enter data" : "files"} here
                </h3>
                <p className="text-gray-500 mb-4 lg:mb-6 text-base lg:text-lg text-center">
                  or tap to browse files
                </p>
                <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white px-6 lg:px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 group-hover:scale-105">
                  <Upload className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
                  Choose Files
                </Button>
                <div className="mt-4 lg:mt-6 space-y-2 text-center">
                  <p className="text-sm text-gray-500 font-medium">
                    {supportedFormats.length > 0 ? supportedFormats.join(", ").toUpperCase() : "All formats supported"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {maxFiles > 1 ? `Up to ${maxFiles} files` : "Single file"} • Up to 25MB each
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Rich Educational Content */}
          {richContent && (
            <div className="bg-gray-50">
              {richContent}
            </div>
          )}
        </PersistentAdManager>

        <Footer />

        <input
          ref={fileInputRef}
          type="file"
          accept={getAcceptedTypes()}
          multiple={maxFiles > 1}
          onChange={(e) => handleFileUpload(e.target.files)}
          className="hidden"
        />
      </div>
    )
  }

  // Tool Interface (when files.length > 0)
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Tools Header - Always visible when files loaded */}
      <div className="tools-header bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-3 lg:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Icon className="h-6 w-6 text-primary" />
              <div>
                <h1 className="text-xl lg:text-2xl font-heading font-bold text-foreground">{title}</h1>
                <p className="text-sm text-muted-foreground">{files.length} file(s) loaded</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={resetTool}>
                <RefreshCw className="h-4 w-4 mr-2" />
                New
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsMobileSidebarOpen(true)}
                className="lg:hidden"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <PersistentAdManager>
        {/* Main Tool Interface */}
        <div className="flex h-[calc(100vh-12rem)] w-full overflow-hidden">
          {/* Canvas Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="canvas flex-1 overflow-hidden p-4 lg:p-6">
              {/* Custom children content (for QR tools) */}
              {children && (
                <div className="h-full">
                  {children}
                </div>
              )}

              {/* Image Tools Canvas */}
              {toolType === "image" && !children && (
                <div className="h-full">
                  {title.toLowerCase().includes("crop") && files.length === 1 ? (
                    // Image Cropper - Full Preview with Crop Area
                    <div className="h-full flex items-center justify-center">
                      <div 
                        ref={canvasRef}
                        className="relative max-w-full max-h-full border border-gray-300 rounded-lg overflow-hidden bg-white shadow-lg"
                        onMouseDown={handleCropMouseDown}
                        onMouseMove={handleCropMouseMove}
                        onMouseUp={handleCropMouseUp}
                        onMouseLeave={handleCropMouseUp}
                      >
                        <img
                          src={files[0].processedPreview || files[0].preview}
                          alt="Image to crop"
                          className="max-w-full max-h-[70vh] object-contain"
                          style={{ 
                            transform: `scale(${Math.min(zoomLevel / 100, 1)})`,
                            transition: "transform 0.2s ease"
                          }}
                        />
                        
                        {/* Crop Area Overlay */}
                        <div 
                          className={`crop-area absolute border-2 border-primary bg-primary/10 cursor-move ${isDragging ? 'dragging' : ''}`}
                          style={{
                            left: `${cropArea.x}%`,
                            top: `${cropArea.y}%`,
                            width: `${cropArea.width}%`,
                            height: `${cropArea.height}%`,
                          }}
                        >
                          {/* Crop Handles */}
                          <div className="crop-handle absolute -top-2 -left-2"></div>
                          <div className="crop-handle absolute -top-2 -right-2"></div>
                          <div className="crop-handle absolute -bottom-2 -left-2"></div>
                          <div className="crop-handle absolute -bottom-2 -right-2"></div>
                          <div className="crop-handle absolute -top-2 left-1/2 transform -translate-x-1/2"></div>
                          <div className="crop-handle absolute -bottom-2 left-1/2 transform -translate-x-1/2"></div>
                          <div className="crop-handle absolute -left-2 top-1/2 transform -translate-y-1/2"></div>
                          <div className="crop-handle absolute -right-2 top-1/2 transform -translate-y-1/2"></div>
                        </div>

                        {files[0].dimensions && (
                          <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            {files[0].dimensions.width}×{files[0].dimensions.height}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : files.length === 1 && !allowBatchProcessing ? (
                    // Single Image Tool - Full Preview
                    <div className="h-full flex items-center justify-center">
                      <div className="relative max-w-full max-h-full">
                        <img
                          src={files[0].processedPreview || files[0].preview}
                          alt="Image preview"
                          className="max-w-full max-h-[70vh] object-contain border border-gray-300 rounded-lg shadow-lg bg-white"
                          style={{ 
                            transform: `scale(${Math.min(zoomLevel / 100, 1)})`,
                            transition: "transform 0.2s ease"
                          }}
                        />
                        {files[0].dimensions && (
                          <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            {files[0].dimensions.width}×{files[0].dimensions.height}
                          </div>
                        )}
                        {files[0].processedPreview && (
                          <div className="absolute top-2 right-2">
                            <CheckCircle className="h-5 w-5 text-green-600 bg-white rounded-full" />
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    // Multiple Images - Thumbnail Grid
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {files.map((file) => (
                        <Card key={file.id} className="tool-file-thumbnail relative">
                          <CardContent className="p-4">
                            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3">
                              {file.preview ? (
                                <img
                                  src={file.processedPreview || file.preview}
                                  alt={file.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <ImageIcon className="h-8 w-8 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <p className="text-sm font-medium truncate">{file.name}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                            {file.processed && (
                              <div className="absolute top-2 right-2">
                                <CheckCircle className="h-5 w-5 text-green-600 bg-white rounded-full" />
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* PDF Tools Canvas */}
              {toolType === "pdf" && !children && (
                <div className="h-full space-y-4">
                  {files.map((file) => (
                    <Card key={file.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-6 w-6 text-red-600" />
                            <div>
                              <CardTitle className="text-lg">{file.name}</CardTitle>
                              <CardDescription>
                                {file.pages?.length || 0} pages • {formatFileSize(file.size)}
                              </CardDescription>
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
                      
                      {/* PDF Pages Thumbnails */}
                      {file.pages && file.pages.length > 0 && (
                        <CardContent>
                          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                            {file.pages.map((page, index) => (
                              <div
                                key={`${file.id}-page-${page.pageNumber}`}
                                className={`pdf-page-thumbnail relative cursor-pointer border-2 rounded-lg overflow-hidden transition-all hover:shadow-md ${
                                  selectedPages.includes(`${file.id}-page-${page.pageNumber}`)
                                    ? "selected border-blue-500 ring-2 ring-blue-200"
                                    : "border-gray-200 hover:border-gray-300"
                                } ${draggedPage === index ? "dragging" : ""}`}
                                onClick={() => allowPageSelection && togglePageSelection(`${file.id}-page-${page.pageNumber}`)}
                                draggable={allowPageReorder}
                                onDragStart={() => setDraggedPage(index)}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={() => {
                                  if (draggedPage !== null) {
                                    handlePageReorder(draggedPage, index)
                                    setDraggedPage(null)
                                  }
                                }}
                              >
                                <img
                                  src={page.thumbnail}
                                  alt={`Page ${page.pageNumber}`}
                                  className="w-full h-auto object-contain bg-white"
                                />
                                <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1 py-0.5 rounded">
                                  {page.pageNumber}
                                </div>
                                {allowPageSelection && selectedPages.includes(`${file.id}-page-${page.pageNumber}`) && (
                                  <div className="absolute top-1 right-1">
                                    <CheckCircle className="h-4 w-4 text-blue-600 bg-white rounded-full" />
                                  </div>
                                )}
                                {allowPageReorder && (
                                  <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <GripVertical className="h-4 w-4 text-gray-600 bg-white/80 rounded" />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                          
                          {allowPageSelection && (
                            <div className="mt-4 text-sm text-gray-600">
                              {selectedPages.length} page(s) selected
                            </div>
                          )}
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              )}

              {/* QR Tools Canvas */}
              {toolType === "qr" && !children && qrPreview && (
                <div className="flex justify-center items-center h-full">
                  <Card className="max-w-md">
                    <CardHeader>
                      <CardTitle>Generated QR Code</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <div className="qr-preview">
                        <img
                          src={qrPreview}
                          alt="Generated QR Code"
                          className="max-w-full h-auto border rounded-lg shadow-lg mx-auto"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Sidebar - Fixed Position */}
          <div className="sidebar hidden lg:flex w-80 xl:w-96 bg-white border-l shadow-lg flex-col fixed top-0 bottom-0 right-0 z-30">
            <div className="px-6 py-4 border-b bg-gray-50 flex-shrink-0">
              <div className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Tool Settings</h2>
              </div>
              <p className="text-sm text-gray-600 mt-1">Configure processing options</p>
            </div>

            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-6 space-y-6">
                  {/* Zoom Controls for Image Tools */}
                  {toolType === "image" && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Zoom Level</Label>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => setZoomLevel(prev => Math.max(25, prev - 25))}>
                          <ZoomOut className="h-4 w-4" />
                        </Button>
                        <span className="text-sm px-2 min-w-[60px] text-center">{zoomLevel}%</span>
                        <Button variant="outline" size="sm" onClick={() => setZoomLevel(prev => Math.min(400, prev + 25))}>
                          <ZoomIn className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setZoomLevel(100)}>
                          <Maximize2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Crop Area Controls for Image Cropper */}
                  {toolType === "image" && title.toLowerCase().includes("crop") && (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <div className="h-px bg-gray-200 flex-1"></div>
                        <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Crop Area</Label>
                        <div className="h-px bg-gray-200 flex-1"></div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">X Position</Label>
                          <Input
                            type="number"
                            value={Math.round(cropArea.x)}
                            onChange={(e) => setCropArea(prev => ({ ...prev, x: Number(e.target.value) }))}
                            min={0}
                            max={100 - cropArea.width}
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Y Position</Label>
                          <Input
                            type="number"
                            value={Math.round(cropArea.y)}
                            onChange={(e) => setCropArea(prev => ({ ...prev, y: Number(e.target.value) }))}
                            min={0}
                            max={100 - cropArea.height}
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Width</Label>
                          <Input
                            type="number"
                            value={Math.round(cropArea.width)}
                            onChange={(e) => setCropArea(prev => ({ ...prev, width: Number(e.target.value) }))}
                            min={1}
                            max={100 - cropArea.x}
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Height</Label>
                          <Input
                            type="number"
                            value={Math.round(cropArea.height)}
                            onChange={(e) => setCropArea(prev => ({ ...prev, height: Number(e.target.value) }))}
                            min={1}
                            max={100 - cropArea.y}
                            className="text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Group options by section */}
                  {Object.entries(
                    options.reduce((acc, option) => {
                      const section = option.section || "General"
                      if (!acc[section]) acc[section] = []
                      acc[section].push(option)
                      return acc
                    }, {} as Record<string, ToolOption[]>)
                  ).map(([section, sectionOptions]) => (
                    <div key={section} className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <div className="h-px bg-gray-200 flex-1"></div>
                        <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{section}</Label>
                        <div className="h-px bg-gray-200 flex-1"></div>
                      </div>
                      
                      {sectionOptions.map((option) => {
                        // Check condition if exists
                        if (option.condition && !option.condition(toolOptions)) {
                          return null
                        }

                        return (
                          <div key={option.key} className="space-y-2">
                            <Label className="text-sm font-medium">{option.label}</Label>
                            
                            {option.type === "select" && (
                              <Select
                                value={toolOptions[option.key]?.toString()}
                                onValueChange={(value) => setToolOptions(prev => ({ ...prev, [option.key]: value }))}
                              >
                                <SelectTrigger>
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

                            {option.type === "checkbox" && (
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  checked={toolOptions[option.key] || false}
                                  onCheckedChange={(checked) => setToolOptions(prev => ({ ...prev, [option.key]: checked }))}
                                />
                                <span className="text-sm">{option.label}</span>
                              </div>
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

                            {(option.type === "input" || option.type === "number") && (
                              <Input
                                type={option.type === "number" ? "number" : "text"}
                                value={toolOptions[option.key] || ""}
                                onChange={(e) => setToolOptions(prev => ({ 
                                  ...prev, 
                                  [option.key]: option.type === "number" ? Number(e.target.value) : e.target.value 
                                }))}
                                min={option.min}
                                max={option.max}
                                step={option.step}
                              />
                            )}

                            {option.type === "color" && (
                              <div className="flex items-center space-x-2">
                                <input
                                  type="color"
                                  value={toolOptions[option.key] || option.defaultValue}
                                  onChange={(e) => setToolOptions(prev => ({ ...prev, [option.key]: e.target.value }))}
                                  className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                                />
                                <Input
                                  value={toolOptions[option.key] || option.defaultValue}
                                  onChange={(e) => setToolOptions(prev => ({ ...prev, [option.key]: e.target.value }))}
                                  className="flex-1 font-mono text-sm"
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

            {/* Sidebar Footer */}
            <div className="p-6 border-t bg-gray-50 space-y-3 flex-shrink-0">
              <Button 
                onClick={processFiles}
                disabled={isProcessing || files.length === 0}
                className="w-full bg-primary hover:bg-primary/90 text-white py-3 text-base font-semibold"
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
                    Process {toolType === "qr" ? "QR Code" : "Files"}
                  </>
                )}
              </Button>

              {files.some(f => f.processed) && (
                <Button 
                  onClick={downloadAllFiles}
                  variant="outline"
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download All
                </Button>
              )}

              {isProcessing && (
                <div className="space-y-2">
                  <Progress value={processingProgress} />
                  <p className="text-xs text-gray-500 text-center">
                    Processing files...
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </PersistentAdManager>

      {/* Mobile Options Panel */}
      <MobileOptionPanel
        isOpen={isMobileSidebarOpen}
        onOpenChange={setIsMobileSidebarOpen}
        title="Tool Settings"
        icon={<Settings className="h-5 w-5 text-gray-600" />}
        footer={
          <div className="space-y-3">
            <Button 
              onClick={() => {
                processFiles()
                setIsMobileSidebarOpen(false)
              }}
              disabled={isProcessing || files.length === 0}
              className="w-full bg-primary hover:bg-primary/90 text-white py-3 text-base font-semibold"
              size="lg"
            >
              {isProcessing ? "Processing..." : `Process ${toolType === "qr" ? "QR Code" : "Files"}`}
            </Button>
            
            {files.some(f => f.processed) && (
              <Button 
                onClick={() => {
                  downloadAllFiles()
                  setIsMobileSidebarOpen(false)
                }}
                variant="outline"
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Download All
              </Button>
            )}
          </div>
        }
      >
        <div className="space-y-6">
          {/* Mobile Crop Controls */}
          {toolType === "image" && title.toLowerCase().includes("crop") && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="h-px bg-gray-200 flex-1"></div>
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Crop Area</Label>
                <div className="h-px bg-gray-200 flex-1"></div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">X Position</Label>
                  <Input
                    type="number"
                    value={Math.round(cropArea.x)}
                    onChange={(e) => setCropArea(prev => ({ ...prev, x: Number(e.target.value) }))}
                    min={0}
                    max={100 - cropArea.width}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Y Position</Label>
                  <Input
                    type="number"
                    value={Math.round(cropArea.y)}
                    onChange={(e) => setCropArea(prev => ({ ...prev, y: Number(e.target.value) }))}
                    min={0}
                    max={100 - cropArea.height}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Width</Label>
                  <Input
                    type="number"
                    value={Math.round(cropArea.width)}
                    onChange={(e) => setCropArea(prev => ({ ...prev, width: Number(e.target.value) }))}
                    min={1}
                    max={100 - cropArea.x}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Height</Label>
                  <Input
                    type="number"
                    value={Math.round(cropArea.height)}
                    onChange={(e) => setCropArea(prev => ({ ...prev, height: Number(e.target.value) }))}
                    min={1}
                    max={100 - cropArea.y}
                    className="text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tool Options */}
          {Object.entries(
            options.reduce((acc, option) => {
              const section = option.section || "General"
              if (!acc[section]) acc[section] = []
              acc[section].push(option)
              return acc
            }, {} as Record<string, ToolOption[]>)
          ).map(([section, sectionOptions]) => (
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
                    
                    {option.type === "select" && (
                      <Select
                        value={toolOptions[option.key]?.toString()}
                        onValueChange={(value) => setToolOptions(prev => ({ ...prev, [option.key]: value }))}
                      >
                        <SelectTrigger>
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

                    {option.type === "checkbox" && (
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Checkbox
                          checked={toolOptions[option.key] || false}
                          onCheckedChange={(checked) => setToolOptions(prev => ({ ...prev, [option.key]: checked }))}
                        />
                        <span className="text-sm">{option.label}</span>
                      </div>
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

                    {(option.type === "input" || option.type === "number") && (
                      <Input
                        type={option.type === "number" ? "number" : "text"}
                        value={toolOptions[option.key] || ""}
                        onChange={(e) => setToolOptions(prev => ({ 
                          ...prev, 
                          [option.key]: option.type === "number" ? Number(e.target.value) : e.target.value 
                        }))}
                        min={option.min}
                        max={option.max}
                        step={option.step}
                      />
                    )}

                    {option.type === "color" && (
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={toolOptions[option.key] || option.defaultValue}
                          onChange={(e) => setToolOptions(prev => ({ ...prev, [option.key]: e.target.value }))}
                          className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                        />
                        <Input
                          value={toolOptions[option.key] || option.defaultValue}
                          onChange={(e) => setToolOptions(prev => ({ ...prev, [option.key]: e.target.value }))}
                          className="flex-1 font-mono text-sm"
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </MobileOptionPanel>

      <input
        ref={fileInputRef}
        type="file"
        accept={getAcceptedTypes()}
        multiple={maxFiles > 1}
        onChange={(e) => handleFileUpload(e.target.files)}
        className="hidden"
      />
    </div>
  )
}