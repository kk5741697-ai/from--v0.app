"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Copy, 
  Download, 
  Upload, 
  RefreshCw,
  Settings,
  FileText,
  AlertCircle,
  CheckCircle
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { AdBanner } from "@/components/ads/ad-banner"
import { MobileOptionPanel } from "@/components/mobile-option-panel"

interface TextToolsLayoutProps {
  title: string
  description: string
  icon: any
  placeholder: string
  outputPlaceholder: string
  processFunction: (input: string, options: any) => { output: string; error?: string; stats?: any }
  validateFunction?: (input: string) => { isValid: boolean; error?: string }
  options?: any[]
  examples?: Array<{ name: string; content: string }>
  fileExtensions?: string[]
  richContent?: React.ReactNode
}

export function TextToolsLayout({
  title,
  description,
  icon: Icon,
  placeholder,
  outputPlaceholder,
  processFunction,
  validateFunction,
  options = [],
  examples = [],
  fileExtensions = [".txt"],
  richContent
}: TextToolsLayoutProps) {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [autoUpdate, setAutoUpdate] = useState(true)
  const [error, setError] = useState("")
  const [stats, setStats] = useState<any>(null)
  const [toolOptions, setToolOptions] = useState<Record<string, any>>({})
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  // Initialize options with defaults
  useEffect(() => {
    const defaultOptions: Record<string, any> = {}
    options.forEach(option => {
      defaultOptions[option.key] = option.defaultValue
    })
    setToolOptions(defaultOptions)
  }, [options])

  useEffect(() => {
    if (autoUpdate && input.trim()) {
      processText()
    } else if (!input.trim()) {
      setOutput("")
      setError("")
      setStats(null)
    }
  }, [input, autoUpdate, toolOptions])

  const processText = () => {
    if (!input.trim()) {
      setOutput("")
      setError("")
      setStats(null)
      return
    }

    if (validateFunction) {
      const validation = validateFunction(input)
      if (!validation.isValid) {
        setError(validation.error || "Invalid input")
        setOutput("")
        setStats(null)
        return
      }
    }

    try {
      const result = processFunction(input, toolOptions)
      setOutput(result.output)
      setError(result.error || "")
      setStats(result.stats)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Processing failed")
      setOutput("")
      setStats(null)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied to clipboard",
        description: "Text has been copied successfully"
      })
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const loadExample = (exampleContent: string) => {
    setInput(exampleContent)
  }

  const renderOptionControl = (option: any) => {
    const shouldShow = !option.condition || option.condition(toolOptions)
    if (!shouldShow) return null

    switch (option.type) {
      case "select":
        return (
          <Select
            value={toolOptions[option.key]?.toString()}
            onValueChange={(value) => setToolOptions(prev => ({ ...prev, [option.key]: value }))}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {option.selectOptions?.map((opt: any) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={toolOptions[option.key] || false}
              onCheckedChange={(checked) => setToolOptions(prev => ({ ...prev, [option.key]: checked }))}
            />
            <span className="text-sm">{option.label}</span>
          </div>
        )

      case "slider":
        return (
          <div className="space-y-2">
            <Slider
              value={[toolOptions[option.key] || option.defaultValue]}
              onValueChange={([value]) => setToolOptions(prev => ({ ...prev, [option.key]: value }))}
              min={option.min}
              max={option.max}
              step={option.step}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{option.min}</span>
              <span className="font-medium bg-gray-100 px-2 py-1 rounded">
                {toolOptions[option.key] || option.defaultValue}
              </span>
              <span>{option.max}</span>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  // Group options by section
  const groupedOptions = options.reduce((groups, option) => {
    const section = option.section || "General"
    if (!groups[section]) groups[section] = []
    groups[section].push(option)
    return groups
  }, {} as Record<string, any[]>)

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header />
      </div>

      {/* Fixed Tools Header */}
      <div className="fixed top-16 left-0 right-0 z-40 tools-header bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Icon className="h-5 w-5 text-green-600" />
              <h1 className="text-lg lg:text-xl font-semibold text-gray-900">{title}</h1>
              <Badge variant="secondary" className="hidden sm:inline-flex">Text Mode</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => setInput("")}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsMobileSidebarOpen(true)}
                className="lg:hidden"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area with proper spacing */}
      <div className="pt-32 min-h-screen">
        {/* Unified Before Canvas Ad */}
        <div className="unified-before-canvas bg-white border-b">
          <div className="container mx-auto px-4 py-3">
            <AdBanner 
              adSlot="unified-before-canvas"
              adFormat="auto"
              className="max-w-4xl mx-auto"
              mobileOptimized={true}
              persistent={true}
            />
          </div>
        </div>

        {/* Canvas Area with proper responsive margins */}
        <div className="canvas bg-gray-50 min-h-[60vh]">
          <div className="container mx-auto px-4 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Input Panel */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Input</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="auto-update"
                        checked={autoUpdate}
                        onCheckedChange={setAutoUpdate}
                      />
                      <Label htmlFor="auto-update" className="text-sm">Auto Process</Label>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={placeholder}
                    className="min-h-[400px] font-mono text-sm resize-none"
                  />
                  <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                    <span>Lines: {input.split('\n').length} | Chars: {input.length}</span>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(input)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => downloadFile(input, `input${fileExtensions[0]}`)}>
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Output Panel */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Output</CardTitle>
                </CardHeader>
                <CardContent>
                  {error ? (
                    <div className="min-h-[400px] flex items-center justify-center text-red-500 bg-red-50 rounded border">
                      <div className="text-center">
                        <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                        <p>{error}</p>
                      </div>
                    </div>
                  ) : (
                    <Textarea
                      value={output}
                      readOnly
                      placeholder={outputPlaceholder}
                      className="min-h-[400px] font-mono text-sm resize-none"
                    />
                  )}
                  <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                    <span>Lines: {output.split('\n').length} | Chars: {output.length}</span>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(output)} disabled={!output}>
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => downloadFile(output, `output${fileExtensions[0]}`)} disabled={!output}>
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Process Button */}
            <div className="text-center mb-8 lg:hidden">
              <Button 
                onClick={processText}
                disabled={!input.trim()}
                className="bg-green-600 hover:bg-green-700 text-white px-8"
                size="lg"
              >
                <Icon className="h-4 w-4 mr-2" />
                Process Text
              </Button>
            </div>

            {/* Stats Display */}
            {stats && (
              <Card className="max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle>Processing Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.entries(stats).map(([key, value]) => (
                      <div key={key} className="text-center">
                        <div className="text-xl lg:text-2xl font-bold text-gray-900">{value}</div>
                        <div className="text-sm text-gray-600">{key}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Examples */}
            {examples.length > 0 && (
              <div className="max-w-4xl mx-auto mt-8">
                <h3 className="text-lg font-semibold mb-4">Examples</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {examples.map((example, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      onClick={() => loadExample(example.content)}
                      className="h-auto p-4 text-left justify-start"
                    >
                      <div>
                        <div className="font-medium">{example.name}</div>
                        <div className="text-xs text-gray-500 mt-1 truncate">
                          {example.content.substring(0, 50)}...
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Unified After Canvas Ad */}
        <div className="unified-after-canvas bg-white border-t">
          <div className="container mx-auto px-4 py-3">
            <AdBanner 
              adSlot="unified-after-canvas"
              adFormat="auto"
              className="max-w-4xl mx-auto"
              mobileOptimized={true}
              persistent={true}
            />
          </div>
        </div>

        {/* Fixed Desktop Right Sidebar */}
        <div className="hidden lg:flex w-96 bg-white border-l shadow-lg flex-col fixed top-32 bottom-0 right-0 z-30">
          <div className="px-6 py-4 border-b bg-gray-50 flex-shrink-0">
            <div className="flex items-center space-x-2">
              <Icon className="h-5 w-5 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-900">Text Settings</h2>
            </div>
            <p className="text-sm text-gray-600 mt-1">Configure processing options</p>
          </div>

          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-6 space-y-6">
                {Object.entries(groupedOptions).map(([section, sectionOptions]) => (
                  <div key={section} className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <div className="h-px bg-gray-200 flex-1"></div>
                      <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{section}</Label>
                      <div className="h-px bg-gray-200 flex-1"></div>
                    </div>
                    {sectionOptions.map((option) => (
                      <div key={option.key} className="space-y-2">
                        <Label className="text-sm font-medium">{option.label}</Label>
                        {renderOptionControl(option)}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="p-6 border-t bg-gray-50 space-y-3 flex-shrink-0">
            <Button 
              onClick={processText}
              disabled={!input.trim()}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-base font-semibold"
              size="lg"
            >
              <Icon className="h-4 w-4 mr-2" />
              Process Text
            </Button>

            {/* Auto Update Toggle */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="auto-update-sidebar"
                checked={autoUpdate}
                onCheckedChange={setAutoUpdate}
              />
              <Label htmlFor="auto-update-sidebar" className="text-sm">Auto Process</Label>
            </div>
          </div>
        </div>

        {/* Mobile Options Panel */}
        <MobileOptionPanel
          isOpen={isMobileSidebarOpen}
          onOpenChange={setIsMobileSidebarOpen}
          title={`${title} Options`}
          icon={<Icon className="h-5 w-5 text-green-600" />}
          footer={
            <Button 
              onClick={processText}
              disabled={!input.trim()}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Process Text
            </Button>
          }
        >
          <div className="space-y-6">
            {Object.entries(groupedOptions).map(([section, sectionOptions]) => (
              <div key={section} className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="h-px bg-gray-200 flex-1"></div>
                  <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{section}</Label>
                  <div className="h-px bg-gray-200 flex-1"></div>
                </div>
                {sectionOptions.map((option) => (
                  <div key={option.key} className="space-y-2">
                    <Label className="text-sm font-medium">{option.label}</Label>
                    {renderOptionControl(option)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </MobileOptionPanel>
      </div>

      {/* Rich Educational Content */}
      {richContent && (
        <div className="bg-gray-50">
          {richContent}
        </div>
      )}
    </div>
  )
}