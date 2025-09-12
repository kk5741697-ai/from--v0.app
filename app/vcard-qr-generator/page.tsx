"use client"

import { UnifiedToolLayout } from "@/components/unified-tool-layout"
import { User } from "lucide-react"
import { QRProcessor } from "@/lib/qr-processor"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useState } from "react"

const vcardOptions = [
  {
    key: "size",
    label: "QR Code Size",
    type: "slider" as const,
    defaultValue: 1000,
    min: 200,
    max: 2000,
    step: 50,
    section: "Appearance",
  },
]

async function generateVCardQR(files: any[], options: any): Promise<{ success: boolean; qrDataURL?: string; error?: string }> {
  try {
    if (!options.firstName && !options.lastName) {
      return {
        success: false,
        error: "At least first name or last name is required",
      }
    }

    // Generate vCard format
    let vcard = "BEGIN:VCARD\nVERSION:3.0\n"
    
    if (options.firstName || options.lastName) {
      vcard += `FN:${options.firstName} ${options.lastName}\n`
    }
    if (options.organization) {
      vcard += `ORG:${options.organization}\n`
    }
    if (options.phone) {
      vcard += `TEL:${options.phone}\n`
    }
    if (options.email) {
      vcard += `EMAIL:${options.email}\n`
    }
    if (options.url) {
      vcard += `URL:${options.url}\n`
    }
    if (options.address) {
      vcard += `ADR:;;${options.address};;;;\n`
    }
    
    vcard += "END:VCARD"
    
    const qrDataURL = await QRProcessor.generateQRCode(vcard, {
      width: options.size,
      margin: 4,
      errorCorrectionLevel: "M",
    })

    return {
      success: true,
      qrDataURL
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate vCard QR code",
    }
  }
}

function VCardForm({ vcardData, onVcardDataChange }: {
  vcardData: any,
  onVcardDataChange: (data: any) => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Information</CardTitle>
        <CardDescription>Enter contact details for the vCard</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              placeholder="John"
              value={vcardData.firstName}
              onChange={(e) => onVcardDataChange({ ...vcardData, firstName: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              placeholder="Doe"
              value={vcardData.lastName}
              onChange={(e) => onVcardDataChange({ ...vcardData, lastName: e.target.value })}
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="organization">Organization</Label>
          <Input
            id="organization"
            placeholder="Company Name"
            value={vcardData.organization}
            onChange={(e) => onVcardDataChange({ ...vcardData, organization: e.target.value })}
          />
        </div>
        
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+1 (555) 123-4567"
            value={vcardData.phone}
            onChange={(e) => onVcardDataChange({ ...vcardData, phone: e.target.value })}
          />
        </div>
        
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            value={vcardData.email}
            onChange={(e) => onVcardDataChange({ ...vcardData, email: e.target.value })}
          />
        </div>
        
        <div>
          <Label htmlFor="url">Website</Label>
          <Input
            id="url"
            type="url"
            placeholder="https://example.com"
            value={vcardData.url}
            onChange={(e) => onVcardDataChange({ ...vcardData, url: e.target.value })}
          />
        </div>
        
        <div>
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            placeholder="123 Main St, City, State 12345"
            value={vcardData.address}
            onChange={(e) => onVcardDataChange({ ...vcardData, address: e.target.value })}
            rows={2}
          />
        </div>
      </CardContent>
    </Card>
  )
}

function VCardPreview({ qrDataURL, onDownload }: {
  qrDataURL: string,
  onDownload: () => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>vCard QR Code</CardTitle>
        <CardDescription>Contact information QR code</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          {qrDataURL ? (
            <img
              src={qrDataURL}
              alt="vCard QR Code"
              className="max-w-full h-auto border rounded-lg shadow-lg"
              style={{ maxWidth: "300px" }}
            />
          ) : (
            <div className="w-64 h-64 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <User className="h-12 w-12 mx-auto mb-2" />
                <p>vCard QR code will appear here</p>
              </div>
            </div>
          )}
        </div>
        
        {qrDataURL && (
          <Button onClick={onDownload} className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Download vCard QR Code
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

export default function VCardQRGeneratorPage() {
  const [vcardData, setVcardData] = useState({
    firstName: "",
    lastName: "",
    organization: "",
    phone: "",
    email: "",
    url: "",
    address: ""
  })
  const [qrDataURL, setQrDataURL] = useState("")

  const processVCardGeneration = async (files: any[], options: any) => {
    const result = await generateVCardQR(files, { ...options, ...vcardData })
    if (result.success && result.qrDataURL) {
      setQrDataURL(result.qrDataURL)
    }
    return result
  }

  const handleDownload = () => {
    if (!qrDataURL) return
    
    const link = document.createElement("a")
    link.href = qrDataURL
    link.download = "vcard-qr-code.png"
    link.click()
    
    toast({
      title: "Download started",
      description: "vCard QR code downloaded successfully"
    })
  }

  return (
    <UnifiedToolLayout
      title="vCard QR Code Generator"
      description="Generate QR codes for contact information. Perfect for business cards and networking events."
      icon={User}
      toolType="qr"
      processFunction={processVCardGeneration}
      options={vcardOptions}
      maxFiles={0}
      allowBatchProcessing={false}
      supportedFormats={[]}
      outputFormats={["png", "svg"]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VCardForm 
          vcardData={vcardData} 
          onVcardDataChange={setVcardData} 
        />
        <VCardPreview 
          qrDataURL={qrDataURL} 
          onDownload={handleDownload} 
        />
      </div>
    </UnifiedToolLayout>
  )
}