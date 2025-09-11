"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  ImageIcon, 
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
  Maximize,
  Crop,
  Palette,
  RotateCw,
  Archive
} from "lucide-react"

interface ImageProcessingGuideProps {
  toolName: string
  toolType: "resize" | "compress" | "convert" | "crop" | "rotate" | "filter" | "watermark"
  className?: string
}

export function ImageProcessingGuide({ toolName, toolType, className }: ImageProcessingGuideProps) {
  const getToolSpecificContent = () => {
    switch (toolType) {
      case "resize":
        return {
          icon: Maximize,
          color: "text-blue-600",
          bgColor: "bg-blue-100",
          techniques: [
            "Maintain aspect ratios for professional results",
            "Use percentage scaling for proportional adjustments",
            "Apply smart upscaling algorithms for enlargement",
            "Optimize dimensions for web and mobile devices"
          ],
          bestPractices: [
            "Always preserve original files before resizing",
            "Consider final output medium (web, print, social)",
            "Use appropriate DPI settings for intended use",
            "Test resized images across different devices"
          ],
          useCases: [
            "Website optimization and faster loading",
            "Social media content creation",
            "Email newsletter graphics",
            "Mobile app asset preparation",
            "Print material sizing",
            "Thumbnail generation"
          ]
        }
      case "compress":
        return {
          icon: Archive,
          color: "text-green-600",
          bgColor: "bg-green-100",
          techniques: [
            "Advanced lossy and lossless compression algorithms",
            "Smart quality optimization based on content",
            "Batch processing for multiple images",
            "Format-specific optimization techniques"
          ],
          bestPractices: [
            "Balance file size with visual quality",
            "Use appropriate compression levels",
            "Consider viewing context and audience",
            "Test compressed images on target devices"
          ],
          useCases: [
            "Website speed optimization",
            "Storage space reduction",
            "Faster image loading",
            "Bandwidth conservation",
            "Email attachment optimization",
            "Cloud storage efficiency"
          ]
        }
      case "crop":
        return {
          icon: Crop,
          color: "text-cyan-600",
          bgColor: "bg-cyan-100",
          techniques: [
            "Rule of thirds composition guidelines",
            "Aspect ratio preservation and adjustment",
            "Precision pixel-level cropping",
            "Visual grid guides for better composition"
          ],
          bestPractices: [
            "Plan composition before cropping",
            "Use grid guides for better alignment",
            "Consider final usage context",
            "Preserve important visual elements"
          ],
          useCases: [
            "Social media post optimization",
            "Profile picture creation",
            "Product photography editing",
            "Banner and header creation",
            "Focus area highlighting",
            "Unwanted element removal"
          ]
        }
      default:
        return {
          icon: ImageIcon,
          color: "text-purple-600",
          bgColor: "bg-purple-100",
          techniques: [
            "Professional image processing algorithms",
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
            "Professional image editing",
            "Content creation workflows",
            "Digital asset management",
            "Marketing material preparation",
            "Web optimization",
            "Print production"
          ]
        }
    }
  }

  const content = getToolSpecificContent()
  const Icon = content.icon

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 text-center">
          <div className={`inline-flex items-center justify-center w-16 h-16 ${content.bgColor} rounded-full mb-6`}>
            <Icon className={`h-8 w-8 ${content.color}`} />
          </div>
          <h2 className="text-3xl font-heading font-bold text-foreground mb-4">
            Master {toolName} with Professional Techniques
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Unlock the full potential of {toolName.toLowerCase()} with our comprehensive guide covering advanced techniques, 
            industry best practices, and professional workflows used by designers and developers worldwide.
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
                <CardTitle>Lightning Fast Processing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Advanced algorithms process images instantly in your browser. No waiting, no uploads, 
                  just immediate results with professional quality output.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Shield className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <CardTitle>100% Secure & Private</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  All processing happens locally in your browser. Your images never leave your device, 
                  ensuring complete privacy and security for sensitive content.
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
                  Industry-standard algorithms deliver professional results. Used by designers, 
                  photographers, and businesses for mission-critical image processing.
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
              Master these professional techniques to achieve exceptional results with your image processing workflow.
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

      {/* Best Practices */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 mb-4">
              <Target className="h-6 w-6 text-primary" />
              <h3 className="text-2xl font-heading font-bold text-foreground">
                Industry Best Practices
              </h3>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Follow these proven strategies used by professional designers and photographers to achieve 
              consistently excellent results with {toolName.toLowerCase()}.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Lightbulb className="h-5 w-5 text-blue-600" />
                  </div>
                  <CardTitle>Professional Workflow</CardTitle>
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
                  <CardTitle>Quality Optimization</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Processing Speed</span>
                    <Badge className="bg-green-100 text-green-800">Optimized</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Quality Preservation</span>
                    <Badge className="bg-blue-100 text-blue-800">Maximum</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Memory Efficiency</span>
                    <Badge className="bg-purple-100 text-purple-800">Advanced</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Batch Processing</span>
                    <Badge className="bg-orange-100 text-orange-800">Supported</Badge>
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
              <Users className="h-6 w-6 text-primary" />
              <h3 className="text-2xl font-heading font-bold text-foreground">
                Real-World Applications
              </h3>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover how professionals across industries use {toolName.toLowerCase()} to solve 
              real-world challenges and improve their workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {content.useCases.map((useCase, index) => (
              <div key={index} className="flex items-center space-x-3 p-4 bg-card rounded-lg border hover:shadow-md transition-shadow">
                <div className="p-2 bg-primary/10 rounded-full flex-shrink-0">
                  <Globe className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">{useCase}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Specifications */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-heading font-bold text-foreground mb-4">
              Technical Specifications & Capabilities
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our {toolName.toLowerCase()} supports unlimited file sizes and ultra-high resolutions 
              with enterprise-grade processing capabilities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardHeader>
                <div className="text-3xl font-bold text-primary">∞</div>
                <CardTitle className="text-lg">File Size</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  No file size limits. Process images from small thumbnails to ultra-high resolution 
                  professional photography and digital art.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="text-3xl font-bold text-primary">8K+</div>
                <CardTitle className="text-lg">Resolution</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Support for 8K, 16K, and beyond. Advanced chunked processing handles 
                  any resolution without memory limitations.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="text-3xl font-bold text-primary">20+</div>
                <CardTitle className="text-lg">Formats</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Support for all major image formats including JPEG, PNG, WebP, AVIF, 
                  TIFF, BMP, and emerging formats.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="text-3xl font-bold text-primary">100%</div>
                <CardTitle className="text-lg">Browser-Based</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Complete processing in your browser. No uploads, no servers, 
                  maximum privacy and security for your images.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Professional Tips */}
      <section className="py-8 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 mb-4">
              <Star className="h-6 w-6 text-yellow-500" />
              <h3 className="text-2xl font-heading font-bold text-foreground">
                Professional Tips & Tricks
              </h3>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Learn insider techniques used by professional photographers, graphic designers, 
              and digital artists to achieve exceptional results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <Badge className="mb-2 bg-yellow-100 text-yellow-800">Pro Tip #1</Badge>
                <CardTitle className="text-lg">Workflow Optimization</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Establish a consistent workflow by processing similar images with the same settings. 
                  This ensures brand consistency and saves time on repetitive tasks.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span>Batch process similar images</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span>Save successful settings</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span>Create processing templates</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Badge className="mb-2 bg-blue-100 text-blue-800">Pro Tip #2</Badge>
                <CardTitle className="text-lg">Quality Preservation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Always work with the highest quality source material available. Our advanced algorithms 
                  preserve maximum detail while optimizing for your specific output requirements.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span>Use original resolution sources</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span>Avoid multiple compressions</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span>Choose optimal output formats</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Badge className="mb-2 bg-green-100 text-green-800">Pro Tip #3</Badge>
                <CardTitle className="text-lg">Performance Optimization</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Optimize your processing workflow for maximum efficiency. Our tools automatically 
                  adjust processing methods based on image characteristics and system capabilities.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span>Automatic algorithm selection</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span>Memory-efficient processing</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span>Progressive enhancement</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Industry Applications */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-heading font-bold text-foreground mb-4">
              Industry Applications & Success Stories
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See how professionals across different industries leverage {toolName.toLowerCase()} 
              to solve complex challenges and improve their workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Globe className="h-5 w-5 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">E-commerce & Retail</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Online retailers use our {toolName.toLowerCase()} to optimize product images for faster 
                  loading, better mobile experience, and improved conversion rates.
                </p>
                <div className="space-y-1 text-sm">
                  <div>• Product catalog optimization</div>
                  <div>• Mobile-responsive image sizing</div>
                  <div>• Thumbnail generation</div>
                  <div>• Watermark protection</div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <BookOpen className="h-5 w-5 text-green-600" />
                  </div>
                  <CardTitle className="text-lg">Digital Marketing</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Marketing teams rely on our tools for creating platform-specific content, 
                  optimizing ad creatives, and maintaining brand consistency across channels.
                </p>
                <div className="space-y-1 text-sm">
                  <div>• Social media content creation</div>
                  <div>• Ad creative optimization</div>
                  <div>• Brand asset management</div>
                  <div>• Campaign material preparation</div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Award className="h-5 w-5 text-purple-600" />
                  </div>
                  <CardTitle className="text-lg">Creative Professionals</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Photographers, designers, and artists use our advanced processing capabilities 
                  for portfolio preparation, client deliverables, and creative projects.
                </p>
                <div className="space-y-1 text-sm">
                  <div>• Portfolio optimization</div>
                  <div>• Client deliverable preparation</div>
                  <div>• Print production workflows</div>
                  <div>• Creative project enhancement</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Technical Deep Dive */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-heading font-bold text-foreground mb-4">
              Advanced Technical Capabilities
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Understanding the technical foundation behind our {toolName.toLowerCase()} helps you 
              make informed decisions and achieve optimal results for your specific needs.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-yellow-500" />
                  Processing Algorithms
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Advanced Image Processing</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Our {toolName.toLowerCase()} employs state-of-the-art algorithms including Lanczos 
                    resampling, bicubic interpolation, and edge-preserving smoothing for superior results.
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-muted p-2 rounded">Lanczos Filtering</div>
                    <div className="bg-muted p-2 rounded">Bicubic Interpolation</div>
                    <div className="bg-muted p-2 rounded">Edge Preservation</div>
                    <div className="bg-muted p-2 rounded">Color Space Optimization</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Memory Management</h4>
                  <p className="text-sm text-muted-foreground">
                    Intelligent chunked processing and progressive rendering enable handling of 
                    unlimited file sizes without browser memory limitations.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-green-500" />
                  Security & Privacy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Local Processing</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    All image processing happens entirely in your browser using WebAssembly and 
                    Canvas APIs. Your images never leave your device.
                  </p>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center">
                      <CheckCircle className="h-3 w-3 text-green-600 mr-2" />
                      <span>Zero server uploads</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-3 w-3 text-green-600 mr-2" />
                      <span>Complete data privacy</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-3 w-3 text-green-600 mr-2" />
                      <span>GDPR compliant</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Enterprise Security</h4>
                  <p className="text-sm text-muted-foreground">
                    Suitable for processing confidential images, proprietary designs, 
                    and sensitive visual content with complete security.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-8 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-heading font-bold text-foreground mb-4">
              Why Choose Our {toolName} Over Alternatives?
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Compare our advanced capabilities with other image processing solutions 
              and see why professionals choose our platform.
            </p>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Feature</th>
                      <th className="text-center py-3 px-4 bg-primary/10 font-bold">PixoraTools</th>
                      <th className="text-center py-3 px-4">Other Tools</th>
                      <th className="text-center py-3 px-4">Desktop Software</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">File Size Limit</td>
                      <td className="text-center py-3 px-4 bg-primary/10">
                        <Badge className="bg-green-100 text-green-800">Unlimited</Badge>
                      </td>
                      <td className="text-center py-3 px-4">10-50MB</td>
                      <td className="text-center py-3 px-4">Varies</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Resolution Support</td>
                      <td className="text-center py-3 px-4 bg-primary/10">
                        <Badge className="bg-green-100 text-green-800">8K+ Ultra HD</Badge>
                      </td>
                      <td className="text-center py-3 px-4">4K Max</td>
                      <td className="text-center py-3 px-4">System Limited</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Privacy</td>
                      <td className="text-center py-3 px-4 bg-primary/10">
                        <Badge className="bg-green-100 text-green-800">100% Local</Badge>
                      </td>
                      <td className="text-center py-3 px-4">Server Upload</td>
                      <td className="text-center py-3 px-4">Local</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Cost</td>
                      <td className="text-center py-3 px-4 bg-primary/10">
                        <Badge className="bg-green-100 text-green-800">Free</Badge>
                      </td>
                      <td className="text-center py-3 px-4">$5-20/month</td>
                      <td className="text-center py-3 px-4">$50-500+</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium">Installation Required</td>
                      <td className="text-center py-3 px-4 bg-primary/10">
                        <Badge className="bg-green-100 text-green-800">None</Badge>
                      </td>
                      <td className="text-center py-3 px-4">Browser Only</td>
                      <td className="text-center py-3 px-4">Full Install</td>
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
              maximize your image processing efficiency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How large files can I process?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Our {toolName.toLowerCase()} supports unlimited file sizes. We use advanced chunked 
                  processing and progressive rendering to handle everything from small thumbnails 
                  to ultra-high resolution professional photography and digital art files.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What resolutions are supported?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We support any resolution including 4K, 8K, 16K and beyond. Our intelligent 
                  processing algorithms automatically optimize for your specific image dimensions 
                  and system capabilities.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Is my data secure and private?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Absolutely. All processing happens locally in your browser using advanced 
                  WebAssembly and Canvas technologies. Your images never leave your device, 
                  ensuring complete privacy and security.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How does batch processing work?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Upload multiple images and apply the same settings to all files simultaneously. 
                  Our optimized batch processing handles large quantities efficiently while 
                  maintaining consistent quality across all images.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}