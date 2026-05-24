"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { ResultBox } from "@/components/ResultBox";
import { TextareaWithLabel } from "@/components/TextareaWithLabel";
import { ToolPageHeader } from "@/components/ToolPageHeader";

type Mode = "encode" | "decode";

export default function Base64ToolPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState(false);
  const [mode, setMode] = useState<Mode>("encode");

  const process = () => {
    setError(false);
    setOutput("");

    if (!input.trim()) {
      setOutput("Please enter some text.");
      setError(true);
      return;
    }

    try {
      if (mode === "encode") {
        setOutput(btoa(unescape(encodeURIComponent(input))));
      } else {
        setOutput(decodeURIComponent(escape(atob(input.trim()))));
      }
    } catch {
      setOutput(
        mode === "decode"
          ? "Invalid Base64 string. Check your input and try again."
          : "Encoding failed. Please check your input."
      );
      setError(true);
    }
  };

  return (
    <div>
      <ToolPageHeader
        title="Base64 Encoder / Decoder"
        description="Encode plain text to Base64 or decode Base64 back to text."
      />

      <div className="space-y-6">
        <div className="flex gap-2">
          <Button
            variant={mode === "encode" ? "primary" : "secondary"}
            onClick={() => setMode("encode")}
          >
            Encode
          </Button>
          <Button
            variant={mode === "decode" ? "primary" : "secondary"}
            onClick={() => setMode("decode")}
          >
            Decode
          </Button>
        </div>

        <TextareaWithLabel
          label="Input"
          placeholder={
            mode === "encode"
              ? "Enter text to encode…"
              : "Enter Base64 string to decode…"
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <Button onClick={process}>Process</Button>

        <ResultBox value={output} error={error} />
      </div>
    </div>
  );
}
