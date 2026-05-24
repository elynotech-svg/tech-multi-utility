import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files");

    if (files.length < 2) {
      return NextResponse.json(
        { error: "Upload at least two PDF files to merge." },
        { status: 400 }
      );
    }

    const mergedPdf = await PDFDocument.create();

    for (const file of files) {
      if (!(file instanceof Blob)) continue;

      const name = file instanceof File ? file.name : "document.pdf";
      if (
        file.type !== "application/pdf" &&
        !name.toLowerCase().endsWith(".pdf")
      ) {
        return NextResponse.json(
          { error: `Invalid file type: ${name}. Only PDF files are allowed.` },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const pdf = await PDFDocument.load(buffer);
      const pageIndices = pdf.getPageIndices();
      const copiedPages = await mergedPdf.copyPages(pdf, pageIndices);
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    if (mergedPdf.getPageCount() === 0) {
      return NextResponse.json(
        { error: "No pages could be merged from the uploaded files." },
        { status: 400 }
      );
    }

    const pdfBytes = await mergedPdf.save();

    return new NextResponse(new Uint8Array(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="merged.pdf"',
        "Content-Length": String(pdfBytes.length),
      },
    });
  } catch (error) {
    console.error("PDF merge error:", error);
    return NextResponse.json(
      { error: "Failed to merge PDF files. Ensure all files are valid PDFs." },
      { status: 500 }
    );
  }
}
