"use client"

import type { ReactNode } from "react"
import { FAQSection } from "./faq-section"
import { TutorialSection } from "./tutorial-section"
import { EducationalContent } from "./educational-content"
import { AdBanner } from "@/components/ads/ad-banner"

interface ToolContentWrapperProps {
  toolName: string
  toolDescription: string
  children: ReactNode
  beforeContent?: ReactNode
  afterContent?: ReactNode
  faqs?: Array<{ question: string; answer: string }>
  tutorials?: Array<{
    title: string
    description: string
    difficulty: "Beginner" | "Intermediate" | "Advanced"
    duration: string
    rating: number
    views: string
    type: "video" | "article" | "guide"
    href?: string
  }>
  tips?: Array<{
    title: string
    description: string
    category: string
    difficulty: "Beginner" | "Intermediate" | "Advanced"
  }>
  bestPractices?: Array<{
    title: string
    description: string
    icon: any
    benefits: string[]
  }>
  useCases?: string[]
  className?: string
}

export function ToolContentWrapper({
  toolName,
  toolDescription,
  children,
  beforeContent,
  afterContent,
  faqs = [],
  tutorials = [],
  tips = [],
  bestPractices = [],
  useCases = [],
  className,
}: ToolContentWrapperProps) {
  return (
    <div className={`min-h-screen bg-background ${className}`}>
      {/* Hero Section with Tool Description */}
      <section className="py-12 px-4 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-6">{toolName}</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">{toolDescription}</p>
        </div>
      </section>

      {/* Before Content - Rich Educational Content */}
      {beforeContent && (
        <section className="py-8">
          <div className="container mx-auto px-4">{beforeContent}</div>
        </section>
      )}

      {/* Ad Banner Before Tool */}
      <section className="py-4">
        <div className="container mx-auto px-4">
          <AdBanner adSlot="1234567890" adFormat="auto" className="max-w-3xl mx-auto" mobileOptimized={true} />
        </div>
      </section>

      {/* Main Tool Interface */}
      <section className="py-8">
        <div className="container mx-auto px-4">{children}</div>
      </section>

      {/* Ad Banner After Tool */}
      <section className="py-4">
        <div className="container mx-auto px-4">
          <AdBanner adSlot="1234567890" adFormat="auto" className="max-w-3xl mx-auto" mobileOptimized={true} />
        </div>
      </section>

      {/* After Content - Rich Educational Content */}
      {afterContent && (
        <section className="py-8">
          <div className="container mx-auto px-4">{afterContent}</div>
        </section>
      )}

      {/* Educational Content Sections */}
      {(tips.length > 0 || bestPractices.length > 0 || useCases.length > 0) && (
        <EducationalContent
          toolName={toolName}
          tips={tips}
          bestPractices={bestPractices}
          useCases={useCases}
          className="py-8"
        />
      )}

      {/* Tutorials Section */}
      {tutorials.length > 0 && (
        <TutorialSection
          title={`${toolName} Tutorials`}
          description={`Learn how to use ${toolName} effectively with our comprehensive tutorials and guides.`}
          tutorials={tutorials}
          showSteps={true}
          className="py-8 bg-muted/30"
        />
      )}

      {/* FAQ Section */}
      {faqs.length > 0 && (
        <FAQSection
          title={`${toolName} FAQ`}
          description={`Get answers to the most common questions about ${toolName} and troubleshooting tips.`}
          faqs={faqs}
          className="py-8"
        />
      )}
    </div>
  )
}
