"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react"

interface FAQItem {
  question: string
  answer: string
  category?: string
}

interface FAQSectionProps {
  title?: string
  description?: string
  faqs: FAQItem[]
  className?: string
}

export function FAQSection({ title = "Frequently Asked Questions", description, faqs, className }: FAQSectionProps) {
  const [openItems, setOpenItems] = useState<number[]>([])

  const toggleItem = (index: number) => {
    setOpenItems((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]))
  }

  return (
    <section className={`py-12 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 mb-4">
            <HelpCircle className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-heading font-bold text-foreground">{title}</h2>
          </div>
          {description && <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{description}</p>}
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openItems.includes(index)

            return (
              <Card key={index} className="border border-border">
                <CardHeader className="pb-3">
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-0 h-auto text-left"
                    onClick={() => toggleItem(index)}
                  >
                    <CardTitle className="text-base font-medium pr-4">{faq.question}</CardTitle>
                    {isOpen ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    )}
                  </Button>
                </CardHeader>
                {isOpen && (
                  <CardContent className="pt-0">
                    <div className="text-muted-foreground leading-relaxed">{faq.answer}</div>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
