"use client"

import { AdBanner } from "./ad-banner"
import { APP_CONFIG } from "@/lib/config"

interface PersistentAdManagerProps {
  beforeCanvasSlot: string
  afterCanvasSlot: string
  toolType: "image" | "pdf" | "qr"
  className?: string
}

export function PersistentAdManager({ 
  beforeCanvasSlot, 
  afterCanvasSlot, 
  toolType,
  className = ""
}: PersistentAdManagerProps) {

  if (!APP_CONFIG.enableAds) {
    return null
  }

  return (
    <div className={`persistent-ad-manager ${className}`}>
      {/* Before Canvas Ad */}
      <div className="ad-before-canvas mb-4">
        <AdBanner 
          adSlot={beforeCanvasSlot}
          adFormat="auto"
          className="w-full"
          mobileOptimized={true}
        />
      </div>
      
      {/* After Canvas Ad */}
      <div className="ad-after-canvas mt-4">
        <AdBanner 
          adSlot={afterCanvasSlot}
          adFormat="auto"
          className="w-full"
          mobileOptimized={true}
        />
      </div>
    </div>
  )
}