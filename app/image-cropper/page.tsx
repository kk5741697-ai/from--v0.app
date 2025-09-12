"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { UnifiedToolLayout } from "@/components/unified-tool-layout"
import { Crop } from "lucide-react"
import { ImageProcessor } from "@/lib/processors/image-processor"
import { ImageProcessingGuide } from "@/components/content/image-processing-guide"

interface CropArea {
  x: number
  y: number
  width: number
  height: number
}

const cropOptions = [
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
  {
    key: "backgroundColor",
    label: "Background Color (for JPEG)",
    type: "color" as const,
    defaultValue: "#ffffff",
    section: "Output",
    condition: (options) => options.outputFormat === "jpeg",
  },
]

async function cropImages(files: any[], options: any) {
  try {
    if (files.length === 0) {
      return {
        success: false,
        error: "No files to process",
      }
    }

    const processedFiles = await Promise.all(
      files.map(async (file) => {
        // Default crop area if not specified
        const cropArea = options.cropArea || { x: 10, y: 10, width: 80, height: 80 }
        
        const processedBlob = await ImageProcessor.cropImage(file.originalFile || file.file, cropArea, {
          outputFormat: options.outputFormat as "jpeg" | "png" | "webp",
          quality: options.quality,
          backgroundColor: options.backgroundColor
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

function CropperCanvas({ files, onCropAreaChange }: { files: any[], onCropAreaChange: (area: CropArea) => void }) {
  const [cropArea, setCropArea] = useState<CropArea>({ x: 10, y: 10, width: 80, height: 80 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragHandle, setDragHandle] = useState<string | null>(null)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [containerRect, setContainerRect] = useState<DOMRect | null>(null)
  
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    onCropAreaChange(cropArea)
  }, [cropArea, onCropAreaChange])

  useEffect(() => {
    const updateContainerRect = () => {
      if (containerRef.current) {
        setContainerRect(containerRef.current.getBoundingClientRect())
      }
    }

    updateContainerRect()
    window.addEventListener('resize', updateContainerRect)
    return () => window.removeEventListener('resize', updateContainerRect)
  }, [files])

  const handleCropMouseDown = (e: React.MouseEvent, handle: string) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!containerRect) return
    
    setIsDragging(true)
    setDragHandle(handle)
    setDragStart({
      x: e.clientX - containerRect.left,
      y: e.clientY - containerRect.top
    })
  }

  const handleCropMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !dragHandle || !containerRect) return

    const currentX = e.clientX - containerRect.left
    const currentY = e.clientY - containerRect.top
    const deltaX = ((currentX - dragStart.x) / containerRect.width) * 100
    const deltaY = ((currentY - dragStart.y) / containerRect.height) * 100

    setCropArea(prev => {
      let newArea = { ...prev }
      
      switch (dragHandle) {
        case 'move':
          newArea.x = Math.max(0, Math.min(100 - newArea.width, prev.x + deltaX))
          newArea.y = Math.max(0, Math.min(100 - newArea.height, prev.y + deltaY))
          break
        case 'nw':
          newArea.x = Math.max(0, prev.x + deltaX)
          newArea.y = Math.max(0, prev.y + deltaY)
          newArea.width = Math.max(1, prev.width - deltaX)
          newArea.height = Math.max(1, prev.height - deltaY)
          break
        case 'ne':
          newArea.y = Math.max(0, prev.y + deltaY)
          newArea.width = Math.max(1, prev.width + deltaX)
          newArea.height = Math.max(1, prev.height - deltaY)
          break
        case 'sw':
          newArea.x = Math.max(0, prev.x + deltaX)
          newArea.width = Math.max(1, prev.width - deltaX)
          newArea.height = Math.max(1, prev.height + deltaY)
          break
        case 'se':
          newArea.width = Math.max(1, prev.width + deltaX)
          newArea.height = Math.max(1, prev.height + deltaY)
          break
      }
      
      // Ensure crop area stays within bounds
      newArea.x = Math.max(0, Math.min(100 - newArea.width, newArea.x))
      newArea.y = Math.max(0, Math.min(100 - newArea.height, newArea.y))
      newArea.width = Math.max(1, Math.min(100 - newArea.x, newArea.width))
      newArea.height = Math.max(1, Math.min(100 - newArea.y, newArea.height))
      
      return newArea
    })

    setDragStart({ x: currentX, y: currentY })
  }, [isDragging, dragHandle, containerRect, dragStart])

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

  if (files.length === 0) return null

  return (
    <div className="space-y-4">
      {files.map((file) => (
        <div key={file.id} className="relative">
          <div 
            ref={containerRef}
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
              <span>{file.size ? Math.round(file.size / 1024) : 0}KB</span>
              {file.dimensions && (
                <span>{file.dimensions.width}×{file.dimensions.height}</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function ImageCropperPage() {
  const [cropArea, setCropArea] = useState<CropArea>({ x: 10, y: 10, width: 80, height: 80 })

  const handleCropAreaChange = (area: CropArea) => {
    setCropArea(area)
  }

  const processWithCropArea = async (files: any[], options: any) => {
    return cropImages(files, { ...options, cropArea })
  }

  const richContent = (
    <ImageProcessingGuide 
      toolName="Image Cropper"
      toolType="crop"
      className="py-8"
    />
  )

  return (
    <UnifiedToolLayout
      title="Image Cropper"
      description="Crop images with precision using our visual editor and aspect ratio presets. Perfect for social media and web optimization."
      icon={Crop}
      toolType="image"
      processFunction={processWithCropArea}
      options={cropOptions}
      maxFiles={1}
      allowBatchProcessing={false}
      supportedFormats={["image/jpeg", "image/png", "image/webp"]}
      outputFormats={["jpeg", "png", "webp"]}
      richContent={richContent}
    >
      <CropperCanvas files={[]} onCropAreaChange={handleCropAreaChange} />
    </UnifiedToolLayout>
  )
}