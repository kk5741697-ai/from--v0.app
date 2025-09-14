"use client"

import * as React from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"
import { StableSheet, StableSheetContent, StableSheetHeader, StableSheetTitle } from "@/components/ui/stable-sheet"

interface MobileOptionPanelProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

export function MobileOptionPanel({
  isOpen,
  onOpenChange,
  title,
  icon,
  children,
  footer,
  className,
}: MobileOptionPanelProps) {
  // Prevent panel from closing during form interactions
  const [isInteracting, setIsInteracting] = React.useState(false)

  const handleOpenChange = React.useCallback(
    (open: boolean) => {
      if (!isInteracting) {
        onOpenChange(open)
      }
    },
    [onOpenChange, isInteracting],
  )

  // Handle form interaction events
  const handleFormInteraction = React.useCallback((interacting: boolean) => {
    setIsInteracting(interacting)
  }, [])

  return (
    <StableSheet open={isOpen} onOpenChange={handleOpenChange}>
      <StableSheetContent side="bottom" className={`h-[80vh] sm:h-[85vh] p-0 ${className || ""}`}>
        <StableSheetHeader className="px-6 py-4 border-b bg-gray-50 flex-shrink-0">
          <StableSheetTitle className="flex items-center space-x-2">
            {icon || <Settings className="h-5 w-5 text-gray-600" />}
            <span>{title}</span>
          </StableSheetTitle>
        </StableSheetHeader>

        <ScrollArea className="flex-1 h-full px-2">
          <div
            className="p-4 sm:p-6 space-y-4 sm:space-y-6"
            onFocus={() => handleFormInteraction(true)}
            onBlur={() => setTimeout(() => handleFormInteraction(false), 100)}
            onPointerDown={() => handleFormInteraction(true)}
            onPointerUp={() => setTimeout(() => handleFormInteraction(false), 100)}
          >
            {children}
          </div>
        </ScrollArea>

        {footer && <div className="p-3 sm:p-4 border-t bg-white flex-shrink-0">{footer}</div>}
      </StableSheetContent>
    </StableSheet>
  )
}

// Trigger button component
interface MobileOptionTriggerProps {
  onClick: () => void
  icon?: React.ReactNode
  label?: string
  className?: string
}

export function MobileOptionTrigger({ onClick, icon, label = "Settings", className }: MobileOptionTriggerProps) {
  return (
    <Button variant="outline" size="sm" onClick={onClick} className={`lg:hidden touch-friendly ${className || ""}`}>
      {icon || <Settings className="h-4 w-4" />}
      {label && <span className="ml-2">{label}</span>}
    </Button>
  )
}
