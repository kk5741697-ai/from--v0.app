"use client"

import { useState, useEffect } from "react"
import { UnifiedToolLayout } from "@/components/unified-tool-layout"
import { QrCode } from "lucide-react"
import { QRProcessor } from "@/lib/qr-processor"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Download, Copy } from "lucide-react"
import { toast } from "@/hooks/use-toast"

const qrOptions = [
  {
    key: "qrType",
    label: "QR Code Type",
    type: "select" as const,
    defaultValue: "url",
    selectOptions: [
      { value: "url", label: "Website URL" },
      { value: "text", label: "Plain Text" },
      { value: "email", label: "Email" },
      { value: "phone", label: "Phone" },
      { value: "wifi", label: "WiFi" },
      { value: "vcard", label: "Contact Card" },
    ],
    section: "Content",
  },
  {
    key: "size",
    label: "Size (px)",
    type: "slider" as const,
    defaultValue: 1000,
    min: 200,
    max: 2000,
    step: 50,
    section: "Appearance",
  },
  {
    key: "margin",
    label: "Margin",
    type: "slider" as const,
    defaultValue: 4,
    min: 0,
    max: 10,
    step: 1,
    section: "Appearance",
  },
  {
    key: "darkColor",
    label: "Dark Color",
    type: "color" as const,
    defaultValue: "#000000",
    section: "Colors",
  },
  {
    key: "lightColor",
    label: "Light Color",
    type: "color" as const,
    defaultValue: "#ffffff",
    section: "Colors",
  },
  {
    key: "errorCorrection",
    label: "Error Correction",
    type: "select" as const,
    defaultValue: "M",
    selectOptions: [
      { value: "L", label: "Low (~7%)" },
      { value: "M", label: "Medium (~15%)" },
      { value: "Q", label: "Quartile (~25%)" },
      { value: "H", label: "High (~30%)" },
    ],
    section: "Advanced",
  },
]

async function generateQRCode(files: any[], options: any) {
  try {
    if (!options.content || options.content.trim() === "") {
      return {
        success: false,
        error: "Please enter content for the QR code",
      }
    }

    const qrDataURL = await QRProcessor.generateQRCode(options.content, {
      width: options.size,
      margin: options.margin,
      color: {
        dark: options.darkColor,
        light: options.lightColor,
      },
      errorCorrectionLevel: options.errorCorrection,
    })

    return {
      success: true,
      qrDataURL,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate QR code",
    }
  }
}

function QRContentForm({ qrType, content, onContentChange }: {
  qrType: string,
  content: string,
  onContentChange: (content: string) => void
}) {
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
    firstName: "",
    lastName: "",
    organization: "",
    contactPhone: "",
    contactEmail: "",
  })

  useEffect(() => {
    let generatedContent = ""
    
    switch (qrType) {
      case "url":
        generatedContent = formData.url
        break
      case "text":
        generatedContent = formData.text
        break
      case "email":
        generatedContent = `mailto:${formData.email}?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(formData.body)}`
        break
      case "phone":
        generatedContent = `tel:${formData.phone}`
        break
      case "wifi":
        generatedContent = `WIFI:T:${formData.security};S:${formData.ssid};P:${formData.password};;`
        break
      case "vcard":
        generatedContent = `BEGIN:VCARD\nVERSION:3.0\nFN:${formData.firstName} ${formData.lastName}\nORG:${formData.organization}\nTEL:${formData.contactPhone}\nEMAIL:${formData.contactEmail}\nEND:VCARD`
        break
    }
    
    onContentChange(generatedContent)
  }, [qrType, formData, onContentChange])

  const renderForm = () => {
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

      case "phone":
        return (
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            />
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
              onChange={(e) => onContentChange(e.target.value)}
              rows={4}
            />
          </div>
        )
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>QR Code Content</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {renderForm()}
      </CardContent>
    </Card>
  )
}

function QRPreviewCanvas({ qrDataURL, onDownload, onCopy }: {
  qrDataURL: string,
  onDownload: () => void,
  onCopy: () => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>QR Code Preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          {qrDataURL ? (
            <img
              src={qrDataURL}
              alt="Generated QR Code"
              className="max-w-full h-auto border rounded-lg shadow-lg"
              style={{ maxWidth: "300px" }}
            />
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
            <Button onClick={onDownload} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download PNG
            </Button>
            <Button onClick={onCopy} variant="outline" className="flex-1">
              <Copy className="h-4 w-4 mr-2" />
              Copy Image
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function QRCodeGeneratorPage() {
  const [content, setContent] = useState("")
  const [qrDataURL, setQrDataURL] = useState("")
  const [qrType, setQrType] = useState("url")

  const processQRGeneration = async (files: any[], options: any) => {
    const result = await generateQRCode(files, { ...options, content })
    if (result.success && result.qrDataURL) {
      setQrDataURL(result.qrDataURL)
    }
    return result
  }

  const handleDownload = () => {
    if (!qrDataURL) return
    
    const link = document.createElement("a")
    link.href = qrDataURL
    link.download = "qr-code.png"
    link.click()
    
    toast({
      title: "Download started",
      description: "QR code downloaded successfully"
    })
  }

  const handleCopy = async () => {
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

  const richContent = (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-heading font-bold text-foreground mb-4">
            Master QR Code Generation for Business Success
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Create professional QR codes that drive engagement, streamline customer interactions, and enhance your marketing campaigns with our advanced generator featuring unlimited customization options.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle>Marketing & Advertising</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Transform your marketing campaigns with QR codes that bridge offline and online experiences. 
                Drive traffic, track engagement, and provide instant access to your content.
              </p>
              <ul className="space-y-2 text-sm">
                <li>• Restaurant menu access and ordering</li>
                <li>• Product information and reviews</li>
                <li>• Event registration and check-ins</li>
                <li>• Social media profile connections</li>
                <li>• App downloads and promotions</li>
                <li>• Contact information sharing</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Business Operations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Streamline business operations with QR codes for inventory management, customer service, 
                and operational efficiency across all departments.
              </p>
              <ul className="space-y-2 text-sm">
                <li>• WiFi network sharing for guests</li>
                <li>• Digital business card distribution</li>
                <li>• Payment processing and invoicing</li>
                <li>• Location sharing and directions</li>
                <li>• Document access and downloads</li>
                <li>• Customer feedback collection</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Technical Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Integrate QR codes into your technical workflows with API access, bulk generation, 
                and advanced customization for enterprise applications.
              </p>
              <ul className="space-y-2 text-sm">
                <li>• API integration for automated generation</li>
                <li>• Bulk QR code creation from databases</li>
                <li>• Custom branding and styling options</li>
                <li>• High-resolution output for print</li>
                <li>• SVG format for scalable graphics</li>
                <li>• Error correction for damaged codes</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )

  return (
    <UnifiedToolLayout
      title="QR Code Generator"
      description="Create professional QR codes for websites, WiFi, contacts, payments, and more. Customize colors, add logos, and download in multiple formats."
      icon={QrCode}
      toolType="qr"
      processFunction={processQRGeneration}
      options={qrOptions.map(option => ({
        ...option,
        defaultValue: option.key === "qrType" ? qrType : option.defaultValue
      }))}
      maxFiles={0}
      showUploadArea={false}
      richContent={richContent}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QRContentForm 
          qrType={qrType} 
          content={content} 
          onContentChange={setContent} 
        />
        <QRPreviewCanvas 
          qrDataURL={qrDataURL} 
          onDownload={handleDownload} 
          onCopy={handleCopy} 
        />
      </div>
    </UnifiedToolLayout>
  )
}