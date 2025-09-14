"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  TrendingUp, 
  Download, 
  Copy,
  RefreshCw,
  Settings,
  Search,
  Globe,
  BarChart
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { AdBanner } from "@/components/ads/ad-banner"
import { MobileOptionPanel } from "@/components/mobile-option-panel"

interface SEOToolsLayoutProps {
  title: string
  description: string
  icon: any
  toolType: string
  processFunction: (input: string, options: any) => { output: string; error?: string; stats?: any }
  options?: any[]
  maxFiles?: number
  supportedFormats?: string[]
  outputFormats?: string[]
  richContent?: React.ReactNode
  children?: React.ReactNode
}

export function SEOToolsLayout({
  title,
  description,
  icon: Icon,
  toolType,
  processFunction,
  options = [],
  maxFiles = 0,
  supportedFormats = [],
  outputFormats = ["html", "xml", "txt"],
  richContent,
  children
}: SEOToolsLayoutProps) {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [toolOptions, setToolOptions] = useState<Record<string, any>>({})
  const [isProcessing, setIsProcessing] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [stats, setStats] = useState<any>(null)

  // Initialize options with defaults
  useEffect(() => {
    const defaultOptions: Record<string, any> = {}
    options.forEach(option => {
      defaultOptions[option.key] = option.defaultValue
    })
    setToolOptions(defaultOptions)
  }, [options])

  const processContent = async () => {
    if (!input.trim()) return

    setIsProcessing(true)

    try {
      const result = processFunction(input, toolOptions)
      setOutput(result.output)
      setStats(result.stats)
      
      if (result.error) {
        toast({
          title: "Processing warning",
          description: result.error,
          variant: "destructive"
        })
      } else {
        toast({
          title: "Processing complete",
          description: "Your content has been processed successfully"
        })
      }
    } catch (error) {
      toast({
        title: "Processing failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied to clipboard",
        description: "Content has been copied successfully"
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
              <Icon className="h-5 w-5 text-cyan-600" />
              <h1 className="text-lg lg:text-xl font-semibold text-gray-900">{title}</h1>
              <Badge variant="secondary" className="hidden sm:inline-flex">SEO Tool</Badge>
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
        <div className="canvas bg-gray-50 min-h-[60vh] lg:mr-96">
          <div className="container mx-auto px-4 py-6">
            {children ? (
              children
            ) : (
              <div className="max-w-4xl mx-auto space-y-6">
                {/* SEO Input Form */}
                <Card>
                  <CardHeader>
                    <CardTitle>SEO Content Input</CardTitle>
                    <CardDescription>Enter your content for SEO analysis and optimization</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="seo-input">Content</Label>
                      <Textarea
                        id="seo-input"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Enter your content, URL, or data for SEO processing..."
                        rows={8}
                        className="font-mono text-sm"
                      />
                    </div>
                    
                    <Button 
                      onClick={processContent}
                      disabled={isProcessing || !input.trim()}
                      className="w-full bg-cyan-600 hover:bg-cyan-700"
                      size="lg"
                    >
                      {isProcessing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <Icon className="h-4 w-4 mr-2" />
                          Analyze & Optimize
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Output */}
                {output && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Generated Output</CardTitle>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => copyToClipboard(output)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => downloadFile(output, `seo-output.${outputFormats[0]}`)}>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={output}
                        readOnly
                        className="min-h-[300px] font-mono text-sm"
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Stats */}
                {stats && (
                  <Card>
                    <CardHeader>
                      <CardTitle>SEO Analysis</CardTitle>
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
              </div>
            )}
          </div>
        </div>

        {/* Unified After Canvas Ad */}
        <div className="unified-after-canvas bg-white border-t lg:mr-96">
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
              <Icon className="h-5 w-5 text-cyan-600" />
              <h2 className="text-lg font-semibold text-gray-900">SEO Options</h2>
            </div>
            <p className="text-sm text-gray-600 mt-1">Configure SEO settings</p>
          </div>

          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
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

          <div className="p-6 border-t bg-gray-50 space-y-3 flex-shrink-0">
            <Button 
              onClick={processContent}
              disabled={isProcessing || !input.trim()}
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-3 text-base font-semibold"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Icon className="h-4 w-4 mr-2" />
                  Analyze & Optimize
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
          icon={<Icon className="h-5 w-5 text-cyan-600" />}
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
        <div className="bg-gray-50 lg:mr-96">
          {richContent}
        </div>
      )}
    </div>
  )
}