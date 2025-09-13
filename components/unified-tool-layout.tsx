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
import { MobileOptionPanel } from "@/components/mobile-option-panel"
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
  ArrowUpDown,
  Grid,
  Eye,
  EyeOff,
  RotateCcw,
  Play,
  Pause,
  FileText,
  Image as ImageIcon
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { AdBanner } from "@/components/ads/ad-banner"

interface ToolFile {
  id: string
  file: File
  originalFile?: File
  name: string
  size: number
  type: string
  dimensions?: { width: number; height: number }
  preview: string
  processed?: boolean
  processedPreview?: string
  processedSize?: number
  blob?: Blob
  selected?: boolean
  pageInfo?: any
}

interface ToolOption {
  key: string
  label: string
  type: "input" | "select" | "checkbox" | "slider" | "color" | "text"
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
  toolType: "image" | "pdf" | "qr" | "text"
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
  const [zoomLevel, setZoomLevel] = useState(100)
  const [showUploadArea, setShowUploadArea] = useState(true)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const [cropArea, setCropArea] = useState({ x: 20, y: 20, width: 60, height: 60 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragHandle, setDragHandle] = useState<string | null>(null)
  
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

  // Show sidebar when files are uploaded on desktop
  useEffect(() => {
    if (files.length > 0 && window.innerWidth >= 1024) {
      setShowSidebar(true)
      setShowUploadArea(false)
    } else if (files.length === 0) {
      setShowSidebar(false)
      setShowUploadArea(true)
    }
  }, [files.length])

  const handleFileUpload = async (uploadedFiles: FileList | null) => {
    if (!uploadedFiles || uploadedFiles.length === 0) return

    if (!allowBatchProcessing && uploadedFiles.length > 1) {
      toast({
        title: "Single file only",
        description: "This tool only supports one file at a time",
        variant: "destructive"
      })
      return
    }

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
        const dimensions = file.type.startsWith('image/') ? await getImageDimensions(file) : undefined
        const preview = await createFilePreview(file)
        
        const toolFile: ToolFile = {
          id: `${file.name}-${Date.now()}-${Math.random()}`,
          file,
          originalFile: file,
          name: file.name,
          size: file.size,
          type: file.type,
          dimensions,
          preview,
        }

        // Get PDF page info if needed
        if (file.type === "application/pdf" && (allowPageSelection || allowPageReorder)) {
          try {
            const { ClientPDFProcessor } = await import("@/lib/processors/client-pdf-processor")
            const pdfInfo = await ClientPDFProcessor.getPDFInfo(file)
            toolFile.pageInfo = pdfInfo
          } catch (error) {
            console.error("Failed to get PDF info:", error)
          }
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

  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight })
      img.onerror = reject
      img.src = URL.createObjectURL(file)
    })
  }

  const createFilePreview = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target?.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      } else {
        // For non-image files, create a placeholder
        resolve("")
      }
    })
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileUpload(e.dataTransfer.files)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const processFiles = async () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please upload files first",
        variant: "destructive"
      })
      return
    }

    setIsProcessing(true)
    setProcessingProgress(0)

    try {
      // Add crop area to options if this is image cropper
      const processOptions = { ...toolOptions }
      if (title.toLowerCase().includes('crop') && toolType === 'image') {
        processOptions.cropX = cropArea.x
        processOptions.cropY = cropArea.y
        processOptions.cropWidth = cropArea.width
        processOptions.cropHeight = cropArea.height
      }

      // Add selected pages for PDF tools
      if (allowPageSelection && files[0]?.pageInfo) {
        const selectedPages = files[0].pageInfo.pages
          .filter((page: any) => page.selected)
          .map((page: any) => page.pageNumber)
        processOptions.selectedPages = selectedPages
      }

      const result = await processFunction(files, processOptions)

      if (result.success) {
        if (result.processedFiles) {
          setFiles(prev => prev.map(file => {
            const processed = result.processedFiles!.find(pf => pf.id === file.id)
            return processed || file
          }))
          
          toast({
            title: "Processing complete",
            description: `${result.processedFiles.length} file(s) processed successfully`
          })
        } else if (result.downloadUrl && result.filename) {
          // Direct download
          const link = document.createElement("a")
          link.href = result.downloadUrl
          link.download = result.filename
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          
          toast({
            title: "Download started",
            description: "File processed and download started"
          })
        }
      } else {
        toast({
          title: "Processing failed",
          description: result.error || "An error occurred during processing",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Processing failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
      setProcessingProgress(100)
    }
  }

  const downloadFile = (file: ToolFile) => {
    if (!file.blob && !file.processedPreview) return

    const link = document.createElement("a")
    link.href = file.processedPreview || file.preview
    link.download = file.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast({
      title: "Download started",
      description: `${file.name} downloaded successfully`
    })
  }

  const downloadAllFiles = async () => {
    const processedFiles = files.filter(f => f.processed && f.blob)
    
    if (processedFiles.length === 0) {
      toast({
        title: "No processed files",
        description: "Process files first before downloading",
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

      processedFiles.forEach(file => {
        if (file.blob) {
          zip.file(file.name, file.blob)
        }
      })

      const zipBlob = await zip.generateAsync({ type: "blob" })
      const link = document.createElement("a")
      link.href = URL.createObjectURL(zipBlob)
      link.download = `${title.toLowerCase().replace(/\s+/g, '-')}-results.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast({
        title: "Download started",
        description: "All files downloaded as ZIP"
      })
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to create ZIP file",
        variant: "destructive"
      })
    }
  }

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId))
    
    if (files.length === 1) {
      setShowUploadArea(true)
      setShowSidebar(false)
    }
  }

  const resetTool = () => {
    setFiles([])
    setToolOptions({})
    setProcessingProgress(0)
    setShowUploadArea(true)
    setShowSidebar(false)
    setIsMobileSidebarOpen(false)
    setCropArea({ x: 20, y: 20, width: 60, height: 60 })
    
    // Reset options to defaults
    const defaultOptions: Record<string, any> = {}
    options.forEach(option => {
      defaultOptions[option.key] = option.defaultValue
    })
    setToolOptions(defaultOptions)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
  }

  const togglePageSelection = (pageNumber: number) => {
    if (!allowPageSelection || !files[0]?.pageInfo) return

    setFiles(prev => prev.map(file => {
      if (file.pageInfo) {
        const updatedPages = file.pageInfo.pages.map((page: any) => 
          page.pageNumber === pageNumber 
            ? { ...page, selected: !page.selected }
            : page
        )
        return {
          ...file,
          pageInfo: { ...file.pageInfo, pages: updatedPages }
        }
      }
      return file
    }))
  }

  // Crop area handlers for image cropper
  const handleCropDrag = useCallback((e: React.MouseEvent) => {
    if (!title.toLowerCase().includes('crop') || toolType !== 'image') return
    if (!isDragging || !dragHandle) return

    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    setCropArea(prev => {
      const newArea = { ...prev }
      
      switch (dragHandle) {
        case 'move':
          const deltaX = x - (prev.x + prev.width / 2)
          const deltaY = y - (prev.y + prev.height / 2)
          newArea.x = Math.max(0, Math.min(100 - prev.width, prev.x + deltaX))
          newArea.y = Math.max(0, Math.min(100 - prev.height, prev.y + deltaY))
          break
        case 'nw':
          newArea.width = Math.max(5, prev.x + prev.width - x)
          newArea.height = Math.max(5, prev.y + prev.height - y)
          newArea.x = Math.max(0, x)
          newArea.y = Math.max(0, y)
          break
        case 'ne':
          newArea.width = Math.max(5, x - prev.x)
          newArea.height = Math.max(5, prev.y + prev.height - y)
          newArea.y = Math.max(0, y)
          break
        case 'sw':
          newArea.width = Math.max(5, prev.x + prev.width - x)
          newArea.height = Math.max(5, y - prev.y)
          newArea.x = Math.max(0, x)
          break
        case 'se':
          newArea.width = Math.max(5, x - prev.x)
          newArea.height = Math.max(5, y - prev.y)
          break
      }
      
      return newArea
    })
  }, [isDragging, dragHandle, title, toolType])

  const handleCropMouseUp = useCallback(() => {
    setIsDragging(false)
    setDragHandle(null)
  }, [])

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleCropDrag as any)
      document.addEventListener('mouseup', handleCropMouseUp)
      
      return () => {
        document.removeEventListener('mousemove', handleCropDrag as any)
        document.removeEventListener('mouseup', handleCropMouseUp)
      }
    }
  }, [isDragging, handleCropDrag, handleCropMouseUp])

  // Group options by section
  const groupedOptions = options.reduce((groups, option) => {
    const section = option.section || "General"
    if (!groups[section]) groups[section] = []
    groups[section].push(option)
    return groups
  }, {} as Record<string, ToolOption[]>)

  // Mobile Sidebar Component
  const MobileSidebar = () => (
    <MobileOptionPanel
      isOpen={isMobileSidebarOpen}
      onOpenChange={setIsMobileSidebarOpen}
      title={`${title} Settings`}
      icon={<Icon className="h-5 w-5 text-primary" />}
      footer={
        files.some(f => f.processed) && (
          <Button 
            onClick={() => {
              downloadAllFiles()
              setIsMobileSidebarOpen(false)
            }}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-base font-semibold"
            size="lg"
          >
            <Download className="h-4 w-4 mr-2" />
            Download {files.filter(f => f.processed).length > 1 ? 'All' : 'Result'}
          </Button>
        )
      }
    >
      {Object.entries(groupedOptions).map(([section, sectionOptions]) => (
        <div key={section} className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="h-px bg-gray-200 flex-1"></div>
            <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{section}</Label>
            <div className="h-px bg-gray-200 flex-1"></div>
          </div>
          
          {sectionOptions.map((option) => {
            if (option.condition && !option.condition(toolOptions)) return null
            
            return (
              <div key={option.key} className="space-y-2">
                <Label className="text-sm font-medium">{option.label}</Label>
                
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

                {(option.type === "input" || option.type === "text") && (
                  <Input
                    type={option.type === "input" ? "number" : "text"}
                    value={toolOptions[option.key] || ""}
                    onChange={(e) => setToolOptions(prev => ({ 
                      ...prev, 
                      [option.key]: option.type === "input" ? Number(e.target.value) : e.target.value 
                    }))}
                    min={option.min}
                    max={option.max}
                    step={option.step}
                    className="h-10"
                  />
                )}

                {option.type === "color" && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={toolOptions[option.key] || option.defaultValue}
                      onChange={(e) => setToolOptions(prev => ({ ...prev, [option.key]: e.target.value }))}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <Input
                      value={toolOptions[option.key] || option.defaultValue}
                      onChange={(e) => setToolOptions(prev => ({ ...prev, [option.key]: e.target.value }))}
                      className="flex-1 h-10 font-mono"
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ))}
    </MobileOptionPanel>
  )

  // Show upload area if no files
  if (showUploadArea && files.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        
        {/* Rich content before upload */}
        {richContent && (
          <div className="bg-gray-50">
            {richContent}
          </div>
        )}
        
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

          {/* Ad before upload */}
          <div className="mb-6 lg:mb-8">
            <AdBanner 
              adSlot="tool-before-upload"
              adFormat="auto"
              className="max-w-3xl mx-auto"
              mobileOptimized={true}
            />
          </div>

          <div className="max-w-2xl mx-auto">
            <div 
              className={`border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-gray-500 cursor-pointer transition-all duration-300 p-8 lg:p-16 group ${
                isDragging 
                  ? "border-primary bg-primary/5 scale-105" 
                  : "border-gray-300 hover:border-primary hover:bg-primary/5"
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="relative mb-4 lg:mb-6">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:blur-2xl transition-all"></div>
                <Upload className="relative h-16 w-16 lg:h-20 lg:w-20 text-primary group-hover:text-primary/80 transition-colors group-hover:scale-110 transform duration-300" />
              </div>
              <h3 className="text-xl lg:text-2xl font-semibold mb-2 lg:mb-3 text-gray-700 group-hover:text-primary transition-colors">
                {isDragging ? "Drop files here" : `Drop ${toolType === 'qr' ? 'or create' : 'files'} here`}
              </h3>
              <p className="text-gray-500 mb-4 lg:mb-6 text-base lg:text-lg text-center">
                {isDragging ? "Release to upload" : "or tap to browse files"}
              </p>
              <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground px-6 lg:px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 group-hover:scale-105">
                <Upload className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
                Choose {toolType === 'qr' ? 'Files or Create' : 'Files'}
              </Button>
              <div className="mt-4 lg:mt-6 space-y-2 text-center">
                {supportedFormats.length > 0 && (
                  <p className="text-sm text-gray-500 font-medium">
                    {supportedFormats.map(format => format.split('/')[1]?.toUpperCase()).join(', ')} files
                  </p>
                )}
                <p className="text-xs text-gray-400">
                  {allowBatchProcessing ? `Up to ${maxFiles} files` : 'Single file'} • Up to 25MB each
                </p>
              </div>
            </div>
          </div>

          {/* Ad after upload */}
          <div className="mt-6 lg:mt-8">
            <AdBanner 
              adSlot="tool-after-upload"
              adFormat="auto"
              className="max-w-3xl mx-auto"
              mobileOptimized={true}
            />
          </div>
        </div>

        <Footer />

        <input
          ref={fileInputRef}
          type="file"
          accept={supportedFormats.join(",")}
          multiple={allowBatchProcessing}
          onChange={(e) => handleFileUpload(e.target.files)}
          className="hidden"
        />
      </div>
    )
  }

  // Main tool interface
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Mobile Layout */}
      <div className="lg:hidden">
        <div className="bg-white border-b px-4 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-2">
            <Icon className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={resetTool}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            {options.length > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsMobileSidebarOpen(true)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="p-4 min-h-[60vh]">
          {/* Custom children content (for QR tools) */}
          {children && (
            <div className="mb-6">
              {children}
            </div>
          )}

          {/* Mobile File Display */}
          {files.length > 0 && (
            <div className="space-y-4">
              {/* Single file preview for image cropper */}
              {title.toLowerCase().includes('crop') && toolType === 'image' && files[0] && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Crop Image</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div 
                      ref={canvasRef}
                      className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden border"
                    >
                      <img
                        src={files[0].processedPreview || files[0].preview}
                        alt="Image to crop"
                        className="w-full h-full object-contain"
                      />
                      
                      {/* Crop overlay */}
                      <div 
                        className="absolute border-2 border-primary bg-primary/10 cursor-move"
                        style={{
                          left: `${cropArea.x}%`,
                          top: `${cropArea.y}%`,
                          width: `${cropArea.width}%`,
                          height: `${cropArea.height}%`
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault()
                          setIsDragging(true)
                          setDragHandle('move')
                        }}
                      >
                        {/* Crop handles */}
                        <div 
                          className="absolute -top-2 -left-2 w-4 h-4 bg-primary border-2 border-white rounded-full cursor-nw-resize"
                          onMouseDown={(e) => {
                            e.stopPropagation()
                            setIsDragging(true)
                            setDragHandle('nw')
                          }}
                        />
                        <div 
                          className="absolute -top-2 -right-2 w-4 h-4 bg-primary border-2 border-white rounded-full cursor-ne-resize"
                          onMouseDown={(e) => {
                            e.stopPropagation()
                            setIsDragging(true)
                            setDragHandle('ne')
                          }}
                        />
                        <div 
                          className="absolute -bottom-2 -left-2 w-4 h-4 bg-primary border-2 border-white rounded-full cursor-sw-resize"
                          onMouseDown={(e) => {
                            e.stopPropagation()
                            setIsDragging(true)
                            setDragHandle('sw')
                          }}
                        />
                        <div 
                          className="absolute -bottom-2 -right-2 w-4 h-4 bg-primary border-2 border-white rounded-full cursor-se-resize"
                          onMouseDown={(e) => {
                            e.stopPropagation()
                            setIsDragging(true)
                            setDragHandle('se')
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Thumbnail grid for other tools */}
              {(!title.toLowerCase().includes('crop') || toolType !== 'image') && (
                <div className="grid grid-cols-2 gap-4">
                  {files.map((file) => (
                    <Card key={file.id} className="relative">
                      <CardContent className="p-3">
                        <div className="aspect-square bg-gray-100 rounded border mb-2 overflow-hidden">
                          {file.preview ? (
                            <img
                              src={file.processedPreview || file.preview}
                              alt={file.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FileText className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                          {file.processed && (
                            <div className="absolute top-2 right-2">
                              <CheckCircle className="h-5 w-5 text-green-600 bg-white rounded-full" />
                            </div>
                          )}
                        </div>
                        <p className="text-xs font-medium truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(file.id)}
                          className="absolute top-1 right-1 h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* PDF Page Selection */}
              {allowPageSelection && files[0]?.pageInfo && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Select Pages</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                      {files[0].pageInfo.pages.map((page: any) => (
                        <div
                          key={page.pageNumber}
                          className={`relative cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${
                            page.selected ? "border-primary ring-2 ring-primary/20" : "border-gray-200"
                          }`}
                          onClick={() => togglePageSelection(page.pageNumber)}
                        >
                          <img
                            src={page.thumbnail}
                            alt={`Page ${page.pageNumber}`}
                            className="w-full aspect-[3/4] object-cover"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 text-center">
                            {page.pageNumber}
                          </div>
                          {page.selected && (
                            <div className="absolute top-1 right-1">
                              <CheckCircle className="h-4 w-4 text-primary bg-white rounded-full" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Processing Progress */}
          {isProcessing && (
            <Card className="mt-4">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Processing...</span>
                    <span>{processingProgress}%</span>
                  </div>
                  <Progress value={processingProgress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Mobile Bottom Actions */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 space-y-3 z-30">
          <div className="grid grid-cols-2 gap-3">
            {options.length > 0 && (
              <Button 
                onClick={() => setIsMobileSidebarOpen(true)}
                variant="outline"
                className="py-3"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            )}
            
            <Button 
              onClick={processFiles}
              disabled={files.length === 0 || isProcessing}
              className="bg-primary hover:bg-primary/90 text-primary-foreground py-3"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Process
                </>
              )}
            </Button>
          </div>
          
          {files.some(f => f.processed) && (
            <Button 
              onClick={downloadAllFiles}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
            >
              <Download className="h-4 w-4 mr-2" />
              Download {files.filter(f => f.processed).length > 1 ? 'All' : 'Result'}
            </Button>
          )}
        </div>

        <MobileSidebar />
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex h-[calc(100vh-4rem)] w-full overflow-hidden">
        {/* Left Canvas */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-white border-b px-6 py-3 flex items-center justify-between shadow-sm flex-shrink-0">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Icon className="h-5 w-5 text-primary" />
                <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
              </div>
              <Badge variant="secondary">{toolType.toUpperCase()} Tool</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={resetTool}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              {files.length > 0 && toolType === 'image' && (
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

          {/* Canvas Content */}
          <div className="flex-1 overflow-hidden p-6">
            {/* Custom children content (for QR tools) */}
            {children && (
              <div className="h-full">
                {children}
              </div>
            )}

            {/* Image Cropper - Full Preview */}
            {!children && title.toLowerCase().includes('crop') && toolType === 'image' && files[0] && (
              <div className="h-full flex items-center justify-center">
                <div 
                  ref={canvasRef}
                  className="relative max-w-full max-h-full border border-gray-300 rounded-lg overflow-hidden bg-white shadow-lg"
                  style={{ 
                    transform: `scale(${zoomLevel / 100})`,
                    transition: "transform 0.2s ease"
                  }}
                >
                  <img
                    src={files[0].processedPreview || files[0].preview}
                    alt="Image to crop"
                    className="max-w-full max-h-[70vh] object-contain"
                  />
                  
                  {/* Crop overlay */}
                  <div 
                    className="absolute border-2 border-primary bg-primary/10 cursor-move transition-all"
                    style={{
                      left: `${cropArea.x}%`,
                      top: `${cropArea.y}%`,
                      width: `${cropArea.width}%`,
                      height: `${cropArea.height}%`
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      setIsDragging(true)
                      setDragHandle('move')
                    }}
                  >
                    {/* Crop handles */}
                    <div 
                      className="absolute -top-2 -left-2 w-4 h-4 bg-primary border-2 border-white rounded-full cursor-nw-resize hover:scale-125 transition-transform"
                      onMouseDown={(e) => {
                        e.stopPropagation()
                        setIsDragging(true)
                        setDragHandle('nw')
                      }}
                    />
                    <div 
                      className="absolute -top-2 -right-2 w-4 h-4 bg-primary border-2 border-white rounded-full cursor-ne-resize hover:scale-125 transition-transform"
                      onMouseDown={(e) => {
                        e.stopPropagation()
                        setIsDragging(true)
                        setDragHandle('ne')
                      }}
                    />
                    <div 
                      className="absolute -bottom-2 -left-2 w-4 h-4 bg-primary border-2 border-white rounded-full cursor-sw-resize hover:scale-125 transition-transform"
                      onMouseDown={(e) => {
                        e.stopPropagation()
                        setIsDragging(true)
                        setDragHandle('sw')
                      }}
                    />
                    <div 
                      className="absolute -bottom-2 -right-2 w-4 h-4 bg-primary border-2 border-white rounded-full cursor-se-resize hover:scale-125 transition-transform"
                      onMouseDown={(e) => {
                        e.stopPropagation()
                        setIsDragging(true)
                        setDragHandle('se')
                      }}
                    />
                    
                    {/* Crop info */}
                    <div className="absolute -top-8 left-0 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                      {Math.round(cropArea.width)}% × {Math.round(cropArea.height)}%
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Other tools - Thumbnail grid */}
            {!children && (!title.toLowerCase().includes('crop') || toolType !== 'image') && files.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {files.map((file) => (
                  <Card key={file.id} className="relative group hover:shadow-lg transition-all">
                    <CardContent className="p-4">
                      <div className="aspect-square bg-gray-100 rounded border mb-3 overflow-hidden relative">
                        {file.preview ? (
                          <img
                            src={file.processedPreview || file.preview}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FileText className="h-12 w-12 text-gray-400" />
                          </div>
                        )}
                        {file.processed && (
                          <div className="absolute top-2 right-2">
                            <CheckCircle className="h-5 w-5 text-green-600 bg-white rounded-full" />
                          </div>
                        )}
                      </div>
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      {file.dimensions && (
                        <p className="text-xs text-gray-500">{file.dimensions.width}×{file.dimensions.height}</p>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                        className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* PDF Page Selection */}
            {allowPageSelection && files[0]?.pageInfo && (
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {files[0].pageInfo.pages.map((page: any) => (
                  <div
                    key={page.pageNumber}
                    className={`relative cursor-pointer border-2 rounded-lg overflow-hidden transition-all hover:shadow-md ${
                      page.selected ? "border-primary ring-2 ring-primary/20" : "border-gray-200 hover:border-primary/50"
                    }`}
                    onClick={() => togglePageSelection(page.pageNumber)}
                  >
                    <img
                      src={page.thumbnail}
                      alt={`Page ${page.pageNumber}`}
                      className="w-full aspect-[3/4] object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 text-center">
                      Page {page.pageNumber}
                    </div>
                    {page.selected && (
                      <div className="absolute top-1 right-1">
                        <CheckCircle className="h-4 w-4 text-primary bg-white rounded-full" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Processing Progress */}
            {isProcessing && (
              <div className="absolute inset-0 bg-white/90 flex items-center justify-center">
                <Card className="w-80">
                  <CardContent className="pt-6">
                    <div className="text-center space-y-4">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                      <div>
                        <h3 className="font-medium">Processing Files</h3>
                        <p className="text-sm text-gray-500">Please wait while we process your files...</p>
                      </div>
                      <Progress value={processingProgress} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Right Sidebar */}
        {showSidebar && (
          <div className="w-80 xl:w-96 bg-white border-l shadow-lg flex flex-col h-full">
            <div className="px-6 py-4 border-b bg-gray-50 flex-shrink-0">
              <div className="flex items-center space-x-2">
                <Icon className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-gray-900">{title} Settings</h2>
              </div>
              <p className="text-sm text-gray-600 mt-1">Configure processing options</p>
            </div>

            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-6 space-y-6">
                  {Object.entries(groupedOptions).map(([section, sectionOptions]) => (
                    <div key={section} className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <div className="h-px bg-gray-200 flex-1"></div>
                        <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{section}</Label>
                        <div className="h-px bg-gray-200 flex-1"></div>
                      </div>
                      
                      {sectionOptions.map((option) => {
                        if (option.condition && !option.condition(toolOptions)) return null
                        
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

                            {(option.type === "input" || option.type === "text") && (
                              <Input
                                type={option.type === "input" ? "number" : "text"}
                                value={toolOptions[option.key] || ""}
                                onChange={(e) => setToolOptions(prev => ({ 
                                  ...prev, 
                                  [option.key]: option.type === "input" ? Number(e.target.value) : e.target.value 
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
                                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                                />
                                <Input
                                  value={toolOptions[option.key] || option.defaultValue}
                                  onChange={(e) => setToolOptions(prev => ({ ...prev, [option.key]: e.target.value }))}
                                  className="flex-1 font-mono"
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
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-primary mb-3">File Information</h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span>Files:</span>
                          <span className="font-medium">{files.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Size:</span>
                          <span className="font-medium">{formatFileSize(files.reduce((sum, f) => sum + f.size, 0))}</span>
                        </div>
                        {files[0]?.dimensions && (
                          <div className="flex justify-between">
                            <span>Dimensions:</span>
                            <span className="font-medium">{files[0].dimensions.width}×{files[0].dimensions.height}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Processed:</span>
                          <span className="font-medium">{files.filter(f => f.processed).length}/{files.length}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Desktop Footer */}
            <div className="p-6 border-t bg-gray-50 space-y-3 flex-shrink-0">
              <Button 
                onClick={processFiles}
                disabled={files.length === 0 || isProcessing}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-base font-semibold"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Process {files.length > 1 ? `${files.length} Files` : 'File'}
                  </>
                )}
              </Button>

              {files.some(f => f.processed) && (
                <Button 
                  onClick={downloadAllFiles}
                  variant="outline"
                  className="w-full py-3 text-base font-semibold"
                  size="lg"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download {files.filter(f => f.processed).length > 1 ? 'All' : 'Result'}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={supportedFormats.join(",")}
        multiple={allowBatchProcessing}
        onChange={(e) => handleFileUpload(e.target.files)}
        className="hidden"
      />
    </div>
  )
}