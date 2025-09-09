"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, FileText, Clock, Star, ChevronRight, BookOpen, Video, Eye } from "lucide-react"
import Link from "next/link"

interface TutorialStep {
  title: string
  description: string
  icon?: any
  duration?: string
}

interface Tutorial {
  title: string
  description: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  duration: string
  rating: number
  views: string
  type: "video" | "article" | "guide"
  steps?: TutorialStep[]
  href?: string
}

interface TutorialSectionProps {
  title?: string
  description?: string
  tutorials: Tutorial[]
  showSteps?: boolean
  className?: string
}

export function TutorialSection({
  title = "Step-by-Step Tutorials",
  description,
  tutorials,
  showSteps = false,
  className,
}: TutorialSectionProps) {
  const getTypeIcon = (type: Tutorial["type"]) => {
    switch (type) {
      case "video":
        return Video
      case "article":
        return FileText
      case "guide":
        return BookOpen
      default:
        return FileText
    }
  }

  const getDifficultyColor = (difficulty: Tutorial["difficulty"]) => {
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
    <section className={`py-12 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 mb-4">
            <BookOpen className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-heading font-bold text-foreground">{title}</h2>
          </div>
          {description && <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{description}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tutorials.map((tutorial, index) => {
            const TypeIcon = getTypeIcon(tutorial.type)

            return (
              <Card key={index} className="h-full hover:shadow-lg transition-all duration-200 group">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <TypeIcon className="h-4 w-4 text-primary" />
                      <Badge className={getDifficultyColor(tutorial.difficulty)}>{tutorial.difficulty}</Badge>
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{tutorial.duration}</span>
                    </div>
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors">{tutorial.title}</CardTitle>
                  <CardDescription>{tutorial.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  {showSteps && tutorial.steps && (
                    <div className="mb-4">
                      <h4 className="font-medium text-sm mb-2">What you'll learn:</h4>
                      <ul className="space-y-1">
                        {tutorial.steps.slice(0, 3).map((step, stepIndex) => (
                          <li key={stepIndex} className="text-sm text-muted-foreground flex items-center">
                            <ChevronRight className="h-3 w-3 mr-1 text-primary" />
                            {step.title}
                          </li>
                        ))}
                        {tutorial.steps.length > 3 && (
                          <li className="text-sm text-muted-foreground">+{tutorial.steps.length - 3} more steps</li>
                        )}
                      </ul>
                    </div>
                  )}

                  <div className="mt-auto">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>{tutorial.rating}</span>
                        <span>•</span>
                        <Eye className="h-3 w-3" />
                        <span>{tutorial.views}</span>
                      </div>
                    </div>

                    {tutorial.href ? (
                      <Button asChild className="w-full">
                        <Link href={tutorial.href}>
                          <Play className="h-4 w-4 mr-2" />
                          Start Tutorial
                        </Link>
                      </Button>
                    ) : (
                      <Button className="w-full">
                        <Play className="h-4 w-4 mr-2" />
                        Start Tutorial
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
