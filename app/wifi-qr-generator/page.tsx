"use client"

import { UnifiedToolLayout } from "@/components/unified-tool-layout"
import { Wifi } from "lucide-react"
import { QRProcessor } from "@/lib/qr-processor"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Download, Copy } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useState } from "react"

const wifiOptions = [
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
]

async function generateWiFiQR(files: any[], options: any): Promise<{ success: boolean; qrDataURL?: string; error?: string }> {
  try {
    if (!options.ssid || options.ssid.trim() === "") {
      return {
        success: false,
        error: "WiFi network name (SSID) is required",
      }
    }

    const wifiString = `WIFI:T:${options.security};S:${options.ssid};P:${options.password || ""};H:${options.hidden ? "true" : "false"};;`
    
    const qrDataURL = await QRProcessor.generateQRCode(wifiString, {
      width: options.size,
      margin: options.margin,
      errorCorrectionLevel: "M",
    })

    return {
      success: true,
      qrDataURL
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate WiFi QR code",
    }
  }
}

function WiFiForm({ wifiData, onWifiDataChange }: {
  wifiData: any,
  onWifiDataChange: (data: any) => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>WiFi Network Details</CardTitle>
        <CardDescription>Enter your WiFi network information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="ssid">Network Name (SSID)</Label>
          <Input
            id="ssid"
            placeholder="MyWiFiNetwork"
            value={wifiData.ssid}
            onChange={(e) => onWifiDataChange({ ...wifiData, ssid: e.target.value })}
          />
        </div>
        
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Network password"
            value={wifiData.password}
            onChange={(e) => onWifiDataChange({ ...wifiData, password: e.target.value })}
          />
        </div>
        
        <div>
          <Label htmlFor="security">Security Type</Label>
          <Select
            value={wifiData.security}
            onValueChange={(value) => onWifiDataChange({ ...wifiData, security: value })}
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
            checked={wifiData.hidden}
            onCheckedChange={(checked) => onWifiDataChange({ ...wifiData, hidden: checked })}
          />
          <Label htmlFor="hidden">Hidden Network</Label>
        </div>
      </CardContent>
    </Card>
  )
}

function QRPreview({ qrDataURL, onDownload }: {
  qrDataURL: string,
  onDownload: () => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>WiFi QR Code</CardTitle>
        <CardDescription>Scan to connect to WiFi network</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          {qrDataURL ? (
            <img
              src={qrDataURL}
              alt="WiFi QR Code"
              className="max-w-full h-auto border rounded-lg shadow-lg"
              style={{ maxWidth: "300px" }}
            />
          ) : (
            <div className="w-64 h-64 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <Wifi className="h-12 w-12 mx-auto mb-2" />
                <p>WiFi QR code will appear here</p>
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
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function WiFiQRGeneratorPage() {
  const [wifiData, setWifiData] = useState({
    ssid: "",
    password: "",
    security: "WPA",
    hidden: false
  })
  const [qrDataURL, setQrDataURL] = useState("")

  const processWiFiQR = async (files: any[], options: any) => {
    const result = await generateWiFiQR(files, { ...options, ...wifiData })
    if (result.success && result.qrDataURL) {
      setQrDataURL(result.qrDataURL)
    }
    return result
  }

  const handleDownload = () => {
    if (!qrDataURL) return
    
    const link = document.createElement("a")
    link.href = qrDataURL
    link.download = "wifi-qr-code.png"
    link.click()
    
    toast({
      title: "Download started",
      description: "WiFi QR code downloaded successfully"
    })
  }

  return (
    <UnifiedToolLayout
      title="WiFi QR Code Generator"
      description="Create QR codes for WiFi networks. Users can scan to connect automatically without typing passwords."
      icon={Wifi}
      toolType="qr"
      processFunction={processWiFiQR}
      options={wifiOptions}
      maxFiles={0}
      allowBatchProcessing={false}
      supportedFormats={[]}
      outputFormats={["png", "svg"]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WiFiForm 
          wifiData={wifiData} 
          onWifiDataChange={setWifiData} 
        />
        <QRPreview 
          qrDataURL={qrDataURL} 
          onDownload={handleDownload} 
        />
      </div>
    </UnifiedToolLayout>
  )
}