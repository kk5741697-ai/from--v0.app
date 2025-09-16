import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { LucideIcon } from "lucide-react"

interface ToolCardProps {
  title: string
  description: string
  href: string
  icon: LucideIcon
  category: string
  isNew?: boolean
  isPremium?: boolean
}

export function ToolCard({
  title,
  description,
  href,
  icon: Icon,
  category,
  isNew = false,
  isPremium = false,
}: ToolCardProps) {
  return (
    <Link href={href} className="group">
      <Card className="h-full tool-card border-2 border-gray-200 hover:border-blue-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white/95 backdrop-blur-md">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 group-hover:from-blue-200 group-hover:to-purple-200 transition-all duration-300 shadow-lg group-hover:scale-110">
                <Icon className="h-6 w-6 text-blue-600 group-hover:text-blue-700" />
              </div>
              <div>
                <CardTitle className="text-lg font-heading font-bold group-hover:text-blue-600 transition-colors">
                  {title}
                </CardTitle>
                <Badge variant="secondary" className="text-xs mt-2 font-semibold">
                  {category}
                </Badge>
              </div>
            </div>
            <div className="flex flex-col space-y-1">
              {isNew && (
                <Badge variant="default" className="text-xs bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold animate-pulse">
                  New
                </Badge>
              )}
              {isPremium && (
                <Badge variant="outline" className="text-xs font-semibold border-orange-300 text-orange-600">
                  Pro
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-base leading-relaxed group-hover:text-gray-700 transition-colors">{description}</CardDescription>
        </CardContent>
      </Card>
    </Link>
  )
}
