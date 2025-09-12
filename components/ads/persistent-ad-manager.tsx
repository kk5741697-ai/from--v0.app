"use client"

import { useEffect, useRef } from "react"
import { AdBanner } from "./ad-banner"

interface PersistentAdManagerProps {
  beforeCanvasSlot: string
  afterCanvasSlot: string
  toolType?: "image" | "pdf" | "qr"
  className?: string
}

export function PersistentAdManager({ 
  beforeCanvasSlot, 
  afterCanvasSlot, 
  toolType = "image",
  className 
}: PersistentAdManagerProps) {
  const beforeAdRef = useRef<HTMLDivElement>(null)
  const afterAdRef = useRef<HTMLDivElement>(null)
  const adsInitialized = useRef(false)

  useEffect(() => {
    // Initialize ads only once per session
    if (!adsInitialized.current) {
      adsInitialized.current = true
      initializePersistentAds()
    }
  }, [])

  const initializePersistentAds = () => {
    // Create persistent ad containers that will be reused
    if (typeof window !== "undefined") {
      // Ensure ads are loaded once and reused throughout the session
      const adContainers = document.querySelectorAll('.ad-slot')
      adContainers.forEach(container => {
        if (!container.querySelector('.adsbygoogle')) {
          const adElement = document.createElement('div')
          adElement.className = 'adsbygoogle'
          adElement.setAttribute('data-ad-client', 'ca-pub-4755003409431265')
          adElement.setAttribute('data-ad-slot', container.classList.contains('ad-before') ? beforeCanvasSlot : afterCanvasSlot)
          adElement.setAttribute('data-ad-format', 'auto')
          adElement.setAttribute('data-full-width-responsive', 'true')
          adElement.style.display = 'block'
          adElement.style.minHeight = '90px'
          container.appendChild(adElement)
          
          // Initialize ad
          try {
            ;(window as any).adsbygoogle = (window as any).adsbygoogle || []
            ;(window as any).adsbygoogle.push({})
          } catch (error) {
            console.warn('Ad initialization failed:', error)
          }
        }
      })
    }
  }

  useEffect(() => {
    // Observe for interface changes and ensure ads remain visible
    const observer = new MutationObserver(() => {
      // Ensure ads are always present in ad slots
      const adSlots = document.querySelectorAll('.ad-slot')
      adSlots.forEach(slot => {
        if (!slot.querySelector('.adsbygoogle')) {
          initializePersistentAds()
        }
      })
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style']
    })

    return () => observer.disconnect()
  }, [beforeCanvasSlot, afterCanvasSlot])

  // Handle interface transitions without reloading ads
  useEffect(() => {
    const handleInterfaceTransition = () => {
      // Ensure ads remain visible during interface transitions
      const adSlots = document.querySelectorAll('.ad-slot')
      adSlots.forEach(slot => {
        const adElement = slot.querySelector('.adsbygoogle')
        if (adElement) {
          // Ensure ad remains visible and properly positioned
          const adEl = adElement as HTMLElement
          adEl.style.display = 'block'
          adEl.style.visibility = 'visible'
        }
      })
    }

    // Listen for tool interface changes
    const toolsHeaders = document.querySelectorAll('.tools-header')
    const uploadAreas = document.querySelectorAll('.upload-area')
    
    const observer = new MutationObserver(handleInterfaceTransition)
    
    toolsHeaders.forEach(header => observer.observe(header, { attributes: true, attributeFilter: ['class'] }))
    uploadAreas.forEach(area => observer.observe(area, { attributes: true, attributeFilter: ['class'] }))

    return () => observer.disconnect()
  }, [])

  return (
    <div className={`persistent-ad-manager ${className || ''}`}>
      {/* Hidden ad templates that get cloned to ad slots */}
      <div style={{ display: 'none' }}>
        <div ref={beforeAdRef} className="ad-template-before">
          <AdBanner 
            adSlot={beforeCanvasSlot}
            adFormat="auto"
            className="w-full"
          />
        </div>
        
        <div ref={afterAdRef} className="ad-template-after">
          <AdBanner 
            adSlot={afterCanvasSlot}
            adFormat="auto"
            className="w-full"
          />
        </div>
      </div>
    </div>
  )
}

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