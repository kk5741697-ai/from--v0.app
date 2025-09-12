"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Grid, Download, Upload } from "lucide-react"
import { QRProcessor } from "@/lib/qr-processor"
import { toast } from "@/hooks/use-toast"

export default function BulkQRGeneratorPage() {
  const [inputData, setInputData] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<any[]>([])

  const generateBulkQRCodes = async () => {
    if (!inputData.trim()) {
      toast({
        title: "No data provided",
        description: "Please enter data to generate QR codes",
        variant: "destructive"
      })
      return
    }

    setIsGenerating(true)
    setProgress(0)
    setResults([])

    try {
      const lines = inputData.split('\n').filter(line => line.trim())
      const qrData = lines.map((line, index) => ({
        content: line.trim(),
        filename: `qr-code-${index + 1}.png`
      }))

      const results = await QRProcessor.generateBulkQRCodes(qrData, {
        width: 1000,
        margin: 4
      })

      setResults(results)
      
      toast({
        title: "Generation complete",
        description: `Generated ${results.filter(r => r.success).length} QR codes`
      })
    } catch (error) {
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate QR codes",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
      setProgress(100)
    }
  }

  const downloadAll = async () => {
    const successfulResults = results.filter(r => r.success)
    
    if (successfulResults.length === 0) {
      toast({
        title: "No QR codes to download",
        description: "Generate QR codes first",
        variant: "destructive"
      })
      return
    }

    try {
      const JSZip = (await import("jszip")).default
      const zip = new JSZip()

      for (const result of successfulResults) {
        const response = await fetch(result.dataURL)
        const blob = await response.blob()
        zip.file(result.filename, blob)
      }

      const zipBlob = await zip.generateAsync({ type: "blob" })
      const url = URL.createObjectURL(zipBlob)
      const link = document.createElement("a")
      link.href = url
      link.download = "qr-codes.zip"
      link.click()
      URL.revokeObjectURL(url)

      toast({
        title: "Download started",
        description: "All QR codes downloaded as ZIP"
      })
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to create ZIP file",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 mb-4">
            <Grid className="h-8 w-8 text-accent" />
            <h1 className="text-3xl font-heading font-bold text-foreground">Bulk QR Generator</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Generate multiple QR codes at once from text lists or CSV data. Perfect for bulk operations and batch processing.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Input */}
          <Card>
            <CardHeader>
              <CardTitle>Input Data</CardTitle>
              <CardDescription>Enter one item per line to generate QR codes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={inputData}
                onChange={(e) => setInputData(e.target.value)}
                placeholder="https://example.com/product1&#10;https://example.com/product2&#10;Contact: John Doe&#10;Phone: +1234567890"
                rows={10}
                className="font-mono text-sm"
              />
              
              <div className="flex space-x-2">
                <Button onClick={generateBulkQRCodes} disabled={isGenerating} className="flex-1">
                  <Grid className="h-4 w-4 mr-2" />
                  {isGenerating ? "Generating..." : "Generate QR Codes"}
                </Button>
                
                {results.length > 0 && (
                  <Button onClick={downloadAll} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download All
                  </Button>
                )}
              </div>

              {isGenerating && (
                <div className="space-y-2">
                  <Progress value={progress} />
                  <p className="text-sm text-muted-foreground text-center">
                    Generating QR codes...
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results */}
          {results.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Generated QR Codes</CardTitle>
                <CardDescription>
                  {results.filter(r => r.success).length} of {results.length} QR codes generated successfully
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {results.map((result, index) => (
                    <div key={index} className="text-center">
                      {result.success ? (
                        <div className="space-y-2">
                          <img
                            src={result.dataURL}
                            alt={`QR Code ${index + 1}`}
                            className="w-full aspect-square object-contain border rounded"
                          />
                          <p className="text-xs font-mono truncate">{result.filename}</p>
                        </div>
                      ) : (
                        <div className="aspect-square bg-red-50 border border-red-200 rounded flex items-center justify-center">
                          <p className="text-xs text-red-600">Error</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}