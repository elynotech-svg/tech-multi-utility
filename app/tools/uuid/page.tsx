"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/Button";
import { ToolPageHeader } from "@/components/ToolPageHeader";
import { copyToClipboard } from "@/lib/clipboard";

const BATCH_SIZE = 5;

export default function UuidToolPage() {
  const [uuids, setUuids] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const generate = () => {
    const next = Array.from({ length: BATCH_SIZE }, () => uuidv4());
    setUuids(next);
    setCopiedId(null);
    setCopiedAll(false);
  };

  const copyOne = async (id: string, value: string) => {
    const ok = await copyToClipboard(value);
    if (ok) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const copyAll = async () => {
    if (uuids.length === 0) return;
    const ok = await copyToClipboard(uuids.join("\n"));
    if (ok) {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    }
  };

  return (
    <div>
      <ToolPageHeader
        title="UUID Generator"
        description={`Generate ${BATCH_SIZE} random UUID v4 identifiers at a time.`}
      />

      <div className="space-y-6">
        <div className="flex flex-wrap gap-2">
          <Button onClick={generate}>Generate UUIDs</Button>
          {uuids.length > 0 && (
            <Button variant="secondary" onClick={copyAll}>
              {copiedAll ? "Copied all!" : "Copy all"}
            </Button>
          )}
        </div>

        {uuids.length > 0 ? (
          <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
            {uuids.map((id) => (
              <li
                key={id}
                className="flex items-center justify-between gap-4 px-4 py-3 font-mono text-sm"
              >
                <span className="break-all text-slate-800">{id}</span>
                <Button
                  variant="ghost"
                  className="shrink-0 py-1 text-xs"
                  onClick={() => copyOne(id, id)}
                >
                  {copiedId === id ? "Copied!" : "Copy"}
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
            Click &quot;Generate UUIDs&quot; to create {BATCH_SIZE} identifiers.
          </p>
        )}
      </div>
    </div>
  );
}
