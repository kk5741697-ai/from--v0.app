"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  QrCode, 
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
  Smartphone,
  Wifi,
  Mail,
  Phone
} from "lucide-react"

interface QRCodeGuideProps {
  toolName: string
  toolType: "generator" | "scanner" | "bulk" | "wifi" | "vcard"
  className?: string
}

export function QRCodeGuide({ toolName, toolType, className }: QRCodeGuideProps) {
  const getToolSpecificContent = () => {
    switch (toolType) {
      case "generator":
        return {
          icon: QrCode,
          color: "text-blue-600",
          bgColor: "bg-blue-100",
          techniques: [
            "Advanced error correction algorithms for maximum reliability",
            "Custom styling with logos, colors, and branding elements",
            "Multi-format output including PNG, SVG, and PDF",
            "Batch generation capabilities for enterprise workflows"
          ],
          bestPractices: [
            "Test QR codes across multiple devices and apps",
            "Use appropriate error correction for environment",
            "Maintain sufficient contrast for reliable scanning",
            "Include clear call-to-action instructions"
          ],
          useCases: [
            "Restaurant menu access and ordering",
            "WiFi network sharing for guests",
            "Contact information distribution",
            "Event registration and check-ins",
            "Product information and reviews",
            "Social media profile linking",
            "App download promotion",
            "Payment and donation collection"
          ]
        }
      case "scanner":
        return {
          icon: Smartphone,
          color: "text-green-600",
          bgColor: "bg-green-100",
          techniques: [
            "Advanced image processing for damaged QR codes",
            "Multi-angle detection and perspective correction",
            "Batch scanning for multiple QR codes in images",
            "Format detection and data type identification"
          ],
          bestPractices: [
            "Use high-resolution images for better accuracy",
            "Ensure good lighting and minimal glare",
            "Position QR code clearly within frame",
            "Verify scanned data before using"
          ],
          useCases: [
            "Inventory management and tracking",
            "Document verification and authentication",
            "Event ticket validation",
            "Product information retrieval",
            "Contact information extraction",
            "WiFi credential scanning",
            "URL and link verification",
            "Data collection and surveys"
          ]
        }
      default:
        return {
          icon: QrCode,
          color: "text-purple-600",
          bgColor: "bg-purple-100",
          techniques: [
            "Professional QR code generation algorithms",
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
            "Professional QR code creation",
            "Business workflow optimization",
            "Marketing campaign enhancement",
            "Customer engagement improvement",
            "Digital transformation initiatives",
            "Contactless interaction solutions"
          ]
        }
    }
  }

  const content = getToolSpecificContent()
  const Icon = content.icon

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="container mx-auto px-4 text-center">
          <div className={`inline-flex items-center justify-center w-16 h-16 ${content.bgColor} rounded-full mb-6`}>
            <Icon className={`h-8 w-8 ${content.color}`} />
          </div>
          <h2 className="text-3xl font-heading font-bold text-foreground mb-4">
            Professional {toolName} for Modern Business
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Harness the power of QR codes to bridge the gap between physical and digital experiences. 
            Our enterprise-grade {toolName.toLowerCase()} delivers professional results with unlimited customization, 
            advanced features, and rock-solid reliability for businesses of all sizes.
          </p>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl font-heading font-bold text-center mb-8">
            Why Choose Our {toolName}?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center">
              <CardHeader>
                <Zap className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <CardTitle>Lightning Fast Generation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Generate QR codes instantly with our optimized algorithms. Process thousands of codes 
                  in seconds with batch generation capabilities and real-time preview updates.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Shield className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <CardTitle>Enterprise Security</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  All QR code generation happens locally in your browser. No data transmission, 
                  no server storage, complete privacy for sensitive business information and customer data.
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
                  Industry-standard QR codes with advanced error correction, custom branding options, 
                  and high-resolution output suitable for professional printing and digital use.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Advanced Techniques */}
      <section className="py-8 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-heading font-bold text-foreground mb-4">
              Advanced {toolName} Techniques
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Master these professional techniques to create QR codes that deliver exceptional user experiences 
              and drive meaningful business results across all touchpoints.
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
                    Professional Technique #{index + 1}
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
              Discover how organizations across industries use our {toolName.toLowerCase()} to enhance 
              customer experiences, streamline operations, and drive digital transformation initiatives.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Globe className="h-5 w-5 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">Retail & E-commerce</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Retailers use our {toolName.toLowerCase()} to create seamless shopping experiences, 
                  from product information access to contactless payments and customer engagement.
                </p>
                <div className="space-y-1 text-sm">
                  <div>• Product information and specifications</div>
                  <div>• Customer reviews and ratings access</div>
                  <div>• Contactless payment processing</div>
                  <div>• Loyalty program enrollment</div>
                  <div>• Store location and hours information</div>
                  <div>• Promotional campaigns and discounts</div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <BookOpen className="h-5 w-5 text-green-600" />
                  </div>
                  <CardTitle className="text-lg">Hospitality & Events</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Hotels, restaurants, and event organizers leverage QR codes for contactless services, 
                  enhanced guest experiences, and streamlined operations.
                </p>
                <div className="space-y-1 text-sm">
                  <div>• Digital menu access and ordering</div>
                  <div>• Hotel check-in and room services</div>
                  <div>• Event registration and networking</div>
                  <div>• WiFi access for guests</div>
                  <div>• Feedback collection and surveys</div>
                  <div>• Contactless payment solutions</div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Award className="h-5 w-5 text-purple-600" />
                  </div>
                  <CardTitle className="text-lg">Healthcare & Education</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Healthcare providers and educational institutions use QR codes for patient management, 
                  resource access, and enhanced safety protocols.
                </p>
                <div className="space-y-1 text-sm">
                  <div>• Patient check-in and registration</div>
                  <div>• Medical record access</div>
                  <div>• Educational resource distribution</div>
                  <div>• Campus navigation and information</div>
                  <div>• Contact tracing and safety protocols</div>
                  <div>• Digital forms and documentation</div>
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
              Technical Specifications & Capabilities
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our {toolName.toLowerCase()} leverages cutting-edge QR code technologies to deliver 
              enterprise-grade performance, reliability, and compatibility across all platforms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardHeader>
                <div className="text-3xl font-bold text-primary">2,953</div>
                <CardTitle className="text-lg">Max Characters</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Support for up to 2,953 alphanumeric characters in a single QR code, 
                  perfect for complex data and detailed information.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="text-3xl font-bold text-primary">40+</div>
                <CardTitle className="text-lg">QR Versions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Support for all QR code versions from 1 to 40, automatically 
                  selecting optimal version based on content length.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="text-3xl font-bold text-primary">4K+</div>
                <CardTitle className="text-lg">Resolution</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Generate ultra-high resolution QR codes up to 4K and beyond, 
                  perfect for large format printing and professional applications.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="text-3xl font-bold text-primary">100%</div>
                <CardTitle className="text-lg">Compatibility</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Universal compatibility with all QR code scanners, smartphone cameras, 
                  and dedicated scanning applications worldwide.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* QR Code Types and Applications */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-heading font-bold text-foreground mb-4">
              Comprehensive QR Code Types & Applications
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our {toolName.toLowerCase()} supports all major QR code types with specialized 
              optimization for each data format and use case.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Globe className="h-6 w-6 text-blue-600" />
                  <CardTitle>Website & URL QR Codes</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  Direct users to websites, landing pages, and online resources with optimized URL QR codes.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span>Website and landing page access</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span>Social media profile linking</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span>App store download links</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span>Online form and survey access</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Wifi className="h-6 w-6 text-green-600" />
                  <CardTitle>WiFi & Network QR Codes</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  Enable instant WiFi connections without manual password entry, perfect for businesses and events.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span>Guest WiFi access automation</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span>Event and conference networking</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span>Office and workspace connectivity</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span>Retail and hospitality services</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Users className="h-6 w-6 text-purple-600" />
                  <CardTitle>Contact & vCard QR Codes</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  Share complete contact information instantly with vCard QR codes for networking and business cards.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span>Digital business card distribution</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span>Event networking and connections</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span>Professional contact sharing</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span>Team directory and organization</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Mail className="h-6 w-6 text-orange-600" />
                  <CardTitle>Email & Communication</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  Streamline communication with pre-filled email QR codes and SMS messaging capabilities.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span>Pre-filled email composition</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span>SMS messaging with templates</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span>Customer support contact</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span>Feedback and survey collection</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Phone className="h-6 w-6 text-red-600" />
                  <CardTitle>Phone & Communication</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  Enable instant phone calls and communication with optimized phone number QR codes.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span>Direct phone call initiation</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span>Customer service hotlines</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span>Emergency contact information</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span>Business contact automation</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Target className="h-6 w-6 text-cyan-600" />
                  <CardTitle>Marketing & Analytics</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  Drive marketing campaigns and track engagement with analytics-enabled QR codes and tracking.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span>Campaign tracking and analytics</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span>Lead generation and capture</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span>Social media engagement</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span>Cross-platform integration</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Best Practices */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 mb-4">
              <Target className="h-6 w-6 text-primary" />
              <h3 className="text-2xl font-heading font-bold text-foreground">
                QR Code Best Practices & Guidelines
              </h3>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Follow these proven strategies and industry best practices to create QR codes that 
              deliver exceptional user experiences and achieve your business objectives.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Lightbulb className="h-5 w-5 text-blue-600" />
                  </div>
                  <CardTitle>Design & Usability</CardTitle>
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
                  <CardTitle>Performance Optimization</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Generation Speed</span>
                    <Badge className="bg-green-100 text-green-800">Instant</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Scan Reliability</span>
                    <Badge className="bg-blue-100 text-blue-800">99.9%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Error Correction</span>
                    <Badge className="bg-purple-100 text-purple-800">Advanced</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Custom Styling</span>
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
                Real-World Applications & Success Stories
              </h3>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover how businesses and organizations worldwide use our {toolName.toLowerCase()} 
              to solve real challenges and create innovative customer experiences.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {content.useCases.map((useCase, index) => (
              <div key={index} className="flex items-center space-x-3 p-4 bg-card rounded-lg border hover:shadow-md transition-shadow">
                <div className="p-2 bg-primary/10 rounded-full flex-shrink-0">
                  <QrCode className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">{useCase}</span>
              </div>
            ))}
          </div>
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
              Get answers to common questions about QR codes and learn how to optimize 
              your QR code strategy for maximum effectiveness.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What's the maximum data capacity?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  QR codes can store up to 2,953 alphanumeric characters, 4,296 numeric characters, 
                  or 1,817 Kanji characters. However, more data creates denser codes that may be 
                  harder to scan, so we recommend keeping content concise for optimal reliability.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How do I ensure reliable scanning?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Use high contrast colors (dark on light), maintain adequate size for viewing distance, 
                  choose appropriate error correction levels, and test across multiple devices and 
                  scanning apps before deployment.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I add logos to QR codes?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Yes! Our generator supports logo integration with automatic positioning and sizing. 
                  Keep logos under 20% of the total QR code area and use high error correction 
                  to maintain scannability with logo overlays.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What formats can I download?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Download QR codes in PNG, SVG, PDF, and JPEG formats. PNG is recommended for 
                  digital use, SVG for scalable graphics, and PDF for professional printing 
                  with embedded metadata and color profiles.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}