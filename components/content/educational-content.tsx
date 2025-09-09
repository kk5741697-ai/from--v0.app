"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, Award, ArrowRight, CheckCircle, Target } from "lucide-react"

interface Tip {
  title: string
  description: string
  category: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
}

interface BestPractice {
  title: string
  description: string
  icon: any
  benefits: string[]
}

interface EducationalContentProps {
  toolName: string
  tips: Tip[]
  bestPractices: BestPractice[]
  useCases: string[]
  className?: string
}

export function EducationalContent({ toolName, tips, bestPractices, useCases, className }: EducationalContentProps) {
  const getDifficultyColor = (difficulty: Tip["difficulty"]) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-800"
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800"
      case "Advanced":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className={`space-y-12 ${className}`}>
      {/* Tips & Tricks Section */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 mb-4">
              <Lightbulb className="h-6 w-6 text-yellow-500" />
              <h2 className="text-2xl font-heading font-bold text-foreground">Pro Tips for {toolName}</h2>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Master {toolName} with these expert tips and advanced techniques used by professionals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tips.map((tip, index) => (
              <Card key={index} className="h-full hover:shadow-lg transition-all duration-200">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">{tip.category}</Badge>
                    <Badge className={getDifficultyColor(tip.difficulty)}>{tip.difficulty}</Badge>
                  </div>
                  <CardTitle className="text-lg">{tip.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="leading-relaxed">{tip.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Best Practices Section */}
      <section className="py-8 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 mb-4">
              <Award className="h-6 w-6 text-blue-500" />
              <h2 className="text-2xl font-heading font-bold text-foreground">Best Practices & Guidelines</h2>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Follow these industry-standard practices to achieve optimal results with {toolName}.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {bestPractices.map((practice, index) => {
              const Icon = practice.icon

              return (
                <Card key={index} className="h-full">
                  <CardHeader>
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{practice.title}</CardTitle>
                    </div>
                    <CardDescription className="leading-relaxed">{practice.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm text-foreground">Key Benefits:</h4>
                      <ul className="space-y-1">
                        {practice.benefits.map((benefit, benefitIndex) => (
                          <li key={benefitIndex} className="flex items-center text-sm text-muted-foreground">
                            <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 mb-4">
              <Target className="h-6 w-6 text-green-500" />
              <h2 className="text-2xl font-heading font-bold text-foreground">Common Use Cases</h2>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover how professionals and businesses use {toolName} to solve real-world challenges.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {useCases.map((useCase, index) => (
              <div key={index} className="flex items-center space-x-3 p-4 bg-card rounded-lg border">
                <div className="p-2 bg-primary/10 rounded-full flex-shrink-0">
                  <ArrowRight className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">{useCase}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
