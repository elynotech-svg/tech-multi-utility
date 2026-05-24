"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { ResultBox } from "@/components/ResultBox";
import { TextareaWithLabel } from "@/components/TextareaWithLabel";
import { ToolPageHeader } from "@/components/ToolPageHeader";

export default function UrlToolPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState(false);

  const encode = () => {
    setError(false);
    if (!input.trim()) {
      setOutput("Please enter text to encode.");
      setError(true);
      return;
    }
    setOutput(encodeURIComponent(input));
  };

  const decode = () => {
    setError(false);
    if (!input.trim()) {
      setOutput("Please enter text to decode.");
      setError(true);
      return;
    }
    try {
      setOutput(decodeURIComponent(input));
    } catch {
      setOutput("Invalid URL-encoded string. Check your input and try again.");
      setError(true);
    }
  };

  return (
    <div>
      <ToolPageHeader
        title="URL Encoder / Decoder"
        description="Encode or decode URL components using standard URI encoding."
      />

      <div className="space-y-6">
        <TextareaWithLabel
          label="Input"
          placeholder="Enter text or URL-encoded string…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-h-[100px]"
        />

        <div className="flex flex-wrap gap-2">
          <Button onClick={encode}>Encode</Button>
          <Button variant="secondary" onClick={decode}>
            Decode
          </Button>
        </div>

        <ResultBox value={output} error={error} />
      </div>
    </div>
  );
}
