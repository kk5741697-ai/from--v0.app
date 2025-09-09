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
    const splitResults = await ServerPDFProcessor.splitPDF(buffer, options)

    if (splitResults.length === 1) {
      // Single file - return directly
      const filename = `${file.name.replace(".pdf", "")}_split.pdf`

      return new NextResponse(splitResults[0], {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Content-Length": splitResults[0].length.toString(),
        },
      })
    } else {
      // Multiple files - create ZIP
      const zip = new JSZip()

      splitResults.forEach((pdfBuffer, index) => {
        const filename =
          options.selectedPages && options.selectedPages[index]
            ? `${file.name.replace(".pdf", "")}_page_${options.selectedPages[index]}.pdf`
            : `${file.name.replace(".pdf", "")}_part_${index + 1}.pdf`
        zip.file(filename, pdfBuffer)
      })

      const zipBuffer = await zip.generateAsync({
        type: "nodebuffer",
        compression: "DEFLATE",
        compressionOptions: { level: 6 },
      })

      const zipFilename = `${file.name.replace(".pdf", "")}_split.zip`

      return new NextResponse(zipBuffer, {
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition": `attachment; filename="${zipFilename}"`,
          "Content-Length": zipBuffer.length.toString(),
        },
      })
    }
  } catch (error) {
    console.error("PDF split API error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to split PDF" }, { status: 500 })
  }
}
