"use client"

import * as React from "react"

const MOBILE_BREAKPOINT = 768
const TABLET_BREAKPOINT = 1024

interface MobileState {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  orientation: "portrait" | "landscape"
  screenSize: { width: number; height: number }
}

export function useStableMobile() {
  const [state, setState] = React.useState<MobileState>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    orientation: "landscape",
    screenSize: { width: 1024, height: 768 },
  })

  // Debounced resize handler to prevent rapid state changes
  const updateState = React.useCallback(() => {
    if (typeof window === "undefined") return

    const width = window.innerWidth
    const height = window.innerHeight
    const isMobile = width < MOBILE_BREAKPOINT
    const isTablet = width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT
    const isDesktop = width >= TABLET_BREAKPOINT
    const orientation = width > height ? "landscape" : "portrait"

    setState({
      isMobile,
      isTablet,
      isDesktop,
      orientation,
      screenSize: { width, height },
    })
  }, [])

  // Debounced version to prevent excessive updates
  const debouncedUpdateState = React.useMemo(() => {
    let timeoutId: NodeJS.Timeout
    return () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(updateState, 150) // 150ms debounce
    }
  }, [updateState])

  React.useEffect(() => {
    updateState() // Initial call

    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const tabletQuery = window.matchMedia(`(max-width: ${TABLET_BREAKPOINT - 1}px)`)

    // Use both resize and media query listeners for better accuracy
    window.addEventListener("resize", debouncedUpdateState)
    mediaQuery.addEventListener("change", debouncedUpdateState)
    tabletQuery.addEventListener("change", debouncedUpdateState)

    return () => {
      window.removeEventListener("resize", debouncedUpdateState)
      mediaQuery.removeEventListener("change", debouncedUpdateState)
      tabletQuery.removeEventListener("change", debouncedUpdateState)
    }
  }, [debouncedUpdateState, updateState])

  return state
}

// Hook for managing mobile sidebar state with stability
export function useStableMobileSidebar(initialOpen = false) {
  const [isOpen, setIsOpen] = React.useState(initialOpen)
  const [isInteracting, setIsInteracting] = React.useState(false)
  const { isMobile } = useStableMobile()

  // Stable open/close handlers
  const open = React.useCallback(() => {
    if (isMobile) {
      setIsOpen(true)
    }
  }, [isMobile])

  const close = React.useCallback(() => {
    if (!isInteracting) {
      setIsOpen(false)
    }
  }, [isInteracting])

  const toggle = React.useCallback(() => {
    if (isMobile) {
      setIsOpen((prev) => !prev)
    }
  }, [isMobile])

  // Handle interaction state
  const startInteraction = React.useCallback(() => {
    setIsInteracting(true)
  }, [])

  const endInteraction = React.useCallback(() => {
    // Delay ending interaction to prevent immediate closure
    setTimeout(() => {
      setIsInteracting(false)
    }, 100)
  }, [])

  // Auto-close when switching to desktop
  React.useEffect(() => {
    if (!isMobile && isOpen) {
      setIsOpen(false)
    }
  }, [isMobile, isOpen])

  return {
    isOpen,
    setIsOpen,
    open,
    close,
    toggle,
    isInteracting,
    startInteraction,
    endInteraction,
    isMobile,
  }
}
