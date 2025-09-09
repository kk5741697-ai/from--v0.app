import { type NextRequest, NextResponse } from "next/server"
import { ServerPDFProcessor } from "@/lib/processors/server-pdf-processor"

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

    if (!options.userPassword) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const protectedBuffer = await ServerPDFProcessor.addPasswordProtection(buffer, options)

    const filename = `${file.name.replace(".pdf", "")}_protected.pdf`

    return new NextResponse(protectedBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": protectedBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error("PDF protect API error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to protect PDF" },
      { status: 500 },
    )
  }
}
