"use client"

import { useEffect, useRef, useState } from "react"
import { APP_CONFIG } from "@/lib/config"

interface AdBannerProps {
  adSlot?: string
  adFormat?: "auto" | "rectangle" | "vertical" | "horizontal" | "fluid"
  fullWidthResponsive?: boolean
  className?: string
  style?: React.CSSProperties
  mobileOptimized?: boolean
  sticky?: boolean
}

export function AdBanner({
  adSlot = "1234567890",
  adFormat = "auto",
  fullWidthResponsive = true,
  className = "",
  style = {},
  mobileOptimized = false,
  sticky = false
}: AdBannerProps) {
  const [isClient, setIsClient] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [shouldShowAd, setShouldShowAd] = useState(false)
  const adRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    setIsClient(true)
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    // Enhanced bounce protection for AdSense policy compliance
    const sessionData = {
      startTime: parseInt(sessionStorage.getItem('sessionStartTime') || '0'),
      pageViews: parseInt(sessionStorage.getItem('pageViews') || '0'),
      toolUsage: parseInt(sessionStorage.getItem('toolUsage') || '0'),
      fileUploads: parseInt(sessionStorage.getItem('fileUploads') || '0'),
      timeSpent: parseInt(sessionStorage.getItem('timeSpent') || '0')
    }
    
    if (!sessionData.startTime) {
      sessionData.startTime = Date.now()
      sessionStorage.setItem('sessionStartTime', sessionData.startTime.toString())
    }
    
    const currentTime = Date.now()
    const sessionDuration = currentTime - sessionData.startTime
    
    // Stricter bounce protection for tools website
    const shouldShow = (
      sessionDuration > 30000 || // 30 seconds minimum
      sessionData.pageViews > 2 || // Multiple page views
      sessionData.toolUsage > 0 || // Used tools
      sessionData.fileUploads > 0 // Uploaded files
    )
    
    setShouldShowAd(shouldShow)
    
    // Track page view
    sessionData.pageViews++
    sessionStorage.setItem('pageViews', sessionData.pageViews.toString())
    
    // Enhanced tracking for meaningful engagement
    const trackToolUsage = () => {
      sessionData.toolUsage++
      sessionStorage.setItem('toolUsage', sessionData.toolUsage.toString())
    }
    
    const trackFileUpload = () => {
      sessionData.fileUploads++
      sessionStorage.setItem('fileUploads', sessionData.fileUploads.toString())
      setShouldShowAd(true) // Show ads after file upload
    }
    
    // Listen for file uploads and tool actions
    document.addEventListener('change', (e) => {
      if (e.target instanceof HTMLInputElement && e.target.type === 'file') {
        trackFileUpload()
      }
    })
    
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement
      if (target.closest('[data-tool-action]') || 
          target.closest('button[type="submit"]') ||
          target.textContent?.includes('Process') ||
          target.textContent?.includes('Generate') ||
          target.textContent?.includes('Convert')) {
        trackToolUsage()
        setShouldShowAd(true) // Show ads after tool interaction
      }
    })
    
    // Track time spent on page
    const timeTracker = setInterval(() => {
      sessionData.timeSpent += 5000 // 5 seconds
      sessionStorage.setItem('timeSpent', sessionData.timeSpent.toString())
      
      // Show ads after user spends significant time
      if (sessionData.timeSpent > 20000) { // 20 seconds
        setShouldShowAd(true)
      }
    }, 5000)
    
    return () => clearInterval(timeTracker)
  }, [])

  useEffect(() => {
    // Initialize ads only when appropriate and avoid duplicate requests
    if (isClient && adRef.current && APP_CONFIG.enableAds && APP_CONFIG.adsensePublisherId && shouldShowAd) {
      const adElement = adRef.current.querySelector('.adsbygoogle')
      
      // Only initialize if not already initialized
      if (adElement && !adElement.getAttribute('data-adsbygoogle-status')) {
        try {
          (window as any).adsbygoogle = (window as any).adsbygoogle || []
          ;(window as any).adsbygoogle.push({})
        } catch (error) {
          console.warn('AdSense initialization failed:', error)
        }
      }
    }
  }, [isClient, shouldShowAd])

  // Enhanced development placeholder
  if (process.env.NODE_ENV === "development") {
    return (
      <div className={`bg-gray-100 border border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-600 text-sm min-h-[90px] flex items-center justify-center ${className}`}>
        <div>
          <div className="text-gray-700 font-medium mb-1">AdSense Ad Space</div>
          <div className="text-xs text-gray-500">Slot: {adSlot}</div>
          <div className="text-xs text-gray-400 mt-1">Publisher: ca-pub-4755003409431265</div>
          <div className="text-xs text-gray-400">Format: {mobileOptimized && isMobile ? 'Mobile Optimized' : adFormat}</div>
        </div>
      </div>
    )
  }

  // Don't render if ads are disabled or user hasn't engaged
  if (!APP_CONFIG.enableAds || !APP_CONFIG.adsensePublisherId || !shouldShowAd) {
    return null
  }

  if (!isClient) {
    return (
      <div className={`min-h-[90px] bg-gray-50 rounded-lg ${className}`} style={style}>
        <div className="flex items-center justify-center h-full text-gray-400 text-sm">
          Advertisement
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={adRef}
      className={`ad-container ${isMobile ? 'min-h-[60px]' : 'min-h-[90px]'} flex items-center justify-center ${sticky ? 'sticky top-4' : ''} ${className}`} 
      style={style}
    >
      <ins
        className="adsbygoogle"
        style={{
          display: "block",
          textAlign: "center",
          minHeight: isMobile ? "60px" : "90px",
          width: "100%",
          ...style
        }}
        data-ad-client="ca-pub-4755003409431265"
        data-ad-slot={adSlot}
        data-ad-format={mobileOptimized && isMobile ? "fluid" : adFormat}
        data-full-width-responsive={fullWidthResponsive.toString()}
        data-ad-channel={isMobile ? "mobile" : "desktop"}
        data-adtest={process.env.NODE_ENV === "development" ? "on" : "off"}
      />
    </div>
  )
}

      try {
        (window as any).adsbygoogle = (window as any).adsbygoogle || []
        ;(window as any).adsbygoogle.push({})
      } catch (error) {
        console.warn('AdSense initialization failed:', error)
      }
    }
  }, [isClient, shouldShowAd])

  // Don't render if ads are disabled
  if (!APP_CONFIG.enableAds || !APP_CONFIG.adsensePublisherId || !shouldShowAd) {
    return null
  }

  if (!isClient) {
    return (
      <div className={`min-h-[90px] bg-gray-50 rounded-lg ${className}`} style={style}>
        <div className="flex items-center justify-center h-full text-gray-400 text-sm">
          Advertisement
        </div>
      </div>
    )
  }

  if (process.env.NODE_ENV === "development") {
    return (
      <div className={`bg-gray-100 border border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-600 text-sm min-h-[90px] flex items-center justify-center ${className}`}>
        <div>
          <div className="text-gray-700 font-medium mb-1">AdSense Ad Space</div>
          <div className="text-xs text-gray-500">Slot: {adSlot}</div>
          <div className="text-xs text-gray-400 mt-1">Publisher: ca-pub-4755003409431265</div>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={adRef}
      className={`ad-container ${isMobile ? 'min-h-[60px]' : 'min-h-[90px]'} flex items-center justify-center ${sticky ? 'sticky top-4' : ''} ${className}`} 
      style={style}
    >
      <ins
        className="adsbygoogle"
        style={{
          display: "block",
          textAlign: "center",
          minHeight: isMobile ? "60px" : "90px",
          width: "100%",
          ...style
        }}
        data-ad-client="ca-pub-4755003409431265"
        data-ad-slot={adSlot}
        data-ad-format={mobileOptimized && isMobile ? "fluid" : adFormat}
        data-full-width-responsive={fullWidthResponsive.toString()}
        data-ad-channel={isMobile ? "mobile" : "desktop"}
        data-adtest={process.env.NODE_ENV === "development" ? "on" : "off"}
      />
    </div>
  )
}