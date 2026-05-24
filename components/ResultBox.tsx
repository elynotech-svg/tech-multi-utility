"use client";

import { useState } from "react";
import { Button } from "./Button";
import { copyToClipboard } from "@/lib/clipboard";

type ResultBoxProps = {
  label?: string;
  value: string;
  error?: boolean;
  showCopy?: boolean;
  emptyMessage?: string;
};

export function ResultBox({
  label = "Output",
  value,
  error = false,
  showCopy = true,
  emptyMessage = "Results will appear here.",
}: ResultBoxProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!value) return;
    const ok = await copyToClipboard(value);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        {showCopy && value && (
          <Button variant="ghost" onClick={handleCopy} className="py-1 text-xs">
            {copied ? "Copied!" : "Copy"}
          </Button>
        )}
      </div>
      <pre
        className={`min-h-[100px] overflow-auto rounded-lg border px-3 py-2 font-mono text-sm whitespace-pre-wrap break-words ${
          error
            ? "border-red-200 bg-red-50 text-red-800"
            : "border-slate-300 bg-slate-50 text-slate-900"
        }`}
      >
        {value || emptyMessage}
      </pre>
    </div>
  );
}
