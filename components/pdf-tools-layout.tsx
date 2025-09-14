"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { 
  Upload, 
  Download, 
  CheckCircle,
  X,
  RefreshCw,
  Settings,
  FileText,
  DragHandleDots2Icon
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { AdBanner } from "@/components/ads/ad-banner"
import { PDFThumbnailExtractor } from "@/components/pdf-thumbnail-extractor"

interface PDFFile {
  id: string
  file: File
  originalFile?: File
  name: string
  size: number
  preview?: string
  processed?: boolean
  processedPreview?: string
  processedSize?: number
  blob?: Blob
  pages?: any[]
  selectedPages?: number[]
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
  allowPageReorder?: boolean
  supportedFormats?: string[]
  outputFormats?: string[]
  richContent?: React.ReactNode
}

export function PDFToolsLayout({
  title,
  description,
  icon: Icon,
  toolType,
  processFunction,
  options = [],
  maxFiles = 5,
  allowPageSelection = false,
  allowPageReorder = false,
  supportedFormats = ["application/pdf"],
  outputFormats = ["pdf"],
  richContent
}: PDFToolsLayoutProps) {
  const [files, setFiles] = useState<PDFFile[]>([])
  const [toolOptions, setToolOptions] = useState<Record<string, any>>({})
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [showUploadArea, setShowUploadArea] = useState(true)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [draggedPage, setDraggedPage] = useState<number | null>(null)
  
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

    const newFiles: PDFFile[] = []

    for (const file of Array.from(uploadedFiles)) {
      if (!supportedFormats.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported PDF file`,
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

      const pdfFile: PDFFile = {
        id: `${file.name}-${Date.now()}`,
        file,
        originalFile: file,
        name: file.name,
        size: file.size,
      }

      newFiles.push(pdfFile)
    }

    if (newFiles.length > 0) {
      setFiles(prev => [...prev, ...newFiles])
      setShowUploadArea(false)
      toast({
        title: "Files uploaded",
        description: `${newFiles.length} PDF file(s) loaded successfully`
      })
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
    if (files.length === 0) return

    setIsProcessing(true)
    setProcessingProgress(0)

    try {
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const result = await processFunction(files, {
        ...toolOptions,
        selectedPages: allowPageSelection ? files.flatMap(f => f.selectedPages || []) : undefined
      })

      clearInterval(progressInterval)
      setProcessingProgress(100)

      if (result.success) {
        if (result.downloadUrl && result.filename) {
          // Single file download
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
        } else if (result.processedFiles) {
          // Multiple files processed
          setFiles(result.processedFiles)
          toast({
            title: "Processing complete",
            description: `${result.processedFiles.length} file(s) processed successfully`
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
  }

  // Mobile Sidebar Component
  const MobileSidebar = () => (
    <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
      <SheetContent side="bottom" className="h-[80vh] p-0">
        <SheetHeader className="px-6 py-4 border-b bg-gray-50">
          <SheetTitle className="flex items-center space-x-2">
            <Icon className="h-5 w-5 text-red-600" />
            <span>{title} Settings</span>
          </SheetTitle>
        </SheetHeader>
        
        <ScrollArea className="h-full">
          <div className="p-6 space-y-6">
            {options.map((option) => (
              <div key={option.key} className="space-y-2">
                {/* Option controls would go here */}
              </div>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )

  // Show upload area if no files
  if (showUploadArea && files.length === 0) {
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
              <Icon className="h-6 w-6 lg:h-8 lg:w-8 text-red-600" />
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
                  <FileText className="h-5 w-5 text-red-600" />
                  <span>Professional PDF Processing Made Simple</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <FileText className="h-6 w-6 text-red-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Unlimited File Size</h3>
                    <p className="text-sm text-muted-foreground">Process PDF files of any size with our advanced algorithms</p>
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
              className="border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:border-red-400 hover:bg-red-50/30 transition-all duration-300 p-8 lg:p-16 group"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="relative mb-4 lg:mb-6">
                <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl group-hover:blur-2xl transition-all"></div>
                <Upload className="relative h-16 w-16 lg:h-20 lg:w-20 text-red-500 group-hover:text-red-600 transition-colors group-hover:scale-110 transform duration-300" />
              </div>
              <h3 className="text-xl lg:text-2xl font-semibold mb-2 lg:mb-3 text-gray-700 group-hover:text-red-600 transition-colors">Drop PDF files here</h3>
              <p className="text-gray-500 mb-4 lg:mb-6 text-base lg:text-lg text-center">or tap to browse files</p>
              <Button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 lg:px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 group-hover:scale-105">
                <Upload className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
                Choose PDF Files
              </Button>
              <div className="mt-4 lg:mt-6 space-y-2 text-center">
                <p className="text-sm text-gray-500 font-medium">PDF files only</p>
                <p className="text-xs text-gray-400">Up to {maxFiles} files • Unlimited size</p>
              </div>
            </div>
          </div>

          {/* Rich Content After Upload */}
          <div className="max-w-4xl mx-auto mt-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Why Choose Our PDF Tools?</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Enterprise-Grade Security</p>
                        <p className="text-sm text-muted-foreground">Local processing ensures your documents never leave your device</p>
                      </div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Professional Quality</p>
                        <p className="text-sm text-muted-foreground">Maintain document integrity and formatting</p>
                      </div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium">No File Size Limits</p>
                        <p className="text-sm text-muted-foreground">Process documents of any size with advanced algorithms</p>
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
                    <li>• Legal document management</li>
                    <li>• Business report compilation</li>
                    <li>• Academic paper organization</li>
                    <li>• Invoice and receipt processing</li>
                    <li>• Contract and agreement handling</li>
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
          accept=".pdf"
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

      {/* Mobile Layout */}
      <div className="lg:hidden">
        <div className="tools-header bg-white border-b px-4 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-2">
            <Icon className="h-5 w-5 text-red-600" />
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
          {/* PDF File List */}
          <div className="space-y-4">
            {files.map((file) => (
              <Card key={file.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{file.name}</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => removeFile(file.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardDescription>{formatFileSize(file.size)}</CardDescription>
                </CardHeader>
                {file.pages && (
                  <CardContent>
                    <PDFThumbnailExtractor
                      file={file.file}
                      onPagesExtracted={(pages) => {
                        setFiles(prev => prev.map(f => 
                          f.id === file.id ? { ...f, pages } : f
                        ))
                      }}
                    />
                  </CardContent>
                )}
              </Card>
            ))}
          </div>

          {/* Process Button */}
          <div className="mt-6">
            <Button 
              onClick={processFiles}
              disabled={isProcessing || files.length === 0}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3"
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
                  Process PDF{files.length > 1 ? 's' : ''}
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

        <MobileSidebar />
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex h-[calc(100vh-4rem)] w-full overflow-hidden">
        {/* Left Canvas */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="tools-header bg-white border-b px-6 py-3 flex items-center justify-between shadow-sm flex-shrink-0">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Icon className="h-5 w-5 text-red-600" />
                <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
              </div>
              <Badge variant="secondary">PDF Mode</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={resetTool}>
                <RefreshCw className="h-4 w-4" />
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

          {/* Canvas Content */}
          <div className="canvas flex-1 overflow-auto p-6">
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
                  
                  {/* PDF Page Thumbnails */}
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
              <Icon className="h-5 w-5 text-red-600" />
              <h2 className="text-lg font-semibold text-gray-900">PDF Settings</h2>
            </div>
            <p className="text-sm text-gray-600 mt-1">Configure processing options</p>
          </div>

          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-6 space-y-6">
                {/* Tool options would go here */}
                {options.map((option) => (
                  <div key={option.key} className="space-y-2">
                    {/* Option controls */}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="p-6 border-t bg-gray-50 space-y-3 flex-shrink-0">
            <Button 
              onClick={processFiles}
              disabled={isProcessing || files.length === 0}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 text-base font-semibold"
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
                  Process PDF{files.length > 1 ? 's' : ''}
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
          </div>
        </div>
      </div>

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