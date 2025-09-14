"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Globe, 
  Download, 
  Copy,
  RefreshCw,
  Settings,
  Shield,
  Wifi,
  Server
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { AdBanner } from "@/components/ads/ad-banner"
import { MobileOptionPanel } from "@/components/mobile-option-panel"

interface NetworkToolsLayoutProps {
  title: string
  description: string
  icon: any
  toolType: string
  processFunction: (input: string, options: any) => Promise<{ success: boolean; result?: any; error?: string }>
  options?: any[]
  maxFiles?: number
  supportedFormats?: string[]
  outputFormats?: string[]
  richContent?: React.ReactNode
  children?: React.ReactNode
}

export function NetworkToolsLayout({
  title,
  description,
  icon: Icon,
  toolType,
  processFunction,
  options = [],
  maxFiles = 0,
  supportedFormats = [],
  outputFormats = ["json", "txt"],
  richContent,
  children
}: NetworkToolsLayoutProps) {
  const [input, setInput] = useState("")
  const [result, setResult] = useState<any>(null)
  const [toolOptions, setToolOptions] = useState<Record<string, any>>({})
  const [isProcessing, setIsProcessing] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  // Initialize options with defaults
  useEffect(() => {
    const defaultOptions: Record<string, any> = {}
    options.forEach(option => {
      defaultOptions[option.key] = option.defaultValue
    })
    setToolOptions(defaultOptions)
  }, [options])

  const processInput = async () => {
    if (!input.trim()) return

    setIsProcessing(true)

    try {
      const response = await processFunction(input, toolOptions)
      
      if (response.success) {
        setResult(response.result)
        toast({
          title: "Analysis complete",
          description: "Network analysis completed successfully"
        })
      } else {
        toast({
          title: "Analysis failed",
          description: response.error || "Failed to analyze network data",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const copyResult = () => {
    if (!result) return
    
    const resultText = typeof result === 'string' ? result : JSON.stringify(result, null, 2)
    navigator.clipboard.writeText(resultText)
    toast({
      title: "Copied to clipboard",
      description: "Analysis result copied successfully"
    })
  }

  const downloadResult = () => {
    if (!result) return
    
    const resultText = typeof result === 'string' ? result : JSON.stringify(result, null, 2)
    const blob = new Blob([resultText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `network-analysis.${outputFormats[0]}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header />
      </div>

      {/* Fixed Tools Header */}
      <div className="fixed top-16 left-0 right-0 z-40 tools-header bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-3 lg:mr-80 xl:mr-96">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Icon className="h-5 w-5 text-blue-600" />
              <h1 className="text-lg lg:text-xl font-semibold text-gray-900">{title}</h1>
              <Badge variant="secondary" className="hidden sm:inline-flex">Network Tool</Badge>
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
          <div className="container mx-auto px-4 py-3 lg:mr-80 xl:mr-96">
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
        <div className="canvas bg-gray-50 min-h-[60vh] lg:mr-80 xl:mr-96">
          <div className="container mx-auto px-4 py-6">
            {children ? (
              children
            ) : (
              <div className="max-w-2xl mx-auto space-y-6">
                {/* Network Input */}
                <Card>
                  <CardHeader>
                    <CardTitle>Network Analysis Input</CardTitle>
                    <CardDescription>Enter URL, IP address, or domain for analysis</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="network-input">Target</Label>
                      <Input
                        id="network-input"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="example.com or 192.168.1.1"
                        className="text-lg"
                      />
                    </div>
                    
                    <Button 
                      onClick={processInput}
                      disabled={isProcessing || !input.trim()}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      size="lg"
                    >
                      {isProcessing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Icon className="h-4 w-4 mr-2" />
                          Analyze Network
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Results */}
                {result && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Analysis Results</CardTitle>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={copyResult}>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy
                          </Button>
                          <Button variant="outline" size="sm" onClick={downloadResult}>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <pre className="text-sm overflow-auto">
                          {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Unified After Canvas Ad */}
        <div className="unified-after-canvas bg-white border-t">
          <div className="container mx-auto px-4 py-3 lg:mr-80 xl:mr-96">
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
        <div className="hidden lg:flex w-80 xl:w-96 bg-white border-l shadow-lg flex-col fixed top-32 bottom-0 right-0 z-30">
          <div className="px-6 py-4 border-b bg-gray-50 flex-shrink-0">
            <div className="flex items-center space-x-2">
              <Icon className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Network Options</h2>
            </div>
            <p className="text-sm text-gray-600 mt-1">Configure analysis settings</p>
          </div>

          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full px-2">
              <div className="p-6 space-y-6">
                {options.map((option) => (
                  <div key={option.key} className="space-y-2">
                    <Label className="text-sm font-medium">{option.label}</Label>
                    {/* Option controls would go here */}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="p-4 lg:p-6 border-t bg-gray-50 space-y-3 flex-shrink-0">
            <Button 
              onClick={processInput}
              disabled={isProcessing || !input.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 lg:py-3 text-sm lg:text-base font-semibold"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <Icon className="h-4 w-4 mr-2" />
                  Analyze Network
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Options Panel */}
        <MobileOptionPanel
          isOpen={isMobileSidebarOpen}
          onOpenChange={setIsMobileSidebarOpen}
          title={`${title} Options`}
          icon={<Icon className="h-5 w-5 text-blue-600" />}
        >
          <div className="space-y-6">
            {options.map((option) => (
              <div key={option.key} className="space-y-2">
                <Label className="text-sm font-medium">{option.label}</Label>
                {/* Option controls would go here */}
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