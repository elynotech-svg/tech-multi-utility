"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { ToolPageHeader } from "@/components/ToolPageHeader";

export default function PdfToolPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    setError("");
    setSuccess("");
  };

  const convert = async () => {
    if (!file) {
      setError("Please select a PDF file.");
      return;
    }

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Only PDF files are supported.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/convert/pdf", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Conversion failed.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download =
        file.name.replace(/\.pdf$/i, "") + ".docx" || "converted.docx";
      anchor.click();
      URL.revokeObjectURL(url);

      setSuccess("Download started. (Mock DOCX — see API route for real conversion.)");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Conversion failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <ToolPageHeader
        title="PDF → DOCX Converter"
        description="Upload a PDF file and download a converted Word document."
      />

      <div className="space-y-6">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="pdf-upload" className="text-sm font-medium text-slate-700">
            PDF File
          </label>
          <input
            id="pdf-upload"
            type="file"
            accept="application/pdf,.pdf"
            onChange={handleFileChange}
            className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-accent-hover"
          />
          {file && (
            <p className="text-xs text-slate-500">
              Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </p>
          )}
        </div>

        <Button onClick={convert} loading={loading} disabled={!file}>
          Convert
        </Button>

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </p>
        )}
        {success && (
          <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
            {success}
          </p>
        )}

        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <strong>Note:</strong> This build returns a mock DOCX placeholder. To
          enable real conversion, plug in a library such as{" "}
          <code className="rounded bg-amber-100 px-1">pdf-parse</code> +{" "}
          <code className="rounded bg-amber-100 px-1">docx</code> in{" "}
          <code className="rounded bg-amber-100 px-1">app/api/convert/pdf/route.ts</code>.
        </div>
      </div>
    </div>
  );
}
