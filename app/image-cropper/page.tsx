"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Crop, Upload, Download, RefreshCw, ZoomIn, ZoomOut, Maximize2, Settings } from "lucide-react"
import { ImageProcessor } from "@/lib/processors/image-processor"
import { InteractiveCropEditor } from "@/components/interactive-crop-editor"
import { AdBanner } from "@/components/ads/ad-banner"
import { toast } from "@/hooks/use-toast"
import { ImageProcessingGuide } from "@/components/content/image-processing-guide"
import { MobileOptionPanel } from "@/components/mobile-option-panel"

const cropOptions = [
  {
    key: "aspectRatio",
    label: "Aspect Ratio",
    type: "select" as const,
    defaultValue: "free",
    selectOptions: [
      { value: "free", label: "Free Form" },
      { value: "1:1", label: "Square (1:1)" },
      { value: "4:3", label: "Standard (4:3)" },
      { value: "16:9", label: "Widescreen (16:9)" },
      { value: "3:2", label: "Photo (3:2)" },
      { value: "9:16", label: "Portrait (9:16)" },
    ],
    section: "Crop Settings",
  },
  {
    key: "precision",
    label: "Crop Precision",
    type: "select" as const,
    defaultValue: "normal",
    selectOptions: [
      { value: "normal", label: "Normal" },
      { value: "high", label: "High Precision" },
      { value: "pixel", label: "Pixel Perfect" },
    ],
    section: "Quality",
  },
  {
    key: "outputFormat",
    label: "Output Format",
    type: "select" as const,
    defaultValue: "png",
    selectOptions: [
      { value: "png", label: "PNG" },
      { value: "jpeg", label: "JPEG" },
      { value: "webp", label: "WebP" },
    ],
    section: "Output",
  },
  {
    key: "quality",
    label: "Quality",
    type: "slider" as const,
    defaultValue: 95,
    min: 10,
    max: 100,
    step: 5,
    section: "Output",
  },
]

async function cropImages(files: any[], options: any): Promise<{ success: boolean; processedFiles?: any[]; error?: string }> {
  try {
    if (files.length === 0) {
      return {
        success: false,
        error: "No files to process",
      }
    }

    const processedFiles = await Promise.all(
      files.map(async (file) => {
        const cropArea = options.cropArea || {
          x: 20,
          y: 20,
          width: 60,
          height: 60
        }
        
        const processedBlob = await ImageProcessor.cropImage(file.originalFile || file.file, cropArea, {
          outputFormat: options.outputFormat as "jpeg" | "png" | "webp",
          quality: 95,
          backgroundColor: options.outputFormat === "jpeg" ? "#ffffff" : undefined
        })

        const processedUrl = URL.createObjectURL(processedBlob)
        const baseName = file.name.split(".")[0]
        const newName = `${baseName}_cropped.${options.outputFormat}`

        return {
          ...file,
          processed: true,
          processedPreview: processedUrl,
          name: newName,
          processedSize: processedBlob.size,
          blob: processedBlob
        }
      })
    )

    return {
      success: true,
      processedFiles,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to crop images",
    }
  }
}

export default function ImageCropperPage() {
  const [file, setFile] = useState<{file: File, preview: string} | null>(null)
  const [cropArea, setCropArea] = useState({ x: 10, y: 10, width: 80, height: 80 })
  const [toolOptions, setToolOptions] = useState({
    aspectRatio: "free",
    outputFormat: "png",
    quality: 95
  })
  const [zoomLevel, setZoomLevel] = useState(100)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const uploadedFile = files[0]
    if (!uploadedFile.type.startsWith('image/')) {
      toast({ title: "Invalid file", description: "Please upload an image file", variant: "destructive" })
      return
    }

    const preview = URL.createObjectURL(uploadedFile)
    setFile({ file: uploadedFile, preview })
  }

  const handleCrop = async () => {
    if (!file) return

    setIsProcessing(true)
    try {
      const processedBlob = await ImageProcessor.cropImage(file.file, cropArea, {
        outputFormat: toolOptions.outputFormat as "jpeg" | "png" | "webp",
        quality: toolOptions.quality / 100,
        backgroundColor: toolOptions.outputFormat === "jpeg" ? "#ffffff" : undefined
      })

      const url = URL.createObjectURL(processedBlob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${file.file.name.split('.')[0]}_cropped.${toolOptions.outputFormat}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({ title: "Success", description: "Image cropped successfully" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to crop image", variant: "destructive" })
    } finally {
      setIsProcessing(false)
    }
  }

  const resetTool = () => {
    setFile(null)
    setCropArea({ x: 10, y: 10, width: 80, height: 80 })
    setZoomLevel(100)
  }

  if (!file) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 mt-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <Crop className="h-8 w-8 text-cyan-600" />
                <h1 className="text-3xl font-bold">Crop Image</h1>
              </div>
              <p className="text-gray-600">Crop images with precision using our interactive visual editor</p>
            </div>

            <AdBanner adSlot="unified-before-canvas" adFormat="auto" className="mb-6" persistent={true} />

            <label className="cursor-pointer block">
              <Card className="border-2 border-dashed border-gray-300 hover:border-cyan-500 transition-colors p-12 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">Click to upload or drag and drop</p>
                <p className="text-sm text-gray-500">Supports: JPG, PNG, WebP</p>
              </Card>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>

            <AdBanner adSlot="unified-after-canvas" adFormat="auto" className="mt-6" persistent={true} />

            <ImageProcessingGuide toolName="Image Cropper" toolType="crop" className="mt-8" />
          </div>
        </div>
      </div>
    )
  }

  const groupedOptions = cropOptions.reduce((acc, option) => {
    const section = option.section || 'Other'
    if (!acc[section]) acc[section] = []
    acc[section].push(option)
    return acc
  }, {} as Record<string, any[]>)

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-0 left-0 right-0 z-50"><Header /></div>

      <div className="fixed top-16 left-0 right-0 z-40 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Crop className="h-5 w-5 text-cyan-600" />
              <h1 className="text-lg lg:text-xl font-semibold">Crop Image</h1>
              <Badge variant="secondary" className="hidden sm:inline-flex">Interactive</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={resetTool}>
                <RefreshCw className="h-4 w-4" />
              </Button>
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
              <Button variant="outline" size="sm" onClick={() => setIsMobileSidebarOpen(true)} className="lg:hidden">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-32 min-h-screen">
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-3">
            <AdBanner adSlot="unified-before-canvas" adFormat="auto" className="max-w-4xl mx-auto" persistent={true} />
          </div>
        </div>

        <div className="bg-gray-50 min-h-[60vh]">
          <div className="container mx-auto px-4 py-6">
            <InteractiveCropEditor
              imageUrl={file.preview}
              imageName={file.file.name}
              onCropChange={setCropArea}
              aspectRatio={toolOptions.aspectRatio}
              zoomLevel={zoomLevel}
            />
          </div>
        </div>

        <div className="bg-white border-t">
          <div className="container mx-auto px-4 py-3">
            <AdBanner adSlot="unified-after-canvas" adFormat="auto" className="max-w-4xl mx-auto" persistent={true} />
          </div>
        </div>

        <div className="hidden lg:flex w-80 xl:w-96 bg-white border-l shadow-lg flex-col fixed top-16 bottom-0 right-0 z-30 overflow-y-auto">
          <div className="px-6 py-4 border-b bg-gray-50">
            <h2 className="text-lg font-semibold">Crop Settings</h2>
          </div>

          <div className="flex-1 p-6 space-y-6">
            {Object.entries(groupedOptions).map(([section, sectionOptions]) => (
              <div key={section} className="space-y-4">
                <Label className="text-xs font-medium text-gray-500 uppercase">{section}</Label>
                {sectionOptions.map((option) => (
                  <div key={option.key} className="space-y-2">
                    <Label className="text-sm font-medium">{option.label}</Label>
                    {option.type === "select" && (
                      <Select
                        value={toolOptions[option.key as keyof typeof toolOptions]?.toString()}
                        onValueChange={(value) => setToolOptions(prev => ({ ...prev, [option.key]: value }))}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {option.selectOptions?.map((opt: any) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {option.type === "slider" && (
                      <div className="space-y-2">
                        <Slider
                          value={[toolOptions[option.key as keyof typeof toolOptions] as number]}
                          onValueChange={([value]) => setToolOptions(prev => ({ ...prev, [option.key]: value }))}
                          min={option.min}
                          max={option.max}
                          step={option.step}
                        />
                        <div className="text-center text-sm">{toolOptions[option.key as keyof typeof toolOptions]}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="p-6 border-t bg-gray-50">
            <Button onClick={handleCrop} disabled={isProcessing} className="w-full bg-cyan-600 hover:bg-cyan-700" size="lg">
              {isProcessing ? "Processing..." : "Crop & Download"}
            </Button>
          </div>
        </div>

        <MobileOptionPanel
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
          title="Crop Settings"
          icon={Crop}
        >
          <div className="space-y-6">
            {Object.entries(groupedOptions).map(([section, sectionOptions]) => (
              <div key={section} className="space-y-4">
                <Label className="text-xs font-medium text-gray-500 uppercase">{section}</Label>
                {sectionOptions.map((option) => (
                  <div key={option.key} className="space-y-2">
                    <Label>{option.label}</Label>
                    {option.type === "select" && (
                      <Select
                        value={toolOptions[option.key as keyof typeof toolOptions]?.toString()}
                        onValueChange={(value) => setToolOptions(prev => ({ ...prev, [option.key]: value }))}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {option.selectOptions?.map((opt: any) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {option.type === "slider" && (
                      <div className="space-y-2">
                        <Slider
                          value={[toolOptions[option.key as keyof typeof toolOptions] as number]}
                          onValueChange={([value]) => setToolOptions(prev => ({ ...prev, [option.key]: value }))}
                          min={option.min}
                          max={option.max}
                          step={option.step}
                        />
                        <div className="text-center text-sm">{toolOptions[option.key as keyof typeof toolOptions]}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
            <Button onClick={handleCrop} disabled={isProcessing} className="w-full bg-cyan-600 hover:bg-cyan-700" size="lg">
              {isProcessing ? "Processing..." : "Crop & Download"}
            </Button>
          </div>
        </MobileOptionPanel>
      </div>
    </div>
  )
}