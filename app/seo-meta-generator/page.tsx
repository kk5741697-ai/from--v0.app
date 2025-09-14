"use client"

import { useState } from "react"
import { SEOToolsLayout } from "@/components/tools-layouts/seo-tools-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Copy, Download, Globe, Eye } from "lucide-react"

interface MetaData {
  title: string
  description: string
  keywords: string
  author: string
  url: string
  image: string
  siteName: string
  twitterHandle: string
  locale: string
  type: string
}

function processMetaTags(input: string, options: any = {}) {
  try {
    const metaData = JSON.parse(input)
    const tags = []

    if (metaData.title) {
      tags.push(`<title>${metaData.title}</title>`)
      tags.push(`<meta name="title" content="${metaData.title}">`)
    }
    if (metaData.description) {
      tags.push(`<meta name="description" content="${metaData.description}">`)
    }
    if (metaData.keywords) {
      tags.push(`<meta name="keywords" content="${metaData.keywords}">`)
    }
    if (metaData.author) {
      tags.push(`<meta name="author" content="${metaData.author}">`)
    }

    if (metaData.title) {
      tags.push(`<meta property="og:title" content="${metaData.title}">`)
    }
    if (metaData.description) {
      tags.push(`<meta property="og:description" content="${metaData.description}">`)
    }
    if (metaData.url) {
      tags.push(`<meta property="og:url" content="${metaData.url}">`)
    }
    if (metaData.image) {
      tags.push(`<meta property="og:image" content="${metaData.image}">`)
    }
    if (metaData.siteName) {
      tags.push(`<meta property="og:site_name" content="${metaData.siteName}">`)
    }
    tags.push(`<meta property="og:type" content="${metaData.type || 'website'}">`)
    tags.push(`<meta property="og:locale" content="${metaData.locale || 'en_US'}">`)

    tags.push(`<meta name="twitter:card" content="summary_large_image">`)
    if (metaData.title) {
      tags.push(`<meta name="twitter:title" content="${metaData.title}">`)
    }
    if (metaData.description) {
      tags.push(`<meta name="twitter:description" content="${metaData.description}">`)
    }
    if (metaData.image) {
      tags.push(`<meta name="twitter:image" content="${metaData.image}">`)
    }
    if (metaData.twitterHandle) {
      tags.push(`<meta name="twitter:site" content="@${metaData.twitterHandle}">`)
      tags.push(`<meta name="twitter:creator" content="@${metaData.twitterHandle}">`)
    }

    tags.push(`<meta name="robots" content="index, follow">`)
    tags.push(`<meta name="viewport" content="width=device-width, initial-scale=1.0">`)
    tags.push(`<meta charset="UTF-8">`)

    const output = tags.join("\n")
    const stats = {
      "Meta Tags": tags.length,
      "Title Length": metaData.title?.length || 0,
      "Description Length": metaData.description?.length || 0,
      "Keywords": metaData.keywords?.split(',').filter((k: string) => k.trim()).length || 0
    }

    return { output, stats }
  } catch (error) {
    return {
      output: "",
      error: "Invalid JSON format for meta data"
    }
  }
}

const seoExamples = [
  {
    name: "Blog Post",
    content: JSON.stringify({
      title: "10 Best SEO Practices for 2024",
      description: "Discover the latest SEO strategies and techniques to boost your website's ranking in search engines.",
      keywords: "SEO, search engine optimization, digital marketing, website ranking",
      author: "John Smith",
      url: "https://example.com/blog/seo-practices-2024",
      image: "https://example.com/images/seo-blog-post.jpg",
      siteName: "Digital Marketing Blog",
      twitterHandle: "digitalmarketing",
      locale: "en_US",
      type: "article"
    }, null, 2)
  },
  {
    name: "Product Page",
    content: JSON.stringify({
      title: "Premium Wireless Headphones - AudioTech Pro",
      description: "Experience crystal-clear sound with our premium wireless headphones. 30-hour battery life, noise cancellation.",
      keywords: "wireless headphones, audio, music, noise cancellation, bluetooth",
      author: "AudioTech",
      url: "https://audiotech.com/products/wireless-headphones-pro",
      image: "https://audiotech.com/images/headphones-pro.jpg",
      siteName: "AudioTech Store",
      twitterHandle: "audiotech",
      locale: "en_US",
      type: "product"
    }, null, 2)
  }
]

export default function SEOMetaGeneratorPage() {
  return (
    <SEOToolsLayout
      title="SEO Meta Generator"
      description="Generate optimized meta tags, Open Graph, and Twitter Card tags for better SEO and social media sharing."
      icon={Globe}
      toolType="meta-generator"
      processFunction={processMetaTags}
      options={[]}
      outputFormats={["html"]}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Meta Data Configuration</CardTitle>
            <CardDescription>Enter your page information as JSON to generate meta tags</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Enter your page data in JSON format with fields like title, description, keywords, url, image, etc.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {seoExamples.map((example) => (
                <Button
                  key={example.name}
                  variant="outline"
                  className="h-auto p-4 text-left justify-start"
                >
                  <div>
                    <div className="font-medium">{example.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Click to load example data
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </SEOToolsLayout>
  )
}