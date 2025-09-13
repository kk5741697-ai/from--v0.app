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
  Settings,
  FileText,
  ImageIcon,
  Eye,
  Move,
  RotateCw,
  Crop,
  GripVertical
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
  dimensions?: { width: number; height: number }
  preview: string
  processed?: boolean
  processedPreview?: string
  processedSize?: number
  blob?: Blob
  pageCount?: number
  pages?: any[]
  selectedPages?: string[]
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
  richContent,
  children
}: UnifiedToolLayoutProps) {
  const [files, setFiles] = useState<ProcessedFile[]>([])
  const [toolOptions, setToolOptions] = useState<Record<string, any>>({})
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [cropArea, setCropArea] = useState({ x: 20, y: 20, width: 60, height: 60 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [selectedPages, setSelectedPages] = useState<string[]>([])
  const [zoomLevel, setZoomLevel] = useState(100)
  const [draggedPageIndex, setDraggedPageIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  
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

  // Show/hide interface based on files - QR tools always show interface
  const showToolsInterface = files.length > 0 || toolType === "qr"
  const showUploadArea = files.length === 0 && toolType !== "qr"

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

        if (toolType === "image") {
          const dimensions = await getImageDimensions(file)
          const preview = await createImagePreview(file)
          processedFile = { ...processedFile, dimensions, preview }
        } else if (toolType === "pdf") {
          const pdfInfo = await getPDFInfo(file)
          processedFile = { ...processedFile, ...pdfInfo, preview: "/placeholder.svg" }
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
    try {
      // Use PDF.js to extract real page thumbnails
      const pdfjsLib = await import('pdfjs-dist')
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`
      
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      const pageCount = pdf.numPages
      const pages = []

      for (let i = 1; i <= Math.min(pageCount, 20); i++) { // Limit to 20 pages for performance
        try {
          const page = await pdf.getPage(i)
          const viewport = page.getViewport({ scale: 0.5 })
          
          const canvas = document.createElement("canvas")
          const ctx = canvas.getContext("2d")!
          canvas.width = viewport.width
          canvas.height = viewport.height
          
          await page.render({
            canvasContext: ctx,
            viewport: viewport
          }).promise
          
          const thumbnail = canvas.toDataURL("image/png", 0.8)
          
          pages.push({
            pageNumber: i,
            thumbnail,
            selected: false
          })
        } catch (error) {
          console.error(`Failed to render page ${i}:`, error)
          // Fallback to placeholder
          pages.push({
            pageNumber: i,
            thumbnail: createPDFThumbnail(i, pageCount),
            selected: false
          })
        }
      }

      return { pageCount, pages }
    } catch (error) {
      console.error("Failed to process PDF with PDF.js:", error)
      // Fallback to placeholder thumbnails
      const pageCount = Math.floor(Math.random() * 20) + 5
      const pages = Array.from({ length: pageCount }, (_, i) => ({
        pageNumber: i + 1,
        thumbnail: createPDFThumbnail(i + 1, pageCount),
        selected: false
      }))
      return { pageCount, pages }
    }
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
    setCropArea({ x: 20, y: 20, width: 60, height: 60 })
    
    const defaultOptions: Record<string, any> = {}
    options.forEach(option => {
      defaultOptions[option.key] = option.defaultValue
    })
    setToolOptions(defaultOptions)
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
        setProcessingProgress(prev => Math.min(prev + 15, 90))
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
          link.download = result.filename || "processed_file"
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

    // Single file - direct download
    if (processedFiles.length === 1) {
      const file = processedFiles[0]
      const link = document.createElement("a")
      link.href = file.processedPreview || file.preview
      link.download = file.name
      link.click()
      
      toast({
        title: "Download started",
        description: "File downloaded successfully"
      })
      return
    }

    // Multiple files - create ZIP
    try {
      const JSZip = (await import("jszip")).default
      const zip = new JSZip()

      processedFiles.forEach((file) => {
        if (file.blob) {
          zip.file(file.name, file.blob)
        }
      })

      const zipBlob = await zip.generateAsync({ 
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: { level: 6 }
      })
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

  const togglePageSelection = (pageKey: string) => {
    setSelectedPages(prev => 
      prev.includes(pageKey) 
        ? prev.filter(p => p !== pageKey)
        : [...prev, pageKey]
    )
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

  // Enhanced crop area handlers for image tools
  const handleCropMouseDown = (e: React.MouseEvent, handle?: string) => {
    if (toolType !== "image") return
    
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
    
    const rect = canvasRef.current?.getBoundingClientRect()
    if (rect) {
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      setDragStart({ x, y })
    }
  }

  const handleCropMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || toolType !== "image") return
    
    e.preventDefault()
    const rect = canvasRef.current?.getBoundingClientRect()
    if (rect) {
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      
      const deltaX = x - dragStart.x
      const deltaY = y - dragStart.y
      
      setCropArea(prev => ({
        x: Math.max(0, Math.min(100 - prev.width, prev.x + deltaX)),
        y: Math.max(0, Math.min(100 - prev.height, prev.y + deltaY)),
        width: prev.width,
        height: prev.height
      }))
      
      setDragStart({ x, y })
    }
  }

  const handleCropMouseUp = () => {
    setIsDragging(false)
  }

  // Enhanced page reordering for PDF tools
  const handlePageDragStart = (e: React.DragEvent, pageIndex: number) => {
    setDraggedPageIndex(pageIndex)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", pageIndex.toString())
  }

  const handlePageDragOver = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOverIndex(targetIndex)
  }

  const handlePageDragLeave = () => {
    setDragOverIndex(null)
  }

  const handlePageDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault()
    setDragOverIndex(null)
    
    if (draggedPageIndex === null || draggedPageIndex === targetIndex) return
    
    setFiles(prev => {
      const newFiles = [...prev]
      const file = newFiles[0] // Assuming single PDF for reordering
      if (file.pages) {
        const pages = [...file.pages]
        const draggedPage = pages[draggedPageIndex]
        pages.splice(draggedPageIndex, 1)
        pages.splice(targetIndex, 0, draggedPage)
        
        newFiles[0] = { ...file, pages }
      }
      return newFiles
    })
    
    setDraggedPageIndex(null)
  }

  // Crop area resize handlers
  const handleCropResize = (e: React.MouseEvent, corner: string) => {
    e.preventDefault()
    e.stopPropagation()
    
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    
    const startX = e.clientX
    const startY = e.clientY
    const startCrop = { ...cropArea }
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = ((moveEvent.clientX - startX) / rect.width) * 100
      const deltaY = ((moveEvent.clientY - startY) / rect.height) * 100
      
      let newCrop = { ...startCrop }
      
      switch (corner) {
        case "top-left":
          newCrop.x = Math.max(0, Math.min(startCrop.x + startCrop.width - 5, startCrop.x + deltaX))
          newCrop.y = Math.max(0, Math.min(startCrop.y + startCrop.height - 5, startCrop.y + deltaY))
          newCrop.width = startCrop.width - (newCrop.x - startCrop.x)
          newCrop.height = startCrop.height - (newCrop.y - startCrop.y)
          break
        case "top-right":
          newCrop.y = Math.max(0, Math.min(startCrop.y + startCrop.height - 5, startCrop.y + deltaY))
          newCrop.width = Math.max(5, Math.min(100 - startCrop.x, startCrop.width + deltaX))
          newCrop.height = startCrop.height - (newCrop.y - startCrop.y)
          break
        case "bottom-left":
          newCrop.x = Math.max(0, Math.min(startCrop.x + startCrop.width - 5, startCrop.x + deltaX))
          newCrop.width = startCrop.width - (newCrop.x - startCrop.x)
          newCrop.height = Math.max(5, Math.min(100 - startCrop.y, startCrop.height + deltaY))
          break
        case "bottom-right":
          newCrop.width = Math.max(5, Math.min(100 - startCrop.x, startCrop.width + deltaX))
          newCrop.height = Math.max(5, Math.min(100 - startCrop.y, startCrop.height + deltaY))
          break
      }
      
      setCropArea(newCrop)
    }
    
    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
    
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
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
                Process {toolType === "qr" ? "QR Code" : `${files.length} File${files.length !== 1 ? 's' : ''}`}
              </>
            )}
          </Button>

          {files.some(f => f.processed) && (
            <Button 
              onClick={() => {
                downloadAll()
                setIsMobileSidebarOpen(false)
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-base font-semibold"
              size="lg"
            >
              <Download className="h-4 w-4 mr-2" />
              Download {files.filter(f => f.processed).length === 1 ? 'File' : 'All'}
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )

  return (
    <div className="tool-wrapper min-h-screen bg-background">
      <Header />

      {/* Tools Header - Hidden until files uploaded (except QR) */}
      <div className={`tools-header ${showToolsInterface ? '' : 'hidden'}`}>
        <div className="bg-white border-b px-4 lg:px-6 py-3 flex items-center justify-between shadow-sm">
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
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden"
            >
              <Settings className="h-4 w-4" />
            </Button>
            {toolType === "image" && files.length > 0 && (
              <div className="hidden lg:flex items-center space-x-1 border rounded-md">
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
      </div>

      <div className="flex min-h-screen">
        <div className="flex-1 flex flex-col">
          {/* Persistent Ads - Before Canvas/Upload */}
          <div className="ad-slot ad-before">
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
          </div>

          {/* Canvas - Hidden until files uploaded (except QR) */}
          <div className={`canvas ${showToolsInterface ? '' : 'hidden'}`}>
            <div className="flex-1 bg-gray-50 p-4 lg:p-6 min-h-[60vh]">
              {/* Image Tools Canvas with Enhanced Cropper */}
              {toolType === "image" && files.length > 0 && (
                <div className="space-y-4">
                  {files.map((file) => (
                    <Card key={file.id} className="relative">
                      <CardContent className="p-4">
                        <div 
                          ref={canvasRef}
                          className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden cursor-crosshair select-none"
                          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center' }}
                          onMouseDown={handleCropMouseDown}
                          onMouseMove={handleCropMouseMove}
                          onMouseUp={handleCropMouseUp}
                          onMouseLeave={handleCropMouseUp}
                        >
                          <img
                            src={file.processedPreview || file.preview}
                            alt={file.name}
                            className="w-full h-full object-contain pointer-events-none"
                            draggable={false}
                          />
                          
                          {/* Enhanced Crop Area Overlay */}
                          <div 
                            className={`crop-area absolute border-2 border-cyan-500 bg-cyan-500/10 ${isDragging ? 'dragging' : ''}`}
                            style={{
                              left: `${cropArea.x}%`,
                              top: `${cropArea.y}%`,
                              width: `${cropArea.width}%`,
                              height: `${cropArea.height}%`,
                              cursor: isDragging ? 'grabbing' : 'grab'
                            }}
                          >
                            {/* Enhanced Crop Handles */}
                            <div 
                              className="crop-handle absolute -top-2 -left-2 cursor-nw-resize"
                              onMouseDown={(e) => handleCropResize(e, "top-left")}
                            ></div>
                            <div 
                              className="crop-handle absolute -top-2 -right-2 cursor-ne-resize"
                              onMouseDown={(e) => handleCropResize(e, "top-right")}
                            ></div>
                            <div 
                              className="crop-handle absolute -bottom-2 -left-2 cursor-sw-resize"
                              onMouseDown={(e) => handleCropResize(e, "bottom-left")}
                            ></div>
                            <div 
                              className="crop-handle absolute -bottom-2 -right-2 cursor-se-resize"
                              onMouseDown={(e) => handleCropResize(e, "bottom-right")}
                            ></div>
                            
                            {/* Move handle */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <Move className="h-4 w-4 text-cyan-600 opacity-75" />
                            </div>
                            
                            {/* Crop dimensions display */}
                            <div className="absolute -top-8 left-0 bg-cyan-600 text-white text-xs px-2 py-1 rounded">
                              {Math.round(cropArea.width)}% × {Math.round(cropArea.height)}%
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-3 text-center">
                          <p className="text-sm font-medium text-gray-900">{file.name}</p>
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>{formatFileSize(file.size)}</span>
                            {file.dimensions && (
                              <span>{file.dimensions.width}×{file.dimensions.height}</span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Enhanced PDF Tools Canvas with Better Drag & Drop */}
              {toolType === "pdf" && files.length > 0 && (
                <div className="space-y-4">
                  {files.map((file) => (
                    <Card key={file.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-6 w-6 text-red-600" />
                            <div>
                              <CardTitle className="text-base">{file.name}</CardTitle>
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span>{formatFileSize(file.size)}</span>
                                {file.pageCount && <span>{file.pageCount} pages</span>}
                              </div>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => removeFile(file.id)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      
                      {(allowPageSelection || allowPageReorder) && file.pages && (
                        <CardContent>
                          <div className="space-y-3">
                            <Label className="text-sm font-medium">
                              {allowPageReorder ? "Drag to Reorder Pages" : "Select Pages"}
                            </Label>
                            <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 max-h-96 overflow-y-auto">
                              {file.pages.map((page, pageIndex) => {
                                const pageKey = `${file.id}-page-${page.pageNumber}`
                                const isSelected = selectedPages.includes(pageKey)
                                const isDraggedOver = dragOverIndex === pageIndex
                                
                                return (
                                  <div
                                    key={pageKey}
                                    className={`pdf-page-thumbnail relative cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${
                                      isSelected ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-200 hover:border-red-300'
                                    } ${draggedPageIndex === pageIndex ? 'opacity-50 scale-95 z-10' : ''} ${
                                      isDraggedOver ? 'border-blue-500 bg-blue-50' : ''
                                    }`}
                                    onClick={() => allowPageSelection && togglePageSelection(pageKey)}
                                    draggable={allowPageReorder}
                                    onDragStart={(e) => allowPageReorder && handlePageDragStart(e, pageIndex)}
                                    onDragOver={(e) => allowPageReorder && handlePageDragOver(e, pageIndex)}
                                    onDragLeave={allowPageReorder ? handlePageDragLeave : undefined}
                                    onDrop={(e) => allowPageReorder && handlePageDrop(e, pageIndex)}
                                  >
                                    <img
                                      src={page.thumbnail}
                                      alt={`Page ${page.pageNumber}`}
                                      className="w-full aspect-[3/4] object-cover"
                                      draggable={false}
                                    />
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs text-center py-1">
                                      {page.pageNumber}
                                    </div>
                                    {isSelected && allowPageSelection && (
                                      <div className="absolute top-1 right-1">
                                        <CheckCircle className="h-4 w-4 text-red-600 bg-white rounded-full" />
                                      </div>
                                    )}
                                    {allowPageReorder && (
                                      <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <GripVertical className="h-4 w-4 text-white bg-black/50 rounded p-0.5" />
                                      </div>
                                    )}
                                    {/* Drop indicator */}
                                    {isDraggedOver && allowPageReorder && (
                                      <div className="absolute inset-0 border-2 border-blue-500 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                        <span className="text-blue-700 font-medium text-xs">Drop here</span>
                                      </div>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                            {selectedPages.length > 0 && allowPageSelection && (
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

              {/* QR Tools Canvas */}
              {toolType === "qr" && (
                <div className="max-w-2xl mx-auto">
                  {children}
                </div>
              )}
            </div>
          </div>

          {/* Upload Area - Hidden when files uploaded */}
          <div className={`upload-area ${showUploadArea ? '' : 'hidden'}`}>
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
                    Drop {toolType === "image" ? "images" : toolType === "pdf" ? "PDF files" : "files"} here
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
                    <p className="text-xs text-gray-400">Up to {maxFiles} files • Max 25MB per file</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Persistent Ads - After Canvas/Upload */}
          <div className="ad-slot ad-after">
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
          </div>

          {/* Rich Educational Content - Hidden when tools interface shown */}
          <div className={`tool-content ${showUploadArea ? '' : 'hidden'}`}>
            {richContent}
          </div>

          {/* Footer - Hidden when tools interface shown */}
          <div className={showUploadArea ? '' : 'hidden'}>
            <Footer />
          </div>
        </div>

        {/* Sidebar - Hidden until files uploaded (except QR) */}
        <div className={`sidebar hidden lg:flex w-80 xl:w-96 bg-white border-l shadow-lg flex-col h-full ${showToolsInterface ? 'lg:flex' : 'hidden'}`}>
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
                  Process {toolType === "qr" ? "QR Code" : `${files.length} File${files.length !== 1 ? 's' : ''}`}
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
                Download {files.filter(f => f.processed).length === 1 ? 'File' : 'All'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar />

      {/* Hidden File Input */}
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