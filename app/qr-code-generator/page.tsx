"use client"

import { useState } from "react"
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
import { QRCodeGuide } from "@/components/content/qr-code-guide"

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

async function generateQRCode(files: any[], options: any): Promise<{ success: boolean; qrDataURL?: string; error?: string }> {
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
      height: options.size,
      color: {
        dark: options.darkColor,
        light: options.lightColor,
      },
      errorCorrectionLevel: options.errorCorrection,
    })

    return {
      success: true,
      qrDataURL
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
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
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
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
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
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, email: e.target.value }))
                  onContentChange(`mailto:${e.target.value}?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(formData.body)}`)
                }}
              />
            </div>
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Email subject"
                value={formData.subject}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, subject: e.target.value }))
                  onContentChange(`mailto:${formData.email}?subject=${encodeURIComponent(e.target.value)}&body=${encodeURIComponent(formData.body)}`)
                }}
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
    <QRCodeGuide 
      toolName="QR Code Generator"
      toolType="generator"
      className="py-8"
    />
  )

  return (
    <UnifiedToolLayout
      title="QR Code Generator"
      description="Create professional QR codes for websites, WiFi, contacts, payments, and more. Advanced customization with colors, logos, error correction levels, and multiple output formats for business and personal use."
      icon={QrCode}
      toolType="qr"
      processFunction={processQRGeneration}
      options={qrOptions}
      maxFiles={0}
      richContent={richContent}
      allowBatchProcessing={false}
      supportedFormats={[]}
      outputFormats={["png", "svg", "pdf"]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QRContentForm 
          qrType={qrOptions.find(opt => opt.key === "qrType")?.defaultValue || "url"}
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