"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { 
  Upload, 
  Download, 
  CheckCircle,
  X,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Settings
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { AdBanner } from "@/components/ads/ad-banner"
import { PDFThumbnailExtractor } from "@/components/pdf-thumbnail-extractor"

interface ToolFile {
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
  pages?: any[]
  selectedPages?: number[]
}

interface UnifiedToolLayoutProps {
  title: string
  description: string
  icon: any
  toolType: "image" | "pdf" | "qr" | "text" | "seo" | "network" | "utilities"
  processFunction: (files: any[], options: any) => Promise<{ success: boolean; processedFiles?: any[]; downloadUrl?: string; filename?: string; qrDataURL?: string; error?: string }>
  options?: any[]
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
  supportedFormats = ["image/*"],
  outputFormats = ["png", "jpg"],
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
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Initialize options with defaults
  useEffect(() => {
    const defaultOptions: Record<string, any> = {}
    options.forEach(option => {
      defaultOptions[option.key] = option.defaultValue
    })
    setToolOptions(defaultOptions)
  }, [options])

  const getToolColor = () => {
    switch (toolType) {
      case "image": return "text-purple-600"
      case "pdf": return "text-red-600"
      case "qr": return "text-green-600"
      case "text": return "text-yellow-600"
      case "seo": return "text-cyan-600"
      case "network": return "text-blue-600"
      case "utilities": return "text-indigo-600"
      default: return "text-gray-600"
    }
  }

  const getToolBgColor = () => {
    switch (toolType) {
      case "image": return "from-purple-600 to-purple-700"
      case "pdf": return "from-red-600 to-red-700"
      case "qr": return "from-green-600 to-green-700"
      case "text": return "from-yellow-600 to-yellow-700"
      case "seo": return "from-cyan-600 to-cyan-700"
      case "network": return "from-blue-600 to-blue-700"
      case "utilities": return "from-indigo-600 to-indigo-700"
      default: return "from-gray-600 to-gray-700"
    }
  }

  const handleFileUpload = async (uploadedFiles: FileList | null) => {
    if (!uploadedFiles || uploadedFiles.length === 0) return

    const newFiles: ToolFile[] = []

    for (const file of Array.from(uploadedFiles)) {
      // Validate file type
      const isValidType = supportedFormats.some(format => {
        if (format.includes('/*')) {
          return file.type.startsWith(format.replace('/*', ''))
        }
        return file.type === format
      })

      if (!isValidType) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported file type`,
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
        const preview = await createFilePreview(file)
        const dimensions = file.type.startsWith('image/') ? await getImageDimensions(file) : undefined
        
        const toolFile: ToolFile = {
          id: `${file.name}-${Date.now()}`,
          file,
          originalFile: file,
          name: file.name,
          size: file.size,
          dimensions,
          preview,
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

    if (newFiles.length > 0) {
      setFiles(prev => [...prev, ...newFiles])
      setShowUploadArea(false)
      toast({
        title: "Files uploaded",
        description: `${newFiles.length} file(s) loaded successfully`
      })
    }
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

  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        resolve({ width: 0, height: 0 })
        return
      }
      
      const img = new Image()
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight })
      img.onerror = reject
      img.src = URL.createObjectURL(file)
    })
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
    if (files.length === 1) {
      setShowUploadArea(true)
    }
  }

  const resetTool = () => {
    setFiles([])
    setProcessingProgress(0)
    setShowUploadArea(true)
    setIsMobileSidebarOpen(false)
  }

  const processFiles = async () => {
    if (files.length === 0 && toolType !== "qr") return

    setIsProcessing(true)
    setProcessingProgress(0)

    try {
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const result = await processFunction(files, toolOptions)

      clearInterval(progressInterval)
      setProcessingProgress(100)

      if (result.success) {
        if (result.processedFiles) {
          setFiles(result.processedFiles)
          toast({
            title: "Processing complete",
            description: `${result.processedFiles.length} file(s) processed successfully`
          })
        } else if (result.downloadUrl && result.filename) {
          const link = document.createElement("a")
          link.href = result.downloadUrl
          link.download = result.filename
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          
          toast({
            title: "Processing complete",
            description: "Your file has been processed and downloaded"
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
      setProcessingProgress(0)
    }
  }

  const downloadFile = (file: ToolFile) => {
    if (!file.blob) return

    const link = document.createElement("a")
    link.href = file.processedPreview || file.preview
    link.download = file.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast({
      title: "Download started",
      description: "File downloaded successfully"
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
  }

  // Show upload area if no files and not QR tool
  if (showUploadArea && files.length === 0 && toolType !== "qr") {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        
        {/* Unified Before Canvas Ad */}
        <div className="unified-before-canvas bg-white border-b">
          <div className="container mx-auto px-4 py-3">
            <AdBanner 
              adSlot="unified-before-canvas"
              adFormat="auto"
              className="max-w-4xl mx-auto"
              mobileOptimized={true}
              persistent={true}
            />
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-6 lg:py-8">
          <div className="text-center mb-6 lg:mb-8">
            <div className="inline-flex items-center space-x-2 mb-4">
              <Icon className={`h-6 w-6 lg:h-8 lg:w-8 ${getToolColor()}`} />
              <h1 className="text-2xl lg:text-3xl font-heading font-bold text-foreground">{title}</h1>
            </div>
            <p className="text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              {description}
            </p>
          </div>

          {/* Rich Content Before Upload */}
          <div className="max-w-4xl mx-auto mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Icon className={`h-5 w-5 ${getToolColor()}`} />
                  <span>Professional {toolType.charAt(0).toUpperCase() + toolType.slice(1)} Processing</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4">
                    <div className={`w-12 h-12 bg-${toolType === 'image' ? 'purple' : toolType === 'pdf' ? 'red' : 'green'}-100 rounded-lg flex items-center justify-center mx-auto mb-3`}>
                      <Icon className={`h-6 w-6 ${getToolColor()}`} />
                    </div>
                    <h3 className="font-semibold mb-2">Advanced Processing</h3>
                    <p className="text-sm text-muted-foreground">State-of-the-art algorithms for professional results</p>
                  </div>
                  <div className="text-center p-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold mb-2">100% Secure</h3>
                    <p className="text-sm text-muted-foreground">All processing happens locally in your browser</p>
                  </div>
                  <div className="text-center p-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Download className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Instant Results</h3>
                    <p className="text-sm text-muted-foreground">No waiting, no uploads - process files immediately</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="max-w-2xl mx-auto">
            <div 
              className={`border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:border-${toolType === 'image' ? 'purple' : toolType === 'pdf' ? 'red' : 'green'}-400 hover:bg-${toolType === 'image' ? 'purple' : toolType === 'pdf' ? 'red' : 'green'}-50/30 transition-all duration-300 p-8 lg:p-16 group`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="relative mb-4 lg:mb-6">
                <div className={`absolute inset-0 bg-${toolType === 'image' ? 'purple' : toolType === 'pdf' ? 'red' : 'green'}-500/20 rounded-full blur-xl group-hover:blur-2xl transition-all`}></div>
                <Upload className={`relative h-16 w-16 lg:h-20 lg:w-20 text-${toolType === 'image' ? 'purple' : toolType === 'pdf' ? 'red' : 'green'}-500 group-hover:text-${toolType === 'image' ? 'purple' : toolType === 'pdf' ? 'red' : 'green'}-600 transition-colors group-hover:scale-110 transform duration-300`} />
              </div>
              <h3 className={`text-xl lg:text-2xl font-semibold mb-2 lg:mb-3 text-gray-700 group-hover:text-${toolType === 'image' ? 'purple' : toolType === 'pdf' ? 'red' : 'green'}-600 transition-colors`}>
                Drop {toolType} files here
              </h3>
              <p className="text-gray-500 mb-4 lg:mb-6 text-base lg:text-lg text-center">or tap to browse files</p>
              <Button className={`bg-gradient-to-r ${getToolBgColor()} hover:from-${toolType === 'image' ? 'purple' : toolType === 'pdf' ? 'red' : 'green'}-700 hover:to-${toolType === 'image' ? 'purple' : toolType === 'pdf' ? 'red' : 'green'}-800 text-white px-6 lg:px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 group-hover:scale-105`}>
                <Upload className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
                Choose Files
              </Button>
              <div className="mt-4 lg:mt-6 space-y-2 text-center">
                <p className="text-sm text-gray-500 font-medium">{supportedFormats.join(", ")}</p>
                <p className="text-xs text-gray-400">Up to {maxFiles} files • Unlimited size</p>
              </div>
            </div>
          </div>

          {/* Rich Content After Upload */}
          <div className="max-w-4xl mx-auto mt-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Why Choose Our {toolType.charAt(0).toUpperCase() + toolType.slice(1)} Tools?</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Enterprise-Grade Security</p>
                        <p className="text-sm text-muted-foreground">Local processing ensures your files never leave your device</p>
                      </div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Professional Quality</p>
                        <p className="text-sm text-muted-foreground">Maintain file integrity and quality</p>
                      </div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium">No File Size Limits</p>
                        <p className="text-sm text-muted-foreground">Process files of any size with advanced algorithms</p>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Common Use Cases</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>• Professional document management</li>
                    <li>• Business workflow optimization</li>
                    <li>• Creative project enhancement</li>
                    <li>• Educational material preparation</li>
                    <li>• Marketing content creation</li>
                    <li>• Archive and storage optimization</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Unified After Canvas Ad */}
        <div className="unified-after-canvas bg-white border-t">
          <div className="container mx-auto px-4 py-3">
            <AdBanner 
              adSlot="unified-after-canvas"
              adFormat="auto"
              className="max-w-4xl mx-auto"
              mobileOptimized={true}
              persistent={true}
            />
          </div>
        </div>

        {/* Rich Educational Content */}
        {richContent && (
          <div className="bg-gray-50">
            {richContent}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={supportedFormats.join(",")}
          multiple={maxFiles > 1}
          onChange={(e) => handleFileUpload(e.target.files)}
          className="hidden"
        />
      </div>
    )
  }

  // Tool interface when files are loaded or for QR tools
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Custom content for QR tools */}
      {children && toolType === "qr"}

      {/* Standard tool interface for other types */}
      {!children && (
        <>
          {/* Mobile Layout */}
          <div className="lg:hidden">
            <div className="tools-header bg-white border-b px-4 py-3 flex items-center justify-between shadow-sm">
              <div className="flex items-center space-x-2">
                <Icon className={`h-5 w-5 ${getToolColor()}`} />
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

            {/* Unified Before Canvas Ad */}
            <div className="unified-before-canvas bg-white border-b">
              <div className="container mx-auto px-4 py-3">
                <AdBanner 
                  adSlot="unified-before-canvas"
                  adFormat="auto"
                  className="max-w-4xl mx-auto"
                  mobileOptimized={true}
                  persistent={true}
                />
              </div>
            </div>

            <div className="canvas p-4 min-h-[60vh]">
              {/* File Grid for Mobile */}
              {toolType === "image" && !allowBatchProcessing ? (
                // Single image full preview
                files.length > 0 && (
                  <Card>
                    <CardContent className="p-4">
                      <img
                        src={files[0].processedPreview || files[0].preview}
                        alt={files[0].name}
                        className="w-full h-auto object-contain border rounded"
                      />
                    </CardContent>
                  </Card>
                )
              ) : (
                // Thumbnail grid for batch processing
                <div className="grid grid-cols-2 gap-4">
                  {files.map((file) => (
                    <Card key={file.id} className="tool-file-thumbnail">
                      <CardContent className="p-3">
                        {file.preview ? (
                          <img
                            src={file.processedPreview || file.preview}
                            alt={file.name}
                            className="w-full aspect-square object-cover rounded"
                          />
                        ) : (
                          <div className="w-full aspect-square bg-gray-100 rounded flex items-center justify-center">
                            <Icon className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                        <p className="text-xs font-medium mt-2 truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                        {file.processed && (
                          <CheckCircle className="absolute top-2 right-2 h-4 w-4 text-green-600" />
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Process Button */}
              <div className="mt-6">
                <Button 
                  onClick={processFiles}
                  disabled={isProcessing || (files.length === 0 && toolType !== "qr")}
                  className={`w-full bg-gradient-to-r ${getToolBgColor()} text-white py-3`}
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
                      Process {files.length > 1 ? `${files.length} Files` : 'File'}
                    </>
                  )}
                </Button>
                
                {isProcessing && (
                  <div className="mt-4">
                    <Progress value={processingProgress} className="h-2" />
                    <p className="text-sm text-muted-foreground text-center mt-2">
                      {processingProgress}% complete
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Unified After Canvas Ad */}
            <div className="unified-after-canvas bg-white border-t">
              <div className="container mx-auto px-4 py-3">
                <AdBanner 
                  adSlot="unified-after-canvas"
                  adFormat="auto"
                  className="max-w-4xl mx-auto"
                  mobileOptimized={true}
                  persistent={true}
                />
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:flex h-[calc(100vh-4rem)] w-full overflow-hidden">
            {/* Left Canvas */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="tools-header bg-white border-b px-6 py-3 flex items-center justify-between shadow-sm flex-shrink-0">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Icon className={`h-5 w-5 ${getToolColor()}`} />
                    <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
                  </div>
                  <Badge variant="secondary">{toolType.charAt(0).toUpperCase() + toolType.slice(1)} Mode</Badge>
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

              {/* Unified Before Canvas Ad */}
              <div className="unified-before-canvas bg-white border-b">
                <div className="container mx-auto px-4 py-3">
                  <AdBanner 
                    adSlot="unified-before-canvas"
                    adFormat="auto"
                    className="max-w-4xl mx-auto"
                    mobileOptimized={true}
                    persistent={true}
                  />
                </div>
              </div>

              {/* Canvas Content */}
              <div className="canvas flex-1 overflow-auto p-6">
                {toolType === "image" && !allowBatchProcessing ? (
                  // Single image full preview
                  files.length > 0 && (
                    <div className="flex justify-center">
                      <img
                        src={files[0].processedPreview || files[0].preview}
                        alt={files[0].name}
                        className="max-w-full max-h-full object-contain border rounded-lg shadow-lg"
                        style={{ 
                          transform: `scale(${zoomLevel / 100})`,
                          transition: "transform 0.2s ease"
                        }}
                      />
                    </div>
                  )
                ) : toolType === "pdf" ? (
                  // PDF page thumbnails
                  <div className="space-y-4">
                    {files.map((file) => (
                      <Card key={file.id} className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-medium">{file.name}</h3>
                            <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => removeFile(file.id)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <PDFThumbnailExtractor
                          file={file.file}
                          onPagesExtracted={(pages) => {
                            setFiles(prev => prev.map(f => 
                              f.id === file.id ? { ...f, pages } : f
                            ))
                          }}
                        />
                      </Card>
                    ))}
                  </div>
                ) : (
                  // Thumbnail grid for other types
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {files.map((file) => (
                      <Card key={file.id} className="tool-file-thumbnail">
                        <CardContent className="p-3">
                          {file.preview ? (
                            <img
                              src={file.processedPreview || file.preview}
                              alt={file.name}
                              className="w-full aspect-square object-cover rounded"
                            />
                          ) : (
                            <div className="w-full aspect-square bg-gray-100 rounded flex items-center justify-center">
                              <Icon className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                          <p className="text-xs font-medium mt-2 truncate">{file.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                          {file.processed && (
                            <CheckCircle className="absolute top-2 right-2 h-4 w-4 text-green-600" />
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Unified After Canvas Ad */}
              <div className="unified-after-canvas bg-white border-t">
                <div className="container mx-auto px-4 py-3">
                  <AdBanner 
                    adSlot="unified-after-canvas"
                    adFormat="auto"
                    className="max-w-4xl mx-auto"
                    mobileOptimized={true}
                    persistent={true}
                  />
                </div>
              </div>
            </div>

            {/* Desktop Right Sidebar */}
            <div className="sidebar w-80 xl:w-96 bg-white border-l shadow-lg flex flex-col h-full fixed top-0 bottom-0 right-0">
              <div className="px-6 py-4 border-b bg-gray-50 flex-shrink-0">
                <div className="flex items-center space-x-2">
                  <Icon className={`h-5 w-5 ${getToolColor()}`} />
                  <h2 className="text-lg font-semibold text-gray-900">{toolType.charAt(0).toUpperCase() + toolType.slice(1)} Settings</h2>
                </div>
                <p className="text-sm text-gray-600 mt-1">Configure processing options</p>
              </div>

              <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="p-6 space-y-6">
                    {options.map((option) => (
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
                              {option.selectOptions?.map((opt: any) => (
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
                            <div className="text-xs text-gray-500 text-center">
                              {toolOptions[option.key] || option.defaultValue}
                            </div>
                          </div>
                        )}

                        {option.type === "input" && (
                          <Input
                            type="number"
                            value={toolOptions[option.key] || option.defaultValue}
                            onChange={(e) => setToolOptions(prev => ({ ...prev, [option.key]: parseInt(e.target.value) }))}
                            min={option.min}
                            max={option.max}
                          />
                        )}

                        {option.type === "color" && (
                          <Input
                            type="color"
                            value={toolOptions[option.key] || option.defaultValue}
                            onChange={(e) => setToolOptions(prev => ({ ...prev, [option.key]: e.target.value }))}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <div className="p-6 border-t bg-gray-50 space-y-3 flex-shrink-0">
                <Button 
                  onClick={processFiles}
                  disabled={isProcessing || (files.length === 0 && toolType !== "qr")}
                  className={`w-full bg-gradient-to-r ${getToolBgColor()} text-white py-3 text-base font-semibold`}
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
                      Process {files.length > 1 ? `${files.length} Files` : 'File'}
                    </>
                  )}
                </Button>

                {isProcessing && (
                  <div className="space-y-2">
                    <Progress value={processingProgress} className="h-2" />
                    <p className="text-sm text-muted-foreground text-center">
                      {processingProgress}% complete
                    </p>
                  </div>
                )}

                {/* Download processed files */}
                {files.some(f => f.processed) && (
                  <div className="space-y-2">
                    {files.filter(f => f.processed).map((file) => (
                      <Button
                        key={file.id}
                        variant="outline"
                        size="sm"
                        onClick={() => downloadFile(file)}
                        className="w-full"
                      >
                        <Download className="h-3 w-3 mr-2" />
                        {file.name}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Mobile Options Sidebar */}
      <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
        <SheetContent side="bottom" className="h-[80vh] p-0">
          <SheetHeader className="px-6 py-4 border-b bg-gray-50">
            <SheetTitle className="flex items-center space-x-2">
              <Icon className={`h-5 w-5 ${getToolColor()}`} />
              <span>{title} Settings</span>
            </SheetTitle>
          </SheetHeader>
          
          <ScrollArea className="h-full">
            <div className="p-6 space-y-6">
              {options.map((option) => (
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
                        {option.selectOptions?.map((opt: any) => (
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
                </div>
              ))}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <input
        ref={fileInputRef}
        type="file"
        accept={supportedFormats.join(",")}
        multiple={maxFiles > 1}
        onChange={(e) => handleFileUpload(e.target.files)}
        className="hidden"
      />
    </div>
  )
}