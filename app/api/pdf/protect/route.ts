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

    if (!options.userPassword || options.userPassword.trim() === "") {
      return NextResponse.json({ error: "Password cannot be empty" }, { status: 400 })
    }

    if (options.userPassword.length < 6) {
      return NextResponse.json({ error: "Password too short (minimum 6 characters)" }, { status: 400 })
    }

    if (options.userPassword.length > 32) {
      return NextResponse.json({ error: "Password too long (maximum 32 characters)" }, { status: 400 })
    }

    // Check for invalid characters
    const invalidChars = /[^\x20-\x7E]/
    if (invalidChars.test(options.userPassword)) {
      return NextResponse.json({ error: "Password contains unsupported characters. Please use only ASCII characters." }, { status: 400 })
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
    
    // Provide user-friendly error messages
    let errorMessage = "Failed to protect PDF"
    if (error instanceof Error) {
      if (error.message.includes("password")) {
        errorMessage = "Password validation failed. Please use 6-32 ASCII characters."
      } else if (error.message.includes("corrupt")) {
        errorMessage = "PDF file appears to be corrupted or invalid."
      } else {
        errorMessage = error.message
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 },
    )
  }
}
