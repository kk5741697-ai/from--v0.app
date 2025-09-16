"use client"

import { useState, useCallback, useEffect } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  QrCode, 
  Download, 
  Copy,
  RefreshCw,
  Settings,
  Wifi,
  Mail,
  Phone,
  User,
  Link,
  FileText,
  Calendar,
  MapPin,
  CreditCard
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { AdBanner } from "@/components/ads/ad-banner"
import { MobileOptionPanel } from "@/components/mobile-option-panel"

interface QRCodeToolsLayoutProps {
  title: string
  description: string
  icon: any
  toolType: string
  processFunction: (files: any[], options: any) => Promise<{ success: boolean; qrDataURL?: string; error?: string }>
  options?: any[]
  maxFiles?: number
  allowBatchProcessing?: boolean
  supportedFormats?: string[]
  outputFormats?: string[]
  richContent?: React.ReactNode
  children?: React.ReactNode
}

const qrTypeOptions = [
  { value: "url", label: "Website URL", icon: Link },
  { value: "text", label: "Plain Text", icon: FileText },
  { value: "email", label: "Email", icon: Mail },
  { value: "phone", label: "Phone", icon: Phone },
  { value: "wifi", label: "WiFi", icon: Wifi },
  { value: "vcard", label: "Contact Card", icon: User },
  { value: "event", label: "Calendar Event", icon: Calendar },
  { value: "location", label: "GPS Location", icon: MapPin },
  { value: "payment", label: "Payment", icon: CreditCard },
]

export function QRCodeToolsLayout({
  title,
  description,
  icon: Icon,
  toolType,
  processFunction,
  options = [],
  maxFiles = 0,
  allowBatchProcessing = false,
  supportedFormats = [],
  outputFormats = ["png", "svg"],
  richContent,
  children
}: QRCodeToolsLayoutProps) {
  const [qrType, setQrType] = useState("url")
  const [content, setContent] = useState("")
  const [qrDataURL, setQrDataURL] = useState("")
  const [toolOptions, setToolOptions] = useState<Record<string, any>>({})
  const [isProcessing, setIsProcessing] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isToolInterfaceActive, setIsToolInterfaceActive] = useState(true) // QR tools are always active

  // QR-specific form data
  const [formData, setFormData] = useState({
    url: "",
    text: "",
    email: "",
    subject: "",
    body: "",
    phone: "",
    ssid: "",
    password: "",
    security: "WPA",
    hidden: false,
    firstName: "",
    lastName: "",
    organization: "",
    contactPhone: "",
    contactEmail: "",
    eventTitle: "",
    location: "",
    startDate: "",
    endDate: "",
    coordinates: "",
    amount: "",
    currency: "USD",
    description: ""
  })

  // Initialize options with defaults
  useEffect(() => {
    const defaultOptions: Record<string, any> = {}
    options.forEach(option => {
      defaultOptions[option.key] = option.defaultValue
    })
    setToolOptions(defaultOptions)
  }, [options])

  const generateQRCode = async () => {
    setIsProcessing(true)

    try {
      let qrContent = ""
      
      switch (qrType) {
        case "url":
          qrContent = formData.url
          break
        case "text":
          qrContent = formData.text
          break
        case "email":
          qrContent = `mailto:${formData.email}?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(formData.body)}`
          break
        case "phone":
          qrContent = `tel:${formData.phone}`
          break
        case "wifi":
          qrContent = `WIFI:T:${formData.security};S:${formData.ssid};P:${formData.password};H:${formData.hidden ? "true" : "false"};;`
          break
        case "vcard":
          qrContent = `BEGIN:VCARD\nVERSION:3.0\nFN:${formData.firstName} ${formData.lastName}\nORG:${formData.organization}\nTEL:${formData.contactPhone}\nEMAIL:${formData.contactEmail}\nEND:VCARD`
          break
        default:
          qrContent = content
      }

      const result = await processFunction([], { ...toolOptions, content: qrContent })

      if (result.success && result.qrDataURL) {
        setQrDataURL(result.qrDataURL)
        toast({
          title: "QR Code generated",
          description: "Your QR code is ready to download"
        })
      } else {
        toast({
          title: "Generation failed",
          description: result.error || "Failed to generate QR code",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadQRCode = () => {
    if (!qrDataURL) return
    
    const link = document.createElement("a")
    link.href = qrDataURL
    link.download = `qr-code-${qrType}.png`
    link.click()
    
    toast({
      title: "Download started",
      description: "QR code downloaded successfully"
    })
  }

  const copyQRCode = async () => {
    if (!qrDataURL) return
    
    try {
      const response = await fetch(qrDataURL)
      const blob = await response.blob()
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ])
      
      toast({
        title: "Copied to clipboard",
        description: "QR code image copied"
      })
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy QR code",
        variant: "destructive"
      })
    }
  }

  const renderQRForm = () => {
    switch (qrType) {
      case "url":
        return (
          <div>
            <Label htmlFor="url">Website URL</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com"
              value={formData.url}
              onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
            />
          </div>
        )

      case "text":
        return (
          <div>
            <Label htmlFor="text">Text Content</Label>
            <Textarea
              id="text"
              placeholder="Enter your text message..."
              value={formData.text}
              onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
              rows={4}
            />
          </div>
        )

      case "email":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="contact@example.com"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Email subject"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="body">Message</Label>
              <Textarea
                id="body"
                placeholder="Email message..."
                value={formData.body}
                onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
                rows={3}
              />
            </div>
          </div>
        )

      case "wifi":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="ssid">Network Name (SSID)</Label>
              <Input
                id="ssid"
                placeholder="MyWiFiNetwork"
                value={formData.ssid}
                onChange={(e) => setFormData(prev => ({ ...prev, ssid: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Network password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="security">Security Type</Label>
              <Select
                value={formData.security}
                onValueChange={(value) => setFormData(prev => ({ ...prev, security: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WPA">WPA/WPA2</SelectItem>
                  <SelectItem value="WEP">WEP</SelectItem>
                  <SelectItem value="nopass">No Password</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="hidden"
                checked={formData.hidden}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hidden: checked }))}
              />
              <Label htmlFor="hidden">Hidden Network</Label>
            </div>
          </div>
        )

      case "vcard":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="organization">Organization</Label>
              <Input
                id="organization"
                placeholder="Company Name"
                value={formData.organization}
                onChange={(e) => setFormData(prev => ({ ...prev, organization: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="contactPhone">Phone</Label>
              <Input
                id="contactPhone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={formData.contactPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="contactEmail">Email</Label>
              <Input
                id="contactEmail"
                type="email"
                placeholder="john@example.com"
                value={formData.contactEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
              />
            </div>
          </div>
        )

      default:
        return (
          <div>
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder="Enter content..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
            />
          </div>
        )
    }
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

      case "color":
        return (
          <Input
            type="color"
            value={toolOptions[option.key] || option.defaultValue}
            onChange={(e) => setToolOptions(prev => ({ ...prev, [option.key]: e.target.value }))}
            className="w-full h-10"
          />
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

      {/* Fixed QR Type Header */}
      <div className="fixed top-16 left-0 right-0 z-40 tools-header bg-white border-b shadow-sm tools-header-responsive">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Icon className="h-5 w-5 text-green-600" />
              <h1 className="text-lg lg:text-xl font-semibold text-gray-900">{title}</h1>
              <Badge variant="secondary" className="hidden sm:inline-flex">QR Mode</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => setQrDataURL("")}>
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
          
          {/* QR Type Selector */}
          <div className="flex flex-wrap gap-2">
            {qrTypeOptions.map((type) => {
              const TypeIcon = type.icon
              return (
                <Button
                  key={type.value}
                  variant={qrType === type.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setQrType(type.value)}
                  className="flex items-center space-x-2"
                >
                  <TypeIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">{type.label}</span>
                </Button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area with proper spacing */}
      <div className="pt-40 min-h-screen tools-main-content">
        {/* Unified Before Canvas Ad */}
        <div className="unified-before-canvas bg-white border-b tools-header-responsive">
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
        <div className="canvas bg-gray-50 min-h-[60vh] overflow-y-auto tools-interface-active">
          {children ? (
            children
          ) : (
            <div className="container mx-auto px-4 py-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* QR Content Form */}
                <Card>
                  <CardHeader>
                    <CardTitle>QR Code Content</CardTitle>
                    <CardDescription>Enter your {qrTypeOptions.find(t => t.value === qrType)?.label} information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {renderQRForm()}
                    
                    <Button onClick={generateQRCode} disabled={isProcessing} className="w-full bg-green-600 hover:bg-green-700">
                      {isProcessing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <QrCode className="h-4 w-4 mr-2" />
                          Generate QR Code
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* QR Preview */}
                <Card>
                  <CardHeader>
                    <CardTitle>QR Code Preview</CardTitle>
                    <CardDescription>Your generated QR code</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-center">
                      {qrDataURL ? (
                        <div className="qr-preview">
                          <img
                            src={qrDataURL}
                            alt="Generated QR Code"
                            className="max-w-full h-auto border rounded-lg shadow-lg"
                            style={{ maxWidth: "300px" }}
                          />
                        </div>
                      ) : (
                        <div className="w-64 h-64 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                          <div className="text-center text-gray-500">
                            <QrCode className="h-12 w-12 mx-auto mb-2" />
                            <p>QR code will appear here</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {qrDataURL && (
                      <div className="flex space-x-2">
                        <Button onClick={downloadQRCode} className="flex-1">
                          <Download className="h-4 w-4 mr-2" />
                          Download PNG
                        </Button>
                        <Button onClick={copyQRCode} variant="outline" className="flex-1">
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Image
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>

        {/* Unified After Canvas Ad */}
        <div className="unified-after-canvas bg-white border-t tools-header-responsive">
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
        <div className="hidden lg:flex w-80 xl:w-96 bg-white border-l shadow-lg flex-col fixed top-40 bottom-0 right-0 z-30 overflow-y-auto">
          <div className="px-6 py-4 border-b bg-gray-50 flex-shrink-0">
            <div className="flex items-center space-x-2">
              <QrCode className="h-5 w-5 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-900">QR Options</h2>
            </div>
            <p className="text-sm text-gray-600 mt-1">Customize your QR code</p>
          </div>

          <div className="flex-1 overflow-y-auto">
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
              onClick={generateQRCode}
              disabled={isProcessing}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-base font-semibold"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <QrCode className="h-4 w-4 mr-2" />
                  Generate QR Code
                </>
              )}
            </Button>

            {qrDataURL && (
              <div className="flex space-x-2">
                <Button onClick={downloadQRCode} variant="outline" className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button onClick={copyQRCode} variant="outline" className="flex-1">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Options Panel */}
        <MobileOptionPanel
          isOpen={isMobileSidebarOpen}
          onOpenChange={setIsMobileSidebarOpen}
          title="QR Code Options"
          icon={<QrCode className="h-5 w-5 text-green-600" />}
          footer={
            <Button 
              onClick={generateQRCode}
              disabled={isProcessing}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? "Generating..." : "Generate QR Code"}
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

      {/* Rich Educational Content - Show AFTER canvas for QR tools */}
      {richContent && (
        <div className="bg-gray-50">
          {richContent}
        </div>
      )}
      
      {children}
    </div>
  )
}