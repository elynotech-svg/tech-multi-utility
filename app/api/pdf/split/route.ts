import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";

export const runtime = "nodejs";

type SplitMode = "range" | "all";

function parsePageNumber(value: FormDataEntryValue | null): number | null {
  if (value === null || value === "") return null;
  const num = Number(value);
  if (!Number.isInteger(num) || num < 1) return null;
  return num;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const mode = (formData.get("mode") as SplitMode) || "range";
    const startPage = parsePageNumber(formData.get("startPage"));
    const endPage = parsePageNumber(formData.get("endPage"));

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "No PDF file uploaded." }, { status: 400 });
    }

    const fileName = file instanceof File ? file.name : "document.pdf";
    if (
      file.type !== "application/pdf" &&
      !fileName.toLowerCase().endsWith(".pdf")
    ) {
      return NextResponse.json(
        { error: "Only PDF files are allowed." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const sourcePdf = await PDFDocument.load(buffer);
    const totalPages = sourcePdf.getPageCount();

    if (totalPages === 0) {
      return NextResponse.json({ error: "PDF has no pages." }, { status: 400 });
    }

    if (mode === "all") {
      const zip = new JSZip();
      const baseName = fileName.replace(/\.pdf$/i, "") || "document";

      for (let i = 0; i < totalPages; i++) {
        const newPdf = await PDFDocument.create();
        const [page] = await newPdf.copyPages(sourcePdf, [i]);
        newPdf.addPage(page);
        const pageBytes = await newPdf.save();
        zip.file(`${baseName}-page-${i + 1}.pdf`, pageBytes);
      }

      const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

      return new NextResponse(new Uint8Array(zipBuffer), {
        status: 200,
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition": `attachment; filename="${baseName}-pages.zip"`,
          "Content-Length": String(zipBuffer.length),
        },
      });
    }

    const start = startPage ?? 1;
    const end = endPage ?? totalPages;

    if (start > totalPages || end > totalPages || start > end) {
      return NextResponse.json(
        {
          error: `Invalid page range. This PDF has ${totalPages} page(s). Use pages 1–${totalPages}.`,
        },
        { status: 400 }
      );
    }

    const newPdf = await PDFDocument.create();
    const pageIndices = Array.from(
      { length: end - start + 1 },
      (_, i) => start - 1 + i
    );
    const copiedPages = await newPdf.copyPages(sourcePdf, pageIndices);
    copiedPages.forEach((page) => newPdf.addPage(page));

    const pdfBytes = await newPdf.save();
    const baseName = fileName.replace(/\.pdf$/i, "") || "document";
    const outputName = `${baseName}-pages-${start}-${end}.pdf`;

    return new NextResponse(new Uint8Array(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${outputName}"`,
        "Content-Length": String(pdfBytes.length),
      },
    });
  } catch (error) {
    console.error("PDF split error:", error);
    return NextResponse.json(
      { error: "Failed to split PDF. Ensure the file is a valid PDF." },
      { status: 500 }
    );
  }
}
