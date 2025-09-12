"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Hash, Copy, ArrowUpDown } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function NumberBaseConverterPage() {
  const [inputValue, setInputValue] = useState("")
  const [fromBase, setFromBase] = useState("10")
  const [toBase, setToBase] = useState("2")
  const [results, setResults] = useState<Record<string, string>>({})

  const bases = [
    { value: "2", label: "Binary (Base 2)" },
    { value: "8", label: "Octal (Base 8)" },
    { value: "10", label: "Decimal (Base 10)" },
    { value: "16", label: "Hexadecimal (Base 16)" },
  ]

  const convertNumber = () => {
    if (!inputValue.trim()) {
      setResults({})
      return
    }

    try {
      // Parse input number from source base
      const decimalValue = parseInt(inputValue, parseInt(fromBase))
      
      if (isNaN(decimalValue)) {
        toast({
          title: "Invalid input",
          description: `"${inputValue}" is not a valid ${bases.find(b => b.value === fromBase)?.label} number`,
          variant: "destructive"
        })
        return
      }

      // Convert to all bases
      const newResults: Record<string, string> = {}
      bases.forEach(base => {
        const baseValue = parseInt(base.value)
        if (baseValue === 10) {
          newResults[base.value] = decimalValue.toString()
        } else if (baseValue === 16) {
          newResults[base.value] = decimalValue.toString(16).toUpperCase()
        } else {
          newResults[base.value] = decimalValue.toString(baseValue)
        }
      })

      setResults(newResults)
    } catch (error) {
      toast({
        title: "Conversion failed",
        description: "Please check your input and try again",
        variant: "destructive"
      })
    }
  }

  const copyResult = (value: string) => {
    navigator.clipboard.writeText(value)
    toast({
      title: "Copied to clipboard",
      description: "Number copied successfully"
    })
  }

  const swapBases = () => {
    const temp = fromBase
    setFromBase(toBase)
    setToBase(temp)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 mb-4">
            <Hash className="h-8 w-8 text-accent" />
            <h1 className="text-3xl font-heading font-bold text-foreground">Number Base Converter</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Convert numbers between different bases: binary, decimal, hexadecimal, and octal.
          </p>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          {/* Input */}
          <Card>
            <CardHeader>
              <CardTitle>Number Conversion</CardTitle>
              <CardDescription>Enter a number and select the base to convert from and to</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="input-number">Input Number</Label>
                <Input
                  id="input-number"
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value)
                    convertNumber()
                  }}
                  placeholder="Enter number to convert..."
                  className="font-mono text-lg"
                />
              </div>

              <div className="grid grid-cols-5 gap-4 items-end">
                <div className="col-span-2">
                  <Label htmlFor="from-base">From Base</Label>
                  <Select value={fromBase} onValueChange={setFromBase}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {bases.map((base) => (
                        <SelectItem key={base.value} value={base.value}>
                          {base.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-center">
                  <Button variant="outline" size="icon" onClick={swapBases}>
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </div>

                <div className="col-span-2">
                  <Label htmlFor="to-base">To Base</Label>
                  <Select value={toBase} onValueChange={setToBase}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {bases.map((base) => (
                        <SelectItem key={base.value} value={base.value}>
                          {base.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <Card>
            <CardHeader>
              <CardTitle>Conversion Results</CardTitle>
              <CardDescription>Number in different bases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {bases.map((base) => (
                  <div key={base.value} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <div className="font-medium">{base.label}</div>
                      <div className="font-mono text-lg">
                        {results[base.value] || "—"}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyResult(results[base.value] || "")}
                      disabled={!results[base.value]}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}