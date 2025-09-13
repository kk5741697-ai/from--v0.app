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
import { Separator } from "@/components/ui/separator"
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
  EyeOff
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { AdBanner } from "@/components/ads/ad-banner"
import { MobileOptionPanel } from "@/components/mobile-option-panel"
import { PDFThumbnailExtractor } from "@/components/pdf-thumbnail-extractor"

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
  const [showUploadArea, setShowUploadArea] = useState(true)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [selectedPages, setSelectedPages] = useState<string[]>([])
  const [draggedPage, setDraggedPage] = useState<number | null>(null)
  const [qrPreview, setQrPreview] = useState("")
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Initialize options with defaults
  useEffect(() => {
    const defaultOptions: Record<string, any> = {}
    options.forEach(option => {
      defaultOptions[option.key] = option.defaultValue
    })
    setToolOptions(defaultOptions)
  }, [options])

  // Show/hide interface based on files
  useEffect(() => {
    setShowUploadArea(files.length === 0)
  }, [files])

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
      const pdfjs = await import('pdfjs-dist')
      pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`
      
      const arrayBuffer = await file.arrayBuffer()
      const loadingTask = pdfjs.getDocument(arrayBuffer)
      const pdf = await loadingTask.promise
      
      const pages = []
      const scale = 0.3 // Smaller scale for thumbnails
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const viewport = page.getViewport({ scale })
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')!
        
        canvas.height = viewport.height
        canvas.width = viewport.width
        
        await page.render({ canvasContext: context, viewport }).promise
        
        pages.push({
          pageNumber: i,
          thumbnail: canvas.toDataURL('image/jpeg', 0.8),
          selected: false,
          width: viewport.width,
          height: viewport.height
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
    setShowUploadArea(true)
    setIsMobileSidebarOpen(false)
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

  // Render upload area when no files
  if (showUploadArea) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        
        {/* Upload Area First */}
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

          {/* Before Upload Ads */}
          <div className="mb-6">
            <AdBanner 
              adSlot="unified-before-canvas"
              adFormat="auto"
              className="max-w-3xl mx-auto"
              mobileOptimized={true}
            />
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

          {/* After Upload Ads */}
          <div className="mt-6">
            <AdBanner 
              adSlot="unified-after-canvas"
              adFormat="auto"
              className="max-w-3xl mx-auto"
              mobileOptimized={true}
            />
          </div>
        </div>

        {/* Rich Content */}
        {richContent && (
          <div className="bg-gray-50">
            {richContent}
          </div>
        )}

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

  // Tool interface when files are loaded
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Tools Header - Always visible when files loaded */}
      <div className="bg-white border-b shadow-sm">
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

      {/* Before Canvas Ads */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <AdBanner 
            adSlot="unified-before-canvas"
            adFormat="auto"
            className="max-w-4xl mx-auto"
            mobileOptimized={true}
          />
        </div>
      </div>

      {/* Main Tool Interface */}
      <div className="flex h-[calc(100vh-12rem)] w-full overflow-hidden">
        {/* Canvas Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden p-4 lg:p-6">
            {/* Custom children content (for QR tools) */}
            {children && (
              <div className="h-full">
                {children}
              </div>
            )}

            {/* Image Tools Canvas */}
            {toolType === "image" && !children && (
              <div className="h-full">
                {files.length === 1 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                    {/* Before */}
                    <Card className="h-full">
                      <CardHeader>
                        <CardTitle>Original</CardTitle>
                        <CardDescription>{files[0].name}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1 flex items-center justify-center">
                        <div className="relative max-w-full max-h-full">
                          <img
                            src={files[0].preview}
                            alt="Original"
                            className="max-w-full max-h-[50vh] object-contain border border-gray-300 rounded-lg shadow-lg bg-white"
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
                        </div>
                      </CardContent>
                    </Card>

                    {/* After */}
                    <Card className="h-full">
                      <CardHeader>
                        <CardTitle>Processed</CardTitle>
                        <CardDescription>Result preview</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1 flex items-center justify-center">
                        {files[0].processedPreview ? (
                          <div className="relative max-w-full max-h-full">
                            <img
                              src={files[0].processedPreview}
                              alt="Processed"
                              className="max-w-full max-h-[50vh] object-contain border border-gray-300 rounded-lg shadow-lg bg-white"
                              style={{ 
                                transform: `scale(${Math.min(zoomLevel / 100, 1)})`,
                                transition: "transform 0.2s ease"
                              }}
                            />
                            <div className="absolute top-2 right-2">
                              <CheckCircle className="h-5 w-5 text-green-600 bg-white rounded-full" />
                            </div>
                          </div>
                        ) : (
                          <div className="text-center text-gray-500">
                            <Icon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                            <p>Processed image will appear here</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {files.map((file) => (
                      <Card key={file.id} className="relative">
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
                {/* PDF Files List */}
                <div className="space-y-4">
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
                                className={`relative cursor-pointer border-2 rounded-lg overflow-hidden transition-all hover:shadow-md ${
                                  selectedPages.includes(`${file.id}-page-${page.pageNumber}`)
                                    ? "border-blue-500 ring-2 ring-blue-200"
                                    : "border-gray-200 hover:border-gray-300"
                                }`}
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
                    <img
                      src={qrPreview}
                      alt="Generated QR Code"
                      className="max-w-full h-auto border rounded-lg shadow-lg mx-auto"
                    />
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden lg:flex w-80 xl:w-96 bg-white border-l shadow-lg flex-col h-full">
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

      {/* After Canvas Ads */}
      <div className="bg-white border-t">
        <div className="container mx-auto px-4 py-3">
          <AdBanner 
            adSlot="unified-after-canvas"
            adFormat="auto"
            className="max-w-4xl mx-auto"
            mobileOptimized={true}
          />
        </div>
      </div>

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