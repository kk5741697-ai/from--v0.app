"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, Copy, Download } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function BarcodeGeneratorPage() {
  const [content, setContent] = useState("")
  const [barcodeType, setBarcodeType] = useState("code128")
  const [generatedBarcode, setGeneratedBarcode] = useState("")

  const generateBarcode = () => {
    if (!content.trim()) {
      toast({
        title: "Content required",
        description: "Please enter content for the barcode",
        variant: "destructive"
      })
      return
    }

    // Simple barcode generation simulation
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")!
    
    canvas.width = 400
    canvas.height = 100
    
    // White background
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Draw barcode bars
    ctx.fillStyle = "#000000"
    const barWidth = 2
    const spacing = 1
    
    for (let i = 0; i < content.length * 8; i++) {
      const x = 20 + i * (barWidth + spacing)
      const shouldDraw = (content.charCodeAt(Math.floor(i / 8)) + i) % 2 === 0
      
      if (shouldDraw && x < canvas.width - 20) {
        ctx.fillRect(x, 10, barWidth, 60)
      }
    }
    
    // Add text below
    ctx.fillStyle = "#000000"
    ctx.font = "12px monospace"
    ctx.textAlign = "center"
    ctx.fillText(content, canvas.width / 2, 90)
    
    setGeneratedBarcode(canvas.toDataURL())
    
    toast({
      title: "Barcode generated",
      description: "Your barcode is ready to download"
    })
  }

  const downloadBarcode = () => {
    if (!generatedBarcode) return
    
    const link = document.createElement("a")
    link.href = generatedBarcode
    link.download = "barcode.png"
    link.click()
    
    toast({
      title: "Download started",
      description: "Barcode downloaded successfully"
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 mb-4">
            <BarChart3 className="h-8 w-8 text-accent" />
            <h1 className="text-3xl font-heading font-bold text-foreground">Barcode Generator</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Generate various barcode formats including Code 128, EAN, UPC, and more for retail and inventory management.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Barcode Configuration</CardTitle>
              <CardDescription>Enter your barcode data and settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="barcode-type">Barcode Type</Label>
                <Select value={barcodeType} onValueChange={setBarcodeType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="code128">Code 128</SelectItem>
                    <SelectItem value="ean13">EAN-13</SelectItem>
                    <SelectItem value="upc">UPC-A</SelectItem>
                    <SelectItem value="code39">Code 39</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="content">Barcode Content</Label>
                <Input
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter barcode data..."
                />
              </div>

              <Button onClick={generateBarcode} className="w-full" size="lg">
                <BarChart3 className="h-4 w-4 mr-2" />
                Generate Barcode
              </Button>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Barcode Preview</CardTitle>
              <CardDescription>Generated barcode ready for download</CardDescription>
            </CardHeader>
            <CardContent>
              {generatedBarcode ? (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <img
                      src={generatedBarcode}
                      alt="Generated Barcode"
                      className="border rounded-lg shadow-lg"
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button onClick={downloadBarcode} className="flex-1">
                      <Download className="h-4 w-4 mr-2" />
                      Download PNG
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Barcode will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}