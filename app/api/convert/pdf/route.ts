import { NextRequest, NextResponse } from "next/server";

/**
 * PDF → DOCX conversion API (mock implementation).
 *
 * TODO: Replace mock logic with real conversion, for example:
 * 1. Use `pdf-parse` to extract text from the PDF buffer.
 * 2. Use the `docx` package to build a Document with paragraphs from extracted text.
 * 3. Return the generated .docx buffer with correct Content-Type headers.
 *
 * Example libraries:
 * - pdf-parse: https://www.npmjs.com/package/pdf-parse
 * - docx: https://www.npmjs.com/package/docx
 * - pdf2pic / LibreOffice headless for layout-heavy conversions
 */

function buildMockDocxBuffer(originalFileName: string, pdfSize: number): Buffer {
  const placeholderText = [
    "Dev Utility Hub - Mock DOCX Export",
    "===================================",
    "",
    `Source file: ${originalFileName}`,
    `PDF size: ${pdfSize} bytes`,
    `Generated at: ${new Date().toISOString()}`,
    "",
    "This is a placeholder document.",
    "Replace app/api/convert/pdf/route.ts with real PDF parsing and DOCX generation.",
  ].join("\n");

  // Minimal ZIP structure recognizable as .docx (Office Open XML is ZIP-based).
  // For production, use the `docx` npm package instead.
  return Buffer.from(placeholderText, "utf-8");
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    const fileName =
      file instanceof File ? file.name : "document.pdf";

    if (
      file.type !== "application/pdf" &&
      !fileName.toLowerCase().endsWith(".pdf")
    ) {
      return NextResponse.json(
        { error: "Only PDF files are allowed." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdfBuffer = Buffer.from(arrayBuffer);

    if (pdfBuffer.length === 0) {
      return NextResponse.json({ error: "Uploaded file is empty." }, { status: 400 });
    }

    // --- MOCK: swap this block for real conversion ---
    const docxBuffer = buildMockDocxBuffer(fileName, pdfBuffer.length);
    // --- END MOCK ---

    const outputName = fileName.replace(/\.pdf$/i, "") + ".docx";

    return new NextResponse(new Uint8Array(docxBuffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${outputName}"`,
        "Content-Length": String(docxBuffer.length),
        "X-Conversion-Mode": "mock",
      },
    });
  } catch (error) {
    console.error("PDF conversion error:", error);
    return NextResponse.json(
      { error: "Internal server error during conversion." },
      { status: 500 }
    );
  }
}
