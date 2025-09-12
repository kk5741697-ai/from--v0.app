"use client"

import { useEffect, useState } from "react"
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
  const [adsInitialized, setAdsInitialized] = useState(false)

  useEffect(() => {
    // Initialize ads only once when component mounts
    if (!adsInitialized && APP_CONFIG.enableAds) {
      setAdsInitialized(true)
    }
  }, [adsInitialized])

  if (!APP_CONFIG.enableAds) {
    return null
  }

  return (
    <div className={`persistent-ad-manager ${className}`}>
      {/* Before Canvas Ad - Always visible */}
      <div className="ad-slot ad-before">
        <AdBanner 
          adSlot={beforeCanvasSlot}
          adFormat="auto"
          className="w-full max-w-4xl mx-auto"
          mobileOptimized={true}
        />
      </div>

      {/* After Canvas Ad - Always visible */}
      <div className="ad-slot ad-after">
        <AdBanner 
          adSlot={afterCanvasSlot}
          adFormat="auto"
          className="w-full max-w-4xl mx-auto"
          mobileOptimized={true}
        />
      </div>
    </div>
  )
}