"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
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
  Settings,
  ImageIcon
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { AdBanner } from "@/components/ads/ad-banner"
import { MobileOptionPanel } from "@/components/mobile-option-panel"

interface ImageFile {
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
}

interface ImageToolsLayoutProps {
  title: string
  description: string
  icon: any
  toolType: string
  processFunction: (files: any[], options: any) => Promise<{ success: boolean; processedFiles?: any[]; downloadUrl?: string; filename?: string; error?: string }>
  options?: any[]
  maxFiles?: number
  allowBatchProcessing?: boolean
  supportedFormats?: string[]
  outputFormats?: string[]
  richContent?: React.ReactNode
}

export function ImageToolsLayout({
  title,
  description,
  icon: Icon,
  toolType,
  processFunction,
  options = [],
  maxFiles = 20,
  allowBatchProcessing = true,
  supportedFormats = ["image/jpeg", "image/png", "image/webp"],
  outputFormats = ["jpeg", "png", "webp"],
  richContent
}: ImageToolsLayoutProps) {
  const [files, setFiles] = useState<ImageFile[]>([])
  const [toolOptions, setToolOptions] = useState<Record<string, any>>({})
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [showUploadArea, setShowUploadArea] = useState(true)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isToolInterfaceActive, setIsToolInterfaceActive] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

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

    const newFiles: ImageFile[] = []

    for (const file of Array.from(uploadedFiles)) {
      if (!supportedFormats.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported image format`,
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
        const preview = await createImagePreview(file)
        const dimensions = await getImageDimensions(file)
        
        const imageFile: ImageFile = {
          id: `${file.name}-${Date.now()}`,
          file,
          originalFile: file,
          name: file.name,
          size: file.size,
          dimensions,
          preview,
        }

        newFiles.push(imageFile)
      } catch (error) {
        toast({
          title: "Error loading image",
          description: `Failed to load ${file.name}`,
          variant: "destructive"
        })
      }
    }

    if (newFiles.length > 0) {
      setFiles(prev => [...prev, ...newFiles])
      setShowUploadArea(false)
      setIsToolInterfaceActive(true)
      toast({
        title: "Images uploaded",
        description: `${newFiles.length} image(s) loaded successfully`
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
    setIsToolInterfaceActive(false)
    setIsMobileSidebarOpen(false)
  }

  const processFiles = async () => {
    if (files.length === 0) return

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
            description: `${result.processedFiles.length} image(s) processed successfully`
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

  const downloadFile = (file: ImageFile) => {
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
            <SelectTrigger className="w-full">
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
              checked={toolOptions[option.key] || false}
              onCheckedChange={(checked) => setToolOptions(prev => ({ ...prev, [option.key]: checked }))}
            />
            <span className="text-sm">{option.label}</span>
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
            <div className="flex justify-between text-xs text-gray-500">
              <span>{option.min}</span>
              <span className="font-medium bg-gray-100 px-2 py-1 rounded">
                {toolOptions[option.key] || option.defaultValue}
              </span>
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
            className="w-full"
          />
        )

      case "color":
        return (
          <Input
            type="color"
            value={toolOptions[option.key] || option.defaultValue}
            onChange={(e) => setToolOptions(prev => ({ ...prev, [option.key]: e.target.value }))}
            className="w-full h-10"
          />
        )

      case "text":
        return (
          <Input
            type="text"
            value={toolOptions[option.key] || option.defaultValue}
            onChange={(e) => setToolOptions(prev => ({ ...prev, [option.key]: e.target.value }))}
            className="w-full"
          />
        )

      default:
        return null
    }
  }

  // Group options by section
  const groupedOptions = options.reduce((groups, option) => {
    const section = option.section || "General"
    if (!groups[section]) groups[section] = []
    groups[section].push(option)
    return groups
  }, {} as Record<string, any[]>)

  // Show upload area if no files
  if (!isToolInterfaceActive && files.length === 0) {
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
              <Icon className="h-6 w-6 lg:h-8 lg:w-8 text-purple-600" />
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
                  <ImageIcon className="h-5 w-5 text-purple-600" />
                  <span>Professional Image Processing Made Simple</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <ImageIcon className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Unlimited File Size</h3>
                    <p className="text-sm text-muted-foreground">Process images of any size with our advanced algorithms</p>
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
              className="border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:border-purple-400 hover:bg-purple-50/30 transition-all duration-300 p-8 lg:p-16 group"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="relative mb-4 lg:mb-6">
                <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl group-hover:blur-2xl transition-all"></div>
                <Upload className="relative h-16 w-16 lg:h-20 lg:w-20 text-purple-500 group-hover:text-purple-600 transition-colors group-hover:scale-110 transform duration-300" />
              </div>
              <h3 className="text-xl lg:text-2xl font-semibold mb-2 lg:mb-3 text-gray-700 group-hover:text-purple-600 transition-colors">Drop images here</h3>
              <p className="text-gray-500 mb-4 lg:mb-6 text-base lg:text-lg text-center">or tap to browse files</p>
              <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 lg:px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 group-hover:scale-105">
                <Upload className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
                Choose Images
              </Button>
              <div className="mt-4 lg:mt-6 space-y-2 text-center">
                <p className="text-sm text-gray-500 font-medium">JPG, PNG, WebP, GIF</p>
                <p className="text-xs text-gray-400">Up to {maxFiles} files • Unlimited size</p>
              </div>
            </div>
          </div>

          {/* Rich Content After Upload */}
          <div className="max-w-4xl mx-auto mt-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Why Choose Our Image Tools?</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Enterprise-Grade Security</p>
                        <p className="text-sm text-muted-foreground">Local processing ensures your images never leave your device</p>
                      </div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Professional Quality</p>
                        <p className="text-sm text-muted-foreground">Maintain image integrity and quality</p>
                      </div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium">No File Size Limits</p>
                        <p className="text-sm text-muted-foreground">Process images of any size with advanced algorithms</p>
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
                    <li>• Website optimization</li>
                    <li>• Social media content</li>
                    <li>• E-commerce product photos</li>
                    <li>• Print material preparation</li>
                    <li>• Email newsletter images</li>
                    <li>• Mobile app assets</li>
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

  // Tool interface when files are loaded
  return (
    <div className="min-h-screen bg-background tools-interface-container">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header />
      </div>

      {/* Fixed Tools Header */}
      <div className="fixed top-16 left-0 right-0 z-40 tools-header bg-white border-b shadow-sm tools-header-responsive">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Icon className="h-5 w-5 text-purple-600" />
              <h1 className="text-lg lg:text-xl font-semibold text-gray-900">{title}</h1>
              <Badge variant="secondary" className="hidden sm:inline-flex">Image Mode</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={resetTool}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              {files.length > 0 && (
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

      {/* Main Content Area with proper spacing */}
      <div className="pt-32 min-h-screen tools-main-content">
        {/* Unified Before Canvas Ad */}
        <div className="unified-before-canvas bg-white border-b tools-header-responsives">
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

        {/* Canvas Area with proper responsive margins */}
        <div className="canvas bg-gray-50 min-h-[60vh] overflow-y-auto tools-interface-active">
          <div className="container mx-auto px-4 py-6">
            {!allowBatchProcessing && files.length > 0 ? (
              // Single image full preview
              <div className="flex justify-center items-center min-h-[50vh]">
                <div className="max-w-full">
                  <img
                    src={files[0].processedPreview || files[0].preview}
                    alt={files[0].name}
                    className="max-w-full h-auto object-contain border rounded-lg shadow-lg"
                    style={{ 
                      transform: `scale(${zoomLevel / 100})`,
                      transition: "transform 0.2s ease",
                      transformOrigin: "center center"
                    }}
                  />
                  <div className="mt-4 text-center">
                    <p className="font-medium">{files[0].name}</p>
                    <p className="text-sm text-gray-500">{formatFileSize(files[0].size)}</p>
                    {files[0].dimensions && (
                      <p className="text-sm text-gray-500">
                        {files[0].dimensions.width} × {files[0].dimensions.height}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              // Thumbnail grid for batch processing
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {files.map((file) => (
                  <Card key={file.id} className="tool-file-thumbnail relative">
                    <CardContent className="p-3">
                      <img
                        src={file.processedPreview || file.preview}
                        alt={file.name}
                        className="w-full aspect-square object-cover rounded"
                      />
                      <p className="text-xs font-medium mt-2 truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      {file.dimensions && (
                        <p className="text-xs text-gray-500">
                          {file.dimensions.width} × {file.dimensions.height}
                        </p>
                      )}
                      {file.processed && (
                        <CheckCircle className="absolute top-2 right-2 h-4 w-4 text-green-600" />
                      )}
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

            {/* Mobile Process Button */}
            <div className="lg:hidden mt-6">
              <Button 
                onClick={processFiles}
                disabled={isProcessing || files.length === 0}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3"
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
                    Process Image{files.length > 1 ? 's' : ''}
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
        </div>

        {/* Unified After Canvas Ad */}
        <div className="unified-after-canvas bg-white border-t tools-header-responsive">
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

        {/* Fixed Desktop Right Sidebar */}
        <div className="hidden lg:flex w-80 xl:w-96 bg-white border-l shadow-lg flex-col fixed top-16 bottom-0 right-0 z-30 overflow-y-auto">
          <div className="px-6 py-4 border-b bg-gray-50 flex-shrink-0">
            <div className="flex items-center space-x-2">
              <Icon className="h-5 w-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-900">Image Settings</h2>
            </div>
            <p className="text-sm text-gray-600 mt-1">Configure processing options</p>
          </div>

          <div className="flex-1 overflow-y-auto">
            <ScrollArea className="h-full">
              <div className="p-6 space-y-6">
                {Object.entries(groupedOptions).map(([section, sectionOptions]) => (
                  <div key={section} className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <div className="h-px bg-gray-200 flex-1"></div>
                      <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{section}</Label>
                      <div className="h-px bg-gray-200 flex-1"></div>
                    </div>
                    {sectionOptions.map((option) => (
                      <div key={option.key} className="space-y-2">
                        <Label className="text-sm font-medium">{option.label}</Label>
                        {renderOptionControl(option)}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="p-4 lg:p-6 border-t bg-gray-50 space-y-3 flex-shrink-0">
            <Button 
              onClick={processFiles}
              disabled={isProcessing || files.length === 0}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 lg:py-3 text-sm lg:text-base font-semibold"
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
                  Process Image{files.length > 1 ? 's' : ''}
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
                <Label className="text-sm font-medium">Download Results</Label>
                {files.filter(f => f.processed).map((file) => (
                  <Button
                    key={file.id}
                    variant="outline"
                    size="sm"
                    onClick={() => downloadFile(file)}
                    className="w-full justify-start"
                  >
                    <Download className="h-3 w-3 mr-2" />
                    <span className="truncate">{file.name}</span>
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Options Panel */}
        <MobileOptionPanel
          isOpen={isMobileSidebarOpen}
          onOpenChange={setIsMobileSidebarOpen}
          title={`${title} Settings`}
          icon={<Icon className="h-5 w-5 text-purple-600" />}
          footer={
            <Button 
              onClick={processFiles}
              disabled={isProcessing || files.length === 0}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {isProcessing ? "Processing..." : `Process Image${files.length > 1 ? 's' : ''}`}
            </Button>
          }
        >
          <div className="space-y-6">
            {Object.entries(groupedOptions).map(([section, sectionOptions]) => (
              <div key={section} className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="h-px bg-gray-200 flex-1"></div>
                  <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{section}</Label>
                  <div className="h-px bg-gray-200 flex-1"></div>
                </div>
                {sectionOptions.map((option) => (
                  <div key={option.key} className="space-y-2">
                    <Label className="text-sm font-medium">{option.label}</Label>
                    {renderOptionControl(option)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </MobileOptionPanel>
      </div>

      {/* Rich Educational Content - Hidden when tool interface is active */}
      {richContent && !isToolInterfaceActive && (
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