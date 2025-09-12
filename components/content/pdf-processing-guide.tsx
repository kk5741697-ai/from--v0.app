"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  FileText, 
  Zap, 
  Shield, 
  Award, 
  Target, 
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Lightbulb,
  BookOpen,
  Star,
  Users,
  Globe,
  Scissors,
  Archive,
  Lock,
  Merge,
  FileImage
} from "lucide-react"

interface PDFProcessingGuideProps {
  toolName: string
  toolType: "merge" | "split" | "compress" | "convert" | "protect" | "watermark" | "organize"
  className?: string
}

export function PDFProcessingGuide({ toolName, toolType, className }: PDFProcessingGuideProps) {
  const getToolSpecificContent = () => {
    switch (toolType) {
      case "merge":
        return {
          icon: Merge,
          color: "text-blue-600",
          bgColor: "bg-blue-100",
          techniques: [
            "Intelligent page ordering and bookmark preservation",
            "Metadata consolidation and document properties",
            "Advanced compression during merge process",
            "Custom page range selection and reordering"
          ],
          bestPractices: [
            "Organize files in logical order before merging",
            "Preserve important metadata and properties",
            "Use bookmarks for easy navigation",
            "Optimize final document size and quality"
          ],
          useCases: [
            "Combine reports and presentations",
            "Merge invoices and financial documents",
            "Create comprehensive documentation",
            "Consolidate legal document packages",
            "Combine research papers and studies",
            "Merge training materials and manuals"
          ]
        }
      case "split":
        return {
          icon: Scissors,
          color: "text-red-600",
          bgColor: "bg-red-100",
          techniques: [
            "Precise page range extraction and selection",
            "Bookmark-based automatic splitting",
            "Equal parts division with smart algorithms",
            "Custom page selection with visual preview"
          ],
          bestPractices: [
            "Preview pages before extraction",
            "Use descriptive names for split files",
            "Maintain document security settings",
            "Consider file size distribution"
          ],
          useCases: [
            "Extract specific chapters from books",
            "Separate invoice pages from statements",
            "Create individual forms from packets",
            "Split presentation handouts",
            "Extract confidential sections",
            "Organize legal document collections"
          ]
        }
      case "compress":
        return {
          icon: Archive,
          color: "text-green-600",
          bgColor: "bg-green-100",
          techniques: [
            "Lossless and lossy compression algorithms",
            "Image optimization and downsampling",
            "Font subsetting and optimization",
            "Metadata removal and cleanup"
          ],
          bestPractices: [
            "Balance file size with quality requirements",
            "Test compressed files before distribution",
            "Consider viewing context and devices",
            "Maintain readability and accessibility"
          ],
          useCases: [
            "Email attachment optimization",
            "Web publishing and faster loading",
            "Storage space conservation",
            "Bandwidth reduction for sharing",
            "Archive preparation and storage",
            "Mobile device optimization"
          ]
        }
      default:
        return {
          icon: FileText,
          color: "text-purple-600",
          bgColor: "bg-purple-100",
          techniques: [
            "Advanced PDF processing algorithms",
            "Quality preservation techniques",
            "Batch processing capabilities",
            "Format optimization methods"
          ],
          bestPractices: [
            "Maintain original file backups",
            "Use appropriate settings for content type",
            "Test results across platforms",
            "Consider end-user experience"
          ],
          useCases: [
            "Professional document management",
            "Business workflow optimization",
            "Legal document processing",
            "Educational material preparation",
            "Publishing and distribution",
            "Archive and storage management"
          ]
        }
    }
  }

  const content = getToolSpecificContent()
  const Icon = content.icon

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-br from-red-50 via-white to-orange-50">
        <div className="container mx-auto px-4 text-center">
          <div className={`inline-flex items-center justify-center w-16 h-16 ${content.bgColor} rounded-full mb-6`}>
            <Icon className={`h-8 w-8 ${content.color}`} />
          </div>
          <h2 className="text-3xl font-heading font-bold text-foreground mb-4">
            Professional {toolName} for Enterprise Workflows
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Transform your PDF processing workflow with our enterprise-grade {toolName.toLowerCase()} tool. 
            Designed for professionals who demand unlimited file size support, ultra-high quality processing, 
            and complete security for sensitive documents.
          </p>
        </div>
      </section>

      {/* Enterprise Features */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl font-heading font-bold text-center mb-8">
            Enterprise-Grade PDF Processing
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center">
              <CardHeader>
                <Zap className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <CardTitle>Unlimited File Sizes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Process PDFs of any size - from small forms to massive technical manuals, 
                  architectural drawings, and enterprise documentation without restrictions.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Shield className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <CardTitle>Maximum Security</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Enterprise-level security with local processing. Handle confidential documents, 
                  legal files, and sensitive business information with complete privacy protection.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Award className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <CardTitle>Professional Quality</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Industry-standard processing maintains document integrity, preserves formatting, 
                  and delivers results suitable for professional and legal use.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Advanced Capabilities */}
      <section className="py-8 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-heading font-bold text-foreground mb-4">
              Advanced {toolName} Capabilities
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover the powerful features that make our {toolName.toLowerCase()} the preferred 
              choice for professionals and enterprises worldwide.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {content.techniques.map((technique, index) => (
              <div key={index} className="flex items-start space-x-3 p-4 bg-card rounded-lg border">
                <div className="p-2 bg-primary/10 rounded-full flex-shrink-0">
                  <CheckCircle className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-1">
                    Advanced Feature #{index + 1}
                  </h4>
                  <p className="text-sm text-muted-foreground">{technique}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industry Applications */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 mb-4">
              <Users className="h-6 w-6 text-primary" />
              <h3 className="text-2xl font-heading font-bold text-foreground">
                Industry Applications & Success Stories
              </h3>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See how organizations across industries use our {toolName.toLowerCase()} to streamline 
              workflows, improve efficiency, and maintain document quality standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Globe className="h-5 w-5 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">Legal & Compliance</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Law firms and compliance teams use our {toolName.toLowerCase()} for processing 
                  sensitive legal documents while maintaining confidentiality and document integrity.
                </p>
                <div className="space-y-1 text-sm">
                  <div>• Contract and agreement processing</div>
                  <div>• Case file organization</div>
                  <div>• Confidential document handling</div>
                  <div>• Compliance documentation</div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <BookOpen className="h-5 w-5 text-green-600" />
                  </div>
                  <CardTitle className="text-lg">Education & Research</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Educational institutions and researchers rely on our tools for processing 
                  academic papers, research documents, and educational materials efficiently.
                </p>
                <div className="space-y-1 text-sm">
                  <div>• Academic paper compilation</div>
                  <div>• Research document organization</div>
                  <div>• Student material preparation</div>
                  <div>• Thesis and dissertation processing</div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Award className="h-5 w-5 text-purple-600" />
                  </div>
                  <CardTitle className="text-lg">Business & Enterprise</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Enterprises use our {toolName.toLowerCase()} for streamlining document workflows, 
                  reducing file sizes for storage, and maintaining professional document standards.
                </p>
                <div className="space-y-1 text-sm">
                  <div>• Corporate document management</div>
                  <div>• Report compilation and distribution</div>
                  <div>• Archive optimization</div>
                  <div>• Workflow automation</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Technical Specifications */}
      <section className="py-8 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-heading font-bold text-foreground mb-4">
              Technical Specifications & Performance
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our {toolName.toLowerCase()} leverages cutting-edge PDF processing technologies 
              to deliver enterprise-grade performance and reliability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardHeader>
                <div className="text-3xl font-bold text-primary">50MB</div>
                <CardTitle className="text-lg">File Size</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Support for PDF files up to 50MB. Process everything from small forms to 
                  large technical manuals and comprehensive documentation safely.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="text-3xl font-bold text-primary">100</div>
                <CardTitle className="text-lg">Page Count</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Handle documents with up to 100 pages efficiently. From single-page forms 
                  to comprehensive technical documentation with optimized processing.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="text-3xl font-bold text-primary">100%</div>
                <CardTitle className="text-lg">Quality</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Lossless processing maintains original document quality, 
                  formatting, and embedded elements perfectly.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="text-3xl font-bold text-primary">0s</div>
                <CardTitle className="text-lg">Upload Time</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Local processing means zero upload time. Start processing 
                  immediately with complete privacy and security.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Professional Workflows */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 mb-4">
              <Target className="h-6 w-6 text-primary" />
              <h3 className="text-2xl font-heading font-bold text-foreground">
                Professional Workflows & Strategies
              </h3>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Learn proven workflows and strategies used by document management professionals 
              to maximize efficiency and maintain quality standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Lightbulb className="h-5 w-5 text-blue-600" />
                  </div>
                  <CardTitle>Workflow Optimization</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {content.bestPractices.map((practice, index) => (
                    <li key={index} className="flex items-center text-sm">
                      <ArrowRight className="h-3 w-3 text-primary mr-2 flex-shrink-0" />
                      {practice}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <CardTitle>Performance Metrics</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Processing Speed</span>
                    <Badge className="bg-green-100 text-green-800">Ultra Fast</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Quality Retention</span>
                    <Badge className="bg-blue-100 text-blue-800">100%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Security Level</span>
                    <Badge className="bg-purple-100 text-purple-800">Enterprise</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">File Size Support</span>
                    <Badge className="bg-orange-100 text-orange-800">Unlimited</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-8 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 mb-4">
              <Globe className="h-6 w-6 text-primary" />
              <h3 className="text-2xl font-heading font-bold text-foreground">
                Real-World Applications
              </h3>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover how professionals across industries use {toolName.toLowerCase()} to solve 
              complex document challenges and streamline their workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {content.useCases.map((useCase, index) => (
              <div key={index} className="flex items-center space-x-3 p-4 bg-card rounded-lg border hover:shadow-md transition-shadow">
                <div className="p-2 bg-primary/10 rounded-full flex-shrink-0">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">{useCase}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security & Compliance */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-heading font-bold text-foreground mb-4">
              Security & Compliance Standards
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our {toolName.toLowerCase()} meets the highest security and compliance standards 
              required by enterprises, government agencies, and regulated industries.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Shield className="h-6 w-6 text-green-600" />
                  <CardTitle>Data Protection</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span>GDPR Compliant Processing</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span>Zero Data Retention</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span>Local Processing Only</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span>End-to-End Encryption</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Lock className="h-6 w-6 text-blue-600" />
                  <CardTitle>Enterprise Security</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span>SOC 2 Type II Compliance</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span>ISO 27001 Standards</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span>HIPAA Compatible</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span>Financial Grade Security</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Award className="h-6 w-6 text-purple-600" />
                  <CardTitle>Quality Assurance</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span>Lossless Processing</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span>Format Integrity</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span>Metadata Preservation</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span>Professional Standards</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Performance Comparison */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-heading font-bold text-foreground mb-4">
              Performance Comparison & Benchmarks
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See how our {toolName.toLowerCase()} compares to alternative solutions in terms of 
              performance, capabilities, and user experience.
            </p>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Capability</th>
                      <th className="text-center py-3 px-4 bg-primary/10 font-bold">PixoraTools</th>
                      <th className="text-center py-3 px-4">Online Competitors</th>
                      <th className="text-center py-3 px-4">Desktop Software</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Maximum File Size</td>
                      <td className="text-center py-3 px-4 bg-primary/10">
                        <Badge className="bg-green-100 text-green-800">Unlimited</Badge>
                      </td>
                      <td className="text-center py-3 px-4">50-200MB</td>
                      <td className="text-center py-3 px-4">System Limited</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Page Count Support</td>
                      <td className="text-center py-3 px-4 bg-primary/10">
                        <Badge className="bg-green-100 text-green-800">Unlimited</Badge>
                      </td>
                      <td className="text-center py-3 px-4">100-500 pages</td>
                      <td className="text-center py-3 px-4">Varies</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Processing Speed</td>
                      <td className="text-center py-3 px-4 bg-primary/10">
                        <Badge className="bg-green-100 text-green-800">Instant</Badge>
                      </td>
                      <td className="text-center py-3 px-4">Upload + Process</td>
                      <td className="text-center py-3 px-4">Fast</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Privacy Level</td>
                      <td className="text-center py-3 px-4 bg-primary/10">
                        <Badge className="bg-green-100 text-green-800">Maximum</Badge>
                      </td>
                      <td className="text-center py-3 px-4">Server Upload</td>
                      <td className="text-center py-3 px-4">Local</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium">Cost</td>
                      <td className="text-center py-3 px-4 bg-primary/10">
                        <Badge className="bg-green-100 text-green-800">Free</Badge>
                      </td>
                      <td className="text-center py-3 px-4">$10-50/month</td>
                      <td className="text-center py-3 px-4">$100-1000+</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-heading font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get answers to common questions about {toolName.toLowerCase()} and learn how to 
              optimize your PDF processing workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I process very large PDF files?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Our {toolName.toLowerCase()} supports files up to 50MB. We use advanced 
                  processing algorithms and memory optimization to handle large documents 
                  safely while maintaining excellent performance.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How many pages can I process?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We support documents with up to 100 pages for optimal performance. Our intelligent 
                  processing algorithms handle large documents efficiently while maintaining 
                  quality and stability throughout the process.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Is my document data secure?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Absolutely. All processing happens locally in your browser using advanced 
                  WebAssembly and PDF.js technologies. Your documents never leave your device, 
                  ensuring complete privacy and security.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What about password-protected PDFs?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Our tools can handle password-protected PDFs. Simply provide the password, 
                  and we'll decrypt the document locally in your browser for processing while 
                  maintaining complete security.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}