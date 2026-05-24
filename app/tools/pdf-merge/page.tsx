"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { ToolPageHeader } from "@/components/ToolPageHeader";
import { downloadBlob } from "@/lib/download";

export default function PdfMergePage() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    setFiles(selected);
    setError("");
    setSuccess("");
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const merge = async () => {
    if (files.length < 2) {
      setError("Select at least two PDF files to merge.");
      return;
    }

    for (const file of files) {
      if (
        file.type !== "application/pdf" &&
        !file.name.toLowerCase().endsWith(".pdf")
      ) {
        setError(`"${file.name}" is not a PDF file.`);
        return;
      }
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));

      const response = await fetch("/api/pdf/merge", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Merge failed.");
      }

      const blob = await response.blob();
      downloadBlob(blob, "merged.pdf");
      setSuccess(`Merged ${files.length} PDFs into merged.pdf`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Merge failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <ToolPageHeader
        title="PDF Merge"
        description="Upload two or more PDF files and combine them into a single document."
      />

      <div className="space-y-6">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="pdf-merge-upload" className="text-sm font-medium text-slate-700">
            PDF Files (2 or more)
          </label>
          <input
            id="pdf-merge-upload"
            type="file"
            accept="application/pdf,.pdf"
            multiple
            onChange={handleFileChange}
            className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-accent-hover"
          />
        </div>

        {files.length > 0 && (
          <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white text-sm">
            {files.map((file, index) => (
              <li
                key={`${file.name}-${index}`}
                className="flex items-center justify-between gap-4 px-4 py-2"
              >
                <span className="truncate text-slate-800">
                  {index + 1}. {file.name}{" "}
                  <span className="text-slate-500">
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="shrink-0 text-xs text-red-600 hover:underline"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}

        <Button onClick={merge} loading={loading} disabled={files.length < 2}>
          Merge PDFs
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
