import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type OutputFormat = "jpeg" | "png";

async function convertWithSharp(
  inputBuffer: Buffer,
  format: OutputFormat
): Promise<Buffer> {
  const sharpModule = await import("sharp");
  const sharp = sharpModule.default;

  let pipeline = sharp(inputBuffer);
  if (format === "jpeg") {
    pipeline = pipeline.jpeg({ quality: 92 });
  } else {
    pipeline = pipeline.png();
  }

  return pipeline.toBuffer();
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const formatRaw = formData.get("format");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    const format: OutputFormat =
      formatRaw === "jpeg" || formatRaw === "png" ? formatRaw : "png";

    const fileName = file instanceof File ? file.name : "image";
    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    if (inputBuffer.length === 0) {
      return NextResponse.json({ error: "Uploaded file is empty." }, { status: 400 });
    }

    let outputBuffer: Buffer;
    try {
      outputBuffer = await convertWithSharp(inputBuffer, format);
    } catch {
      return NextResponse.json(
        {
          error:
            "Server-side conversion is unavailable on this platform. Use client-side conversion (enabled by default in the UI).",
        },
        { status: 503 }
      );
    }

    const ext = format === "jpeg" ? "jpg" : "png";
    const baseName = fileName.replace(/\.(jpe?g|png)$/i, "") || "converted";
    const outputName = `${baseName}.${ext}`;
    const contentType = format === "jpeg" ? "image/jpeg" : "image/png";

    return new NextResponse(new Uint8Array(outputBuffer), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${outputName}"`,
        "Content-Length": String(outputBuffer.length),
      },
    });
  } catch (error) {
    console.error("Image conversion error:", error);
    return NextResponse.json(
      { error: "Failed to convert image. Ensure the file is a valid JPG or PNG." },
      { status: 500 }
    );
  }
}
