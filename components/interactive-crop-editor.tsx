"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Crop, ZoomIn, ZoomOut, Maximize2, RotateCw, Eclipse as Flip, FlipVertical2 } from "lucide-react"

interface CropArea {
  x: number
  y: number
  width: number
  height: number
}

interface InteractiveCropEditorProps {
  imageUrl: string
  imageName: string
  onCropChange: (cropArea: CropArea) => void
  aspectRatio?: string
  zoomLevel?: number
}

export function InteractiveCropEditor({
  imageUrl,
  imageName,
  onCropChange,
  aspectRatio = "free",
  zoomLevel = 100
}: InteractiveCropEditorProps) {
  const [cropArea, setCropArea] = useState<CropArea>({ x: 10, y: 10, width: 80, height: 80 })
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState<string | null>(null)
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 })
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })

  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const dragStartRef = useRef({ x: 0, y: 0, cropX: 0, cropY: 0, cropWidth: 0, cropHeight: 0 })

  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      setImageSize({ width: img.width, height: img.height })
    }
    img.src = imageUrl
  }, [imageUrl])

  useEffect(() => {
    if (containerRef.current) {
      const updateSize = () => {
        if (containerRef.current) {
          setContainerSize({
            width: containerRef.current.clientWidth,
            height: containerRef.current.clientHeight
          })
        }
      }
      updateSize()
      window.addEventListener('resize', updateSize)
      return () => window.removeEventListener('resize', updateSize)
    }
  }, [])

  useEffect(() => {
    onCropChange(cropArea)
  }, [cropArea, onCropChange])

  const handleMouseDown = useCallback((e: React.MouseEvent, type: 'drag' | 'resize', handle?: string) => {
    e.preventDefault()
    e.stopPropagation()

    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const startX = ((e.clientX - rect.left) / rect.width) * 100
    const startY = ((e.clientY - rect.top) / rect.height) * 100

    dragStartRef.current = {
      x: startX,
      y: startY,
      cropX: cropArea.x,
      cropY: cropArea.y,
      cropWidth: cropArea.width,
      cropHeight: cropArea.height
    }

    if (type === 'drag') {
      setIsDragging(true)
    } else if (type === 'resize' && handle) {
      setIsResizing(handle)
    }
  }, [cropArea])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging && !isResizing) return
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const currentX = ((e.clientX - rect.left) / rect.width) * 100
    const currentY = ((e.clientY - rect.top) / rect.height) * 100

    const deltaX = currentX - dragStartRef.current.x
    const deltaY = currentY - dragStartRef.current.y

    if (isDragging) {
      let newX = dragStartRef.current.cropX + deltaX
      let newY = dragStartRef.current.cropY + deltaY

      newX = Math.max(0, Math.min(100 - cropArea.width, newX))
      newY = Math.max(0, Math.min(100 - cropArea.height, newY))

      setCropArea(prev => ({ ...prev, x: newX, y: newY }))
    } else if (isResizing) {
      let newCrop = { ...cropArea }
      const minSize = 10

      switch (isResizing) {
        case 'nw':
          newCrop.x = Math.max(0, dragStartRef.current.cropX + deltaX)
          newCrop.y = Math.max(0, dragStartRef.current.cropY + deltaY)
          newCrop.width = Math.max(minSize, dragStartRef.current.cropWidth - deltaX)
          newCrop.height = Math.max(minSize, dragStartRef.current.cropHeight - deltaY)
          break
        case 'ne':
          newCrop.y = Math.max(0, dragStartRef.current.cropY + deltaY)
          newCrop.width = Math.max(minSize, Math.min(100 - newCrop.x, dragStartRef.current.cropWidth + deltaX))
          newCrop.height = Math.max(minSize, dragStartRef.current.cropHeight - deltaY)
          break
        case 'sw':
          newCrop.x = Math.max(0, dragStartRef.current.cropX + deltaX)
          newCrop.width = Math.max(minSize, dragStartRef.current.cropWidth - deltaX)
          newCrop.height = Math.max(minSize, Math.min(100 - newCrop.y, dragStartRef.current.cropHeight + deltaY))
          break
        case 'se':
          newCrop.width = Math.max(minSize, Math.min(100 - newCrop.x, dragStartRef.current.cropWidth + deltaX))
          newCrop.height = Math.max(minSize, Math.min(100 - newCrop.y, dragStartRef.current.cropHeight + deltaY))
          break
        case 'n':
          newCrop.y = Math.max(0, dragStartRef.current.cropY + deltaY)
          newCrop.height = Math.max(minSize, dragStartRef.current.cropHeight - deltaY)
          break
        case 's':
          newCrop.height = Math.max(minSize, Math.min(100 - newCrop.y, dragStartRef.current.cropHeight + deltaY))
          break
        case 'w':
          newCrop.x = Math.max(0, dragStartRef.current.cropX + deltaX)
          newCrop.width = Math.max(minSize, dragStartRef.current.cropWidth - deltaX)
          break
        case 'e':
          newCrop.width = Math.max(minSize, Math.min(100 - newCrop.x, dragStartRef.current.cropWidth + deltaX))
          break
      }

      if (aspectRatio !== "free") {
        const ratio = parseAspectRatio(aspectRatio)
        if (ratio) {
          newCrop.height = newCrop.width / ratio
          if (newCrop.y + newCrop.height > 100) {
            newCrop.height = 100 - newCrop.y
            newCrop.width = newCrop.height * ratio
          }
        }
      }

      if (newCrop.x + newCrop.width <= 100 && newCrop.y + newCrop.height <= 100) {
        setCropArea(newCrop)
      }
    }
  }, [isDragging, isResizing, cropArea, aspectRatio])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setIsResizing(null)
  }, [])

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp])

  const parseAspectRatio = (ratio: string): number | null => {
    if (ratio === "free") return null
    const [w, h] = ratio.split(':').map(Number)
    return w / h
  }

  return (
    <div className="w-full h-full min-h-[500px] relative">
      <Card className="w-full h-full overflow-hidden bg-gray-900">
        <div
          ref={containerRef}
          className="relative w-full h-full min-h-[500px] flex items-center justify-center overflow-hidden"
        >
          <img
            ref={imageRef}
            src={imageUrl}
            alt={imageName}
            className="max-w-full max-h-full object-contain"
            style={{
              transform: `scale(${zoomLevel / 100})`,
              transition: isDragging || isResizing ? 'none' : 'transform 0.2s ease'
            }}
          />

          {/* Crop overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `
                linear-gradient(to right,
                  rgba(0,0,0,0.5) 0%,
                  rgba(0,0,0,0.5) ${cropArea.x}%,
                  transparent ${cropArea.x}%,
                  transparent ${cropArea.x + cropArea.width}%,
                  rgba(0,0,0,0.5) ${cropArea.x + cropArea.width}%
                ),
                linear-gradient(to bottom,
                  rgba(0,0,0,0.5) 0%,
                  rgba(0,0,0,0.5) ${cropArea.y}%,
                  transparent ${cropArea.y}%,
                  transparent ${cropArea.y + cropArea.height}%,
                  rgba(0,0,0,0.5) ${cropArea.y + cropArea.height}%
                )
              `
            }}
          />

          {/* Crop box */}
          <div
            className="absolute border-2 border-white shadow-lg cursor-move pointer-events-auto"
            style={{
              left: `${cropArea.x}%`,
              top: `${cropArea.y}%`,
              width: `${cropArea.width}%`,
              height: `${cropArea.height}%`,
            }}
            onMouseDown={(e) => handleMouseDown(e, 'drag')}
          >
            {/* Grid lines */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/3 left-0 right-0 h-px bg-white opacity-50" />
              <div className="absolute top-2/3 left-0 right-0 h-px bg-white opacity-50" />
              <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white opacity-50" />
              <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white opacity-50" />
            </div>

            {/* Resize handles */}
            {['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se'].map((handle) => (
              <div
                key={handle}
                className={`absolute w-3 h-3 bg-white border-2 border-cyan-500 rounded-full cursor-${getResizeCursor(handle)} pointer-events-auto hover:scale-125 transition-transform`}
                style={getHandlePosition(handle)}
                onMouseDown={(e) => handleMouseDown(e, 'resize', handle)}
              />
            ))}

            {/* Crop dimensions display */}
            <div className="absolute -top-8 left-0 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
              {Math.round((cropArea.width * imageSize.width) / 100)} × {Math.round((cropArea.height * imageSize.height) / 100)}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

function getHandlePosition(handle: string) {
  const positions: Record<string, any> = {
    nw: { top: '-6px', left: '-6px' },
    n: { top: '-6px', left: '50%', transform: 'translateX(-50%)' },
    ne: { top: '-6px', right: '-6px' },
    w: { top: '50%', left: '-6px', transform: 'translateY(-50%)' },
    e: { top: '50%', right: '-6px', transform: 'translateY(-50%)' },
    sw: { bottom: '-6px', left: '-6px' },
    s: { bottom: '-6px', left: '50%', transform: 'translateX(-50%)' },
    se: { bottom: '-6px', right: '-6px' }
  }
  return positions[handle] || {}
}

function getResizeCursor(handle: string) {
  const cursors: Record<string, string> = {
    nw: 'nwse-resize',
    n: 'ns-resize',
    ne: 'nesw-resize',
    w: 'ew-resize',
    e: 'ew-resize',
    sw: 'nesw-resize',
    s: 'ns-resize',
    se: 'nwse-resize'
  }
  return cursors[handle] || 'default'
}
