"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

// Stable Input that prevents event bubbling
export const StableInput = React.forwardRef<HTMLInputElement, React.ComponentProps<typeof Input>>(
  ({ onFocus, onBlur, onChange, ...props }, ref) => {
    const handleFocus = React.useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        e.stopPropagation()
        onFocus?.(e)
      },
      [onFocus],
    )

    const handleBlur = React.useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        e.stopPropagation()
        onBlur?.(e)
      },
      [onBlur],
    )

    const handleChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation()
        onChange?.(e)
      },
      [onChange],
    )

    return <Input ref={ref} onFocus={handleFocus} onBlur={handleBlur} onChange={handleChange} {...props} />
  },
)
StableInput.displayName = "StableInput"

// Stable Select that prevents event bubbling
interface StableSelectProps {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
  placeholder?: string
  className?: string
}

export function StableSelect({ value, onValueChange, children, placeholder, className }: StableSelectProps) {
  const handleValueChange = React.useCallback(
    (newValue: string) => {
      onValueChange(newValue)
    },
    [onValueChange],
  )

  return (
    <Select value={value} onValueChange={handleValueChange}>
      <SelectTrigger
        className={className}
        onPointerDown={(e) => e.stopPropagation()}
        onFocus={(e) => e.stopPropagation()}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent onPointerDown={(e) => e.stopPropagation()} onFocus={(e) => e.stopPropagation()}>
        {children}
      </SelectContent>
    </Select>
  )
}

// Stable Slider that prevents event bubbling
interface StableSliderProps {
  value: number[]
  onValueChange: (value: number[]) => void
  min?: number
  max?: number
  step?: number
  className?: string
}

export function StableSlider({ value, onValueChange, min = 0, max = 100, step = 1, className }: StableSliderProps) {
  const handleValueChange = React.useCallback(
    (newValue: number[]) => {
      onValueChange(newValue)
    },
    [onValueChange],
  )

  return (
    <div
      className={className}
      onPointerDown={(e) => e.stopPropagation()}
      onPointerMove={(e) => e.stopPropagation()}
      onPointerUp={(e) => e.stopPropagation()}
    >
      <Slider value={value} onValueChange={handleValueChange} min={min} max={max} step={step} />
    </div>
  )
}

// Stable Checkbox that prevents event bubbling
interface StableCheckboxProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  label?: string
  className?: string
}

export function StableCheckbox({ checked, onCheckedChange, label, className }: StableCheckboxProps) {
  const handleCheckedChange = React.useCallback(
    (newChecked: boolean) => {
      onCheckedChange(newChecked)
    },
    [onCheckedChange],
  )

  return (
    <div className={`flex items-center space-x-2 ${className || ""}`} onPointerDown={(e) => e.stopPropagation()}>
      <Checkbox checked={checked} onCheckedChange={handleCheckedChange} />
      {label && <Label className="text-sm font-medium">{label}</Label>}
    </div>
  )
}

// Form section wrapper
interface StableFormSectionProps {
  title: string
  children: React.ReactNode
  className?: string
}

export function StableFormSection({ title, children, className }: StableFormSectionProps) {
  return (
    <div className={`space-y-4 ${className || ""}`}>
      <div className="flex items-center space-x-2">
        <div className="h-px bg-gray-200 flex-1"></div>
        <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</Label>
        <div className="h-px bg-gray-200 flex-1"></div>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  )
}
