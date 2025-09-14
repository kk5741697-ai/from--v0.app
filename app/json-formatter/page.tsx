"use client"

import { TextToolsLayout } from "@/components/text-tools-layout"
import { Braces } from "lucide-react"
import { TextProcessor } from "@/lib/processors/text-processor"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const jsonExamples = [
  {
    name: "Simple Object",
    content: `{"name":"John Doe","age":30,"city":"New York","active":true}`,
  },
  {
    name: "Nested Structure",
    content: `{"user":{"id":123,"profile":{"name":"Jane Smith","email":"jane@example.com","preferences":{"theme":"dark","notifications":true}},"posts":[{"id":1,"title":"Hello World","published":true},{"id":2,"title":"Getting Started","published":false}]}}`,
  },
  {
    name: "Array Data",
    content: `[{"id":1,"product":"Laptop","price":999.99,"inStock":true,"tags":["electronics","computers"]},{"id":2,"product":"Mouse","price":29.99,"inStock":false,"tags":["electronics","accessories"]}]`,
  },
]

const jsonOptions = [
  {
    key: "indent",
    label: "Indentation",
    type: "select" as const,
    defaultValue: 2,
    selectOptions: [
      { value: 2, label: "2 Spaces" },
      { value: 4, label: "4 Spaces" },
      { value: "tab", label: "Tabs" },
    ],
  },
  {
    key: "minify",
    label: "Minify JSON",
    type: "checkbox" as const,
    defaultValue: false,
  },
  {
    key: "sortKeys",
    label: "Sort Keys",
    type: "checkbox" as const,
    defaultValue: false,
  },
  {
    key: "validateOnly",
    label: "Validate Only",
    type: "checkbox" as const,
    defaultValue: false,
  },
]

function processJSON(input: string, options: any = {}) {
  return TextProcessor.processJSON(input, options)
}

function validateJSON(input: string) {
  if (!input.trim()) {
    return { isValid: false, error: "Input cannot be empty" }
  }
  
  try {
    JSON.parse(input)
    return { isValid: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Invalid JSON format"
    // Extract line number from error if available
    const lineMatch = errorMessage.match(/line (\d+)/i)
    const positionMatch = errorMessage.match(/position (\d+)/i)
    
    let enhancedError = errorMessage
    if (lineMatch) {
      enhancedError = `Line ${lineMatch[1]}: ${errorMessage}`
    } else if (positionMatch) {
      enhancedError = `Position ${positionMatch[1]}: ${errorMessage}`
    }
    
    return { 
      isValid: false, 
      error: enhancedError
    }
  }
}

export default function JSONFormatterPage() {
  const richContent = (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
            Professional JSON Processing for Developers
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Format, validate, and optimize JSON data with enterprise-grade tools designed for 
            developers, API testing, and data management workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>API Development</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Perfect for API testing, response formatting, and debugging. Validate JSON payloads 
                and ensure proper data structure for reliable API communication.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Validation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Comprehensive JSON validation with detailed error reporting. Identify syntax errors, 
                missing brackets, and formatting issues instantly.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Code Optimization</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Minify JSON for production use or beautify for development. Reduce file sizes 
                and improve readability with intelligent formatting.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )

  return (
    <TextToolsLayout
      title="JSON Formatter"
      description="Beautify, validate, and minify JSON data with syntax highlighting and error detection."
      icon={Braces}
      placeholder="Paste your JSON here..."
      outputPlaceholder="Formatted JSON will appear here..."
      processFunction={processJSON}
      validateFunction={validateJSON}
      options={jsonOptions}
      examples={jsonExamples}
      fileExtensions={[".json"]}
      richContent={richContent}
    />
  )
}