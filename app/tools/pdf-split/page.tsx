"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { ToolPageHeader } from "@/components/ToolPageHeader";
import { downloadBlob } from "@/lib/download";

type SplitMode = "range" | "all";

export default function PdfSplitPage() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<SplitMode>("range");
  const [startPage, setStartPage] = useState("1");
  const [endPage, setEndPage] = useState("1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    setError("");
    setSuccess("");
  };

  const split = async () => {
    if (!file) {
      setError("Please select a PDF file.");
      return;
    }

    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      setError("Only PDF files are supported.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("mode", mode);
      if (mode === "range") {
        formData.append("startPage", startPage);
        formData.append("endPage", endPage);
      }

      const response = await fetch("/api/pdf/split", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Split failed.");
      }

      const blob = await response.blob();
      const disposition = response.headers.get("Content-Disposition");
      const match = disposition?.match(/filename="(.+)"/);
      const filename =
        match?.[1] ??
        (mode === "all"
          ? `${file.name.replace(/\.pdf$/i, "")}-pages.zip`
          : "split.pdf");

      downloadBlob(blob, filename);
      setSuccess(
        mode === "all"
          ? "Download started — one PDF per page in a ZIP archive."
          : "Download started — extracted page range saved as PDF."
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Split failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <ToolPageHeader
        title="PDF Split"
        description="Extract a page range or split every page into separate PDF files."
      />

      <div className="space-y-6">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="pdf-split-upload" className="text-sm font-medium text-slate-700">
            PDF File
          </label>
          <input
            id="pdf-split-upload"
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

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700">Split mode</span>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={mode === "range" ? "primary" : "secondary"}
              onClick={() => setMode("range")}
            >
              Page range
            </Button>
            <Button
              variant={mode === "all" ? "primary" : "secondary"}
              onClick={() => setMode("all")}
            >
              All pages (ZIP)
            </Button>
          </div>
        </div>

        {mode === "range" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="start-page" className="text-sm font-medium text-slate-700">
                Start page
              </label>
              <input
                id="start-page"
                type="number"
                min={1}
                value={startPage}
                onChange={(e) => setStartPage(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="end-page" className="text-sm font-medium text-slate-700">
                End page
              </label>
              <input
                id="end-page"
                type="number"
                min={1}
                value={endPage}
                onChange={(e) => setEndPage(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>
        )}

        {mode === "all" && (
          <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
            Each page will be exported as its own PDF inside a ZIP file.
          </p>
        )}

        <Button onClick={split} loading={loading} disabled={!file}>
          Split PDF
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
      </div>
    </div>
  );
}
