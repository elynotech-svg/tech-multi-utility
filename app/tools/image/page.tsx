"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { ToolPageHeader } from "@/components/ToolPageHeader";

type OutputFormat = "jpeg" | "png";

export default function ImageToolPage() {
  const [file, setFile] = useState<File | null>(null);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("png");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    setError("");
    setPreviewUrl(null);
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
  };

  const convertClientSide = async (): Promise<boolean> => {
    if (!file) return false;

    return new Promise((resolve) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          URL.revokeObjectURL(objectUrl);
          resolve(false);
          return;
        }
        ctx.drawImage(img, 0, 0);

        const mime = outputFormat === "jpeg" ? "image/jpeg" : "image/png";
        const quality = outputFormat === "jpeg" ? 0.92 : undefined;

        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(objectUrl);
            if (!blob) {
              resolve(false);
              return;
            }
            if (downloadUrl) URL.revokeObjectURL(downloadUrl);
            const url = URL.createObjectURL(blob);
            setDownloadUrl(url);
            setPreviewUrl(url);
            const ext = outputFormat === "jpeg" ? "jpg" : "png";
            const base = file.name.replace(/\.(jpe?g|png)$/i, "") || "converted";
            setDownloadName(`${base}.${ext}`);
            resolve(true);
          },
          mime,
          quality
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(false);
      };

      img.src = objectUrl;
    });
  };

  const convertViaApi = async (): Promise<boolean> => {
    if (!file) return false;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("format", outputFormat);

    const response = await fetch("/api/convert/image", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error ?? "Conversion failed.");
    }

    const blob = await response.blob();
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    const url = URL.createObjectURL(blob);
    setDownloadUrl(url);
    setPreviewUrl(url);

    const disposition = response.headers.get("Content-Disposition");
    const match = disposition?.match(/filename="(.+)"/);
    setDownloadName(match?.[1] ?? `converted.${outputFormat === "jpeg" ? "jpg" : "png"}`);
    return true;
  };

  const convert = async () => {
    if (!file) {
      setError("Please select an image file.");
      return;
    }

    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    const ext = file.name.toLowerCase();
    const isValid =
      validTypes.includes(file.type) ||
      ext.endsWith(".jpg") ||
      ext.endsWith(".jpeg") ||
      ext.endsWith(".png");

    if (!isValid) {
      setError("Only JPG and PNG files are supported.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const ok = await convertClientSide();
      if (!ok) {
        try {
          await convertViaApi();
        } catch {
          setError(
            "Conversion failed. Try a different image or another output format."
          );
          return;
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Conversion failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <ToolPageHeader
        title="Image Converter"
        description="Convert images between JPG and PNG formats."
      />

      <div className="space-y-6">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="image-upload" className="text-sm font-medium text-slate-700">
            Image File (JPG or PNG)
          </label>
          <input
            id="image-upload"
            type="file"
            accept="image/jpeg,image/png,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-accent-hover"
          />
          {file && (
            <p className="text-xs text-slate-500">
              Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-slate-700">Output format</span>
          <div className="flex gap-2">
            <Button
              variant={outputFormat === "jpeg" ? "primary" : "secondary"}
              onClick={() => setOutputFormat("jpeg")}
            >
              JPG
            </Button>
            <Button
              variant={outputFormat === "png" ? "primary" : "secondary"}
              onClick={() => setOutputFormat("png")}
            >
              PNG
            </Button>
          </div>
        </div>

        <Button onClick={convert} loading={loading} disabled={!file}>
          Convert
        </Button>

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </p>
        )}

        {previewUrl && downloadUrl && (
          <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm font-medium text-slate-700">Preview</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Converted preview"
              className="max-h-64 rounded border border-slate-200 object-contain"
            />
            <a
              href={downloadUrl}
              download={downloadName}
              className="inline-flex rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
            >
              Download {downloadName}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
