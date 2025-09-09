"use client"

import * as React from "react"
import * as SheetPrimitive from "@radix-ui/react-dialog"
import { XIcon } from "lucide-react"
import { cn } from "@/lib/utils"

// Stable context to prevent unnecessary re-renders
const StableSheetContext = React.createContext<{
  preventAutoClose: boolean
  setPreventAutoClose: (prevent: boolean) => void
} | null>(null)

function useStableSheet() {
  const context = React.useContext(StableSheetContext)
  if (!context) {
    throw new Error("useStableSheet must be used within a StableSheetProvider")
  }
  return context
}

function StableSheet({ children, open, onOpenChange, ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  const [preventAutoClose, setPreventAutoClose] = React.useState(false)
  const [internalOpen, setInternalOpen] = React.useState(open || false)

  // Debounced open change handler to prevent rapid toggling
  const debouncedOnOpenChange = React.useCallback(
    React.useMemo(() => {
      let timeoutId: NodeJS.Timeout
      return (newOpen: boolean) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          if (!preventAutoClose) {
            setInternalOpen(newOpen)
            onOpenChange?.(newOpen)
          }
        }, 50) // 50ms debounce
      }
    }, [onOpenChange, preventAutoClose]),
    [onOpenChange, preventAutoClose],
  )

  // Sync with external open prop
  React.useEffect(() => {
    if (open !== undefined && open !== internalOpen) {
      setInternalOpen(open)
    }
  }, [open, internalOpen])

  const contextValue = React.useMemo(
    () => ({
      preventAutoClose,
      setPreventAutoClose,
    }),
    [preventAutoClose],
  )

  return (
    <StableSheetContext.Provider value={contextValue}>
      <SheetPrimitive.Root data-slot="stable-sheet" open={internalOpen} onOpenChange={debouncedOnOpenChange} {...props}>
        {children}
      </SheetPrimitive.Root>
    </StableSheetContext.Provider>
  )
}

function StableSheetTrigger({ ...props }: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="stable-sheet-trigger" {...props} />
}

function StableSheetClose({ ...props }: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="stable-sheet-close" {...props} />
}

function StableSheetPortal({ ...props }: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="stable-sheet-portal" {...props} />
}

function StableSheetOverlay({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="stable-sheet-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className,
      )}
      {...props}
    />
  )
}

function StableSheetContent({
  className,
  children,
  side = "right",
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: "top" | "right" | "bottom" | "left"
}) {
  const { setPreventAutoClose } = useStableSheet()

  // Prevent closing when interacting with form elements
  const handleInteractionStart = React.useCallback(() => {
    setPreventAutoClose(true)
  }, [setPreventAutoClose])

  const handleInteractionEnd = React.useCallback(() => {
    // Delay re-enabling auto close to prevent immediate closure
    setTimeout(() => {
      setPreventAutoClose(false)
    }, 100)
  }, [setPreventAutoClose])

  return (
    <StableSheetPortal>
      <StableSheetOverlay />
      <SheetPrimitive.Content
        data-slot="stable-sheet-content"
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out fixed z-50 flex flex-col gap-4 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
          side === "right" &&
            "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
          side === "left" &&
            "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
          side === "top" &&
            "data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top inset-x-0 top-0 h-auto border-b",
          side === "bottom" &&
            "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom inset-x-0 bottom-0 h-auto border-t",
          className,
        )}
        onPointerDownOutside={(e) => {
          // Prevent closing when clicking on form elements
          const target = e.target as Element
          if (target.closest('input, select, textarea, button, [role="slider"], [role="combobox"]')) {
            e.preventDefault()
          }
        }}
        onFocusOutside={(e) => {
          // Prevent closing when focusing form elements
          const target = e.target as Element
          if (target.closest('input, select, textarea, button, [role="slider"], [role="combobox"]')) {
            e.preventDefault()
          }
        }}
        {...props}
      >
        <div
          onPointerDown={handleInteractionStart}
          onPointerUp={handleInteractionEnd}
          onFocus={handleInteractionStart}
          onBlur={handleInteractionEnd}
          className="h-full"
        >
          {children}
        </div>
        <SheetPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none">
          <XIcon className="size-4" />
          <span className="sr-only">Close</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </StableSheetPortal>
  )
}

function StableSheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="stable-sheet-header" className={cn("flex flex-col gap-1.5 p-4", className)} {...props} />
}

function StableSheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="stable-sheet-footer" className={cn("mt-auto flex flex-col gap-2 p-4", className)} {...props} />
}

function StableSheetTitle({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="stable-sheet-title"
      className={cn("text-foreground font-semibold", className)}
      {...props}
    />
  )
}

function StableSheetDescription({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="stable-sheet-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

export {
  StableSheet,
  StableSheetTrigger,
  StableSheetClose,
  StableSheetContent,
  StableSheetHeader,
  StableSheetFooter,
  StableSheetTitle,
  StableSheetDescription,
  useStableSheet,
}
