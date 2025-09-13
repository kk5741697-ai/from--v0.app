"use client"

import { useState, useEffect, useRef } from "react"
import { APP_CONFIG } from "@/lib/config"

interface PersistentAdManagerProps {
  children: React.ReactNode
}

export function PersistentAdManager({ children }: PersistentAdManagerProps) {
  const [adsLoaded, setAdsLoaded] = useState(false)
  const beforeCanvasAdRef = useRef<HTMLDivElement>(null)
  const afterCanvasAdRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!APP_CONFIG.enableAds || adsLoaded) return

    // Initialize ads only once
    const initializeAds = () => {
      try {
        if (typeof window !== "undefined" && (window as any).adsbygoogle) {
          // Initialize before canvas ad
          if (beforeCanvasAdRef.current && !beforeCanvasAdRef.current.getAttribute('data-ad-loaded')) {
            (window as any).adsbygoogle.push({})
            beforeCanvasAdRef.current.setAttribute('data-ad-loaded', 'true')
          }

          // Initialize after canvas ad
          if (afterCanvasAdRef.current && !afterCanvasAdRef.current.getAttribute('data-ad-loaded')) {
            (window as any).adsbygoogle.push({})
            afterCanvasAdRef.current.setAttribute('data-ad-loaded', 'true')
          }

          setAdsLoaded(true)
        }
      } catch (error) {
        console.warn("Failed to initialize persistent ads:", error)
      }
    }

    // Wait for AdSense script to load
    if (typeof window !== "undefined") {
      if ((window as any).adsbygoogle) {
        initializeAds()
      } else {
        const checkAdSense = setInterval(() => {
          if ((window as any).adsbygoogle) {
            clearInterval(checkAdSense)
            initializeAds()
          }
        }, 100)

        // Cleanup after 10 seconds
        setTimeout(() => clearInterval(checkAdSense), 10000)
      }
    }
  }, [adsLoaded])

  return (
    <div className="persistent-ad-container">
      {/* Unified Before Canvas Ad */}
      <div 
        ref={beforeCanvasAdRef}
        className="ad-slot ad-before unified-before-canvas"
        style={{ display: APP_CONFIG.enableAds ? 'block' : 'none' }}
      >
        {APP_CONFIG.enableAds && (
          <ins
            className="adsbygoogle"
            style={{ display: "block", textAlign: "center" }}
            data-ad-client={APP_CONFIG.adsensePublisherId}
            data-ad-slot="unified-before-canvas"
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        )}
      </div>

      {children}

      {/* Unified After Canvas Ad */}
      <div 
        ref={afterCanvasAdRef}
        className="ad-slot ad-after unified-after-canvas"
        style={{ display: APP_CONFIG.enableAds ? 'block' : 'none' }}
      >
        {APP_CONFIG.enableAds && (
          <ins
            className="adsbygoogle"
            style={{ display: "block", textAlign: "center" }}
            data-ad-client={APP_CONFIG.adsensePublisherId}
            data-ad-slot="unified-after-canvas"
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        )}
      </div>
    </div>
  )
}