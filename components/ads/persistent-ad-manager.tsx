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

  // Move ads to canvas containers when tools interface loads
  useEffect(() => {
    const moveAdsToCanvas = () => {
      // Move before canvas ad
      const beforeCanvasContainer = document.querySelector('.ad-before')
      const afterCanvasContainer = document.querySelector('.ad-after')
      
      if (beforeCanvasContainer && beforeAdRef.current && !beforeCanvasContainer.querySelector('.adsbygoogle')) {
        const clonedBefore = beforeAdRef.current.cloneNode(true) as HTMLElement
        beforeCanvasContainer.appendChild(clonedBefore)
      }
      
      if (afterCanvasContainer && afterAdRef.current && !afterCanvasContainer.querySelector('.adsbygoogle')) {
        const clonedAfter = afterAdRef.current.cloneNode(true) as HTMLElement
        afterCanvasContainer.appendChild(clonedAfter)
      }
    }

    // Check if tools interface is loaded
    const toolsInterface = document.querySelector('.tools-header:not(.d-none)')
    if (toolsInterface) {
      moveAdsToCanvas()
    }

    // Set up observer for when tools interface becomes visible
    const observer = new MutationObserver(() => {
      const toolsInterface = document.querySelector('.tools-header:not(.d-none)')
      if (toolsInterface) {
        moveAdsToCanvas()
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class']
    })

    return () => observer.disconnect()
  }, [adsLoaded])

  return (
    <div className={className}>
      {/* Original ads that will be cloned/moved */}
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
    </div>
  )
}