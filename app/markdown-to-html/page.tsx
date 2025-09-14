"use client"

import { TextToolsLayout } from "@/components/tools-layouts/text-tools-layout"
import { FileText } from "lucide-react"

const markdownExamples = [
  {
    name: "Basic Markdown",
    content: `# Heading 1
## Heading 2
### Heading 3

This is a paragraph with **bold text** and *italic text*.

- List item 1
- List item 2
- List item 3

1. Numbered item 1
2. Numbered item 2
3. Numbered item 3

[Link to Google](https://google.com)

\`inline code\`

\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

> This is a blockquote
> with multiple lines`,
  },
  {
    name: "Table Example",
    content: `| Name | Age | City |
|------|-----|------|
| John | 30 | New York |
| Jane | 25 | Los Angeles |
| Bob | 35 | Chicago |

## Features

- [x] Completed task
- [ ] Incomplete task
- [x] Another completed task`,
  },
]

const markdownOptions = [
  {
    key: "includeCSS",
    label: "Include CSS Styling",
    type: "checkbox" as const,
    defaultValue: true,
  },
  {
    key: "sanitizeHTML",
    label: "Sanitize HTML",
    type: "checkbox" as const,
    defaultValue: true,
  },
]

function processMarkdown(input: string, options: any = {}) {
  try {
    if (!input.trim()) {
      return { output: "", error: "Input cannot be empty" }
    }

    // Simple markdown to HTML conversion
    let html = input
      // Headers
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // Bold and italic
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
      // Code
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Line breaks
      .replace(/\n/g, '<br>')
      // Lists (basic)
      .replace(/^- (.*$)/gim, '<li>$1</li>')
      .replace(/^(\d+)\. (.*$)/gim, '<li>$1. $2</li>')

    // Wrap lists
    html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')

    // Add CSS if requested
    if (options.includeCSS) {
      const css = `<style>
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
h1, h2, h3 { color: #333; margin-top: 24px; margin-bottom: 16px; }
h1 { border-bottom: 1px solid #eee; padding-bottom: 8px; }
code { background: #f6f8fa; padding: 2px 4px; border-radius: 3px; font-family: 'SF Mono', Monaco, monospace; }
a { color: #0366d6; text-decoration: none; }
a:hover { text-decoration: underline; }
ul { padding-left: 20px; }
li { margin-bottom: 4px; }
</style>`
      html = css + html
    }

    const stats = {
      "Input Lines": input.split('\n').length,
      "Output Size": `${html.length} chars`,
      "Headers": (input.match(/^#+\s/gm) || []).length,
      "Links": (input.match(/\[.*?\]\(.*?\)/g) || []).length,
    }

    return { output: html, stats }
  } catch (error) {
    return {
      output: "",
      error: "Markdown processing failed",
    }
  }
}

export default function MarkdownToHTMLPage() {
  return (
    <TextToolLayout
      title="Markdown to HTML Converter"
      description="Convert Markdown text to HTML with syntax highlighting and live preview."
      icon={FileText}
      placeholder="Enter Markdown text here..."
      outputPlaceholder="HTML output will appear here..."
      processFunction={processMarkdown}
      options={markdownOptions}
      examples={markdownExamples}
      fileExtensions={[".md", ".markdown"]}
    />
  )
}