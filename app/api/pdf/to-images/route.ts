import { type NextRequest, NextResponse } from "next/server"
import { ServerPDFProcessor } from "@/lib/processors/server-pdf-processor"
import JSZip from "jszip"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const options = JSON.parse((formData.get("options") as string) || "{}")

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "File must be a PDF" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const imageBuffers = await ServerPDFProcessor.pdfToImages(buffer, options)

    if (imageBuffers.length === 1) {
      // Single image - return directly with proper filename
      const format = options.outputFormat || "png"
      const filename = `${file.name.replace(".pdf", "")}_page_1.${format}`
      const mimeType = format === "jpeg" || format === "jpg" ? "image/jpeg" : "image/png"

      return new NextResponse(imageBuffers[0], {
        headers: {
          "Content-Type": mimeType,
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Content-Length": imageBuffers[0].length.toString(),
        },
      })
    } else {
      // Multiple images - create ZIP
      const zip = new JSZip()
      const format = options.outputFormat || "png"

      imageBuffers.forEach((imageBuffer, index) => {
        const filename = `${file.name.replace(".pdf", "")}_page_${index + 1}.${format}`
        zip.file(filename, imageBuffer)
      })

      const zipBuffer = await zip.generateAsync({
        type: "nodebuffer",
        compression: "DEFLATE",
        compressionOptions: { level: 6 },
        streamFiles: true
      })

      const zipFilename = `${file.name.replace(".pdf", "")}_images.zip`

      return new NextResponse(zipBuffer, {
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition": `attachment; filename="${zipFilename}"`,
          "Content-Length": zipBuffer.length.toString(),
        },
      })
    }
  } catch (error) {
    console.error("PDF to images API error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to convert PDF to images" },
      { status: 500 },
    )
  }
}
