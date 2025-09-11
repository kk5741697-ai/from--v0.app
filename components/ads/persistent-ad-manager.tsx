"use client"

import { useState, useEffect, useRef } from "react"
import { AdBanner } from "./ad-banner"

interface PersistentAdManagerProps {
  beforeCanvasSlot: string
  afterCanvasSlot: string
  className?: string
}

export function PersistentAdManager({ 
  beforeCanvasSlot, 
  afterCanvasSlot, 
  className 
}: PersistentAdManagerProps) {
  const [adsLoaded, setAdsLoaded] = useState(false)
  const beforeAdRef = useRef<HTMLDivElement>(null)
  const afterAdRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load ads once and reuse them
    if (!adsLoaded) {
      setAdsLoaded(true)
    }
  }, [adsLoaded])

  // Clone and move ads instead of reloading
  const moveAdsToCanvas = () => {
    if (beforeAdRef.current && afterAdRef.current) {
      const beforeCanvasAd = document.getElementById('before-canvas-ad')
      const afterCanvasAd = document.getElementById('after-canvas-ad')
      
      if (!beforeCanvasAd && beforeAdRef.current.firstChild) {
        const clonedBefore = beforeAdRef.current.cloneNode(true) as HTMLElement
        clonedBefore.id = 'before-canvas-ad'
        document.getElementById('before-canvas-container')?.appendChild(clonedBefore)
      }
      
      if (!afterCanvasAd && afterAdRef.current.firstChild) {
        const clonedAfter = afterAdRef.current.cloneNode(true) as HTMLElement
        clonedAfter.id = 'after-canvas-ad'
        document.getElementById('after-canvas-container')?.appendChild(clonedAfter)
      }
    }
  }

  return (
    <div className={className}>
      {/* Original ads that will be cloned */}
      <div ref={beforeAdRef} style={{ display: 'none' }}>
        <AdBanner 
          adSlot={beforeCanvasSlot}
          adFormat="auto"
          className="w-full"
        />
      </div>
      
      <div ref={afterAdRef} style={{ display: 'none' }}>
        <AdBanner 
          adSlot={afterCanvasSlot}
          adFormat="auto"
          className="w-full"
        />
      </div>

      {/* Visible ads on upload page */}
      {adsLoaded && (
        <>
          <div className="mb-6">
            <AdBanner 
              adSlot={beforeCanvasSlot}
              adFormat="auto"
              className="max-w-4xl mx-auto"
            />
          </div>
          
          <div className="mt-6">
            <AdBanner 
              adSlot={afterCanvasSlot}
              adFormat="auto"
              className="max-w-4xl mx-auto"
            />
          </div>
        </>
      )}

      {/* Canvas ad containers (will be populated when tool interface loads) */}
      <div id="before-canvas-container" className="hidden"></div>
      <div id="after-canvas-container" className="hidden"></div>
    </div>
  )
}