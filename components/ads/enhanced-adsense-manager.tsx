"use client"

import { useEffect, useRef, useState } from 'react'

interface EnhancedAdSenseProps {
  adSlot: string
  adFormat?: 'auto' | 'horizontal' | 'vertical' | 'rectangle'
  fullWidthResponsive?: boolean
  className?: string
  persistent?: boolean
  style?: React.CSSProperties
}

// Global ad instance tracker for persistent ads
const persistentAdInstances = new Map<string, boolean>()

export function EnhancedAdSense({
  adSlot,
  adFormat = 'auto',
  fullWidthResponsive = true,
  className = '',
  persistent = false,
  style
}: EnhancedAdSenseProps) {
  const adRef = useRef<HTMLModElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID

  useEffect(() => {
    if (!publisherId) return

    // For persistent ads, check if already initialized
    if (persistent && persistentAdInstances.has(adSlot)) {
      setIsLoaded(true)
      return
    }

    try {
      // Wait for AdSense script to load
      const checkAdSense = setInterval(() => {
        if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
          clearInterval(checkAdSense)

          // Initialize ad if not already pushed
          if (adRef.current && !isLoaded) {
            try {
              ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({})
              setIsLoaded(true)

              // Mark as initialized for persistent ads
              if (persistent) {
                persistentAdInstances.set(adSlot, true)
              }
            } catch (error) {
              console.error('AdSense error:', error)
            }
          }
        }
      }, 100)

      // Cleanup after 5 seconds if not loaded
      const timeout = setTimeout(() => clearInterval(checkAdSense), 5000)

      return () => {
        clearInterval(checkAdSense)
        clearTimeout(timeout)
      }
    } catch (error) {
      console.error('AdSense initialization error:', error)
    }
  }, [publisherId, adSlot, isLoaded, persistent])

  if (!publisherId) return null

  return (
    <div className={`adsense-container ${className}`} style={style}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{
          display: 'block',
          ...style
        }}
        data-ad-client={publisherId}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive ? 'true' : 'false'}
      />
    </div>
  )
}
