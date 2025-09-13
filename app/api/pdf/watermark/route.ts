import { type NextRequest, NextResponse } from "next/server"
import { ServerPDFProcessor } from "@/lib/processors/server-pdf-processor"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const watermarkImage = formData.get("watermarkImage") as File | null
    const options = JSON.parse((formData.get("options") as string) || "{}")

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "File must be a PDF" }, { status: 400 })
    }

    if (!options.watermarkText && !watermarkImage) {
      return NextResponse.json({ error: "Watermark text or image is required" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    // Add watermark image to options if provided
    if (watermarkImage) {
      options.watermarkImage = Buffer.from(await watermarkImage.arrayBuffer())
    }

    const watermarkedBuffer = await ServerPDFProcessor.addWatermark(buffer, options)

    const filename = `${file.name.replace(".pdf", "")}_watermarked.pdf`

    // Always return single file directly (no ZIP for single file)
    return new NextResponse(watermarkedBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": watermarkedBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error("PDF watermark API error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to add watermark to PDF" },
      { status: 500 },
    )
  }
}
