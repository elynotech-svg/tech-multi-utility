"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { ResultBox } from "@/components/ResultBox";
import { TextareaWithLabel } from "@/components/TextareaWithLabel";
import { ToolPageHeader } from "@/components/ToolPageHeader";

export default function JsonToolPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState(false);

  const format = () => {
    setError(false);
    setOutput("");

    if (!input.trim()) {
      setOutput("Please enter JSON to format.");
      setError(true);
      return;
    }

    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, 2));
    } catch (e) {
      const message = e instanceof Error ? e.message : "Invalid JSON";
      setOutput(`Format error: ${message}`);
      setError(true);
    }
  };

  const validate = () => {
    setError(false);
    setOutput("");

    if (!input.trim()) {
      setOutput("Please enter JSON to validate.");
      setError(true);
      return;
    }

    try {
      JSON.parse(input);
      setOutput("✓ Valid JSON");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Invalid JSON";
      setOutput(`✗ Invalid JSON: ${message}`);
      setError(true);
    }
  };

  return (
    <div>
      <ToolPageHeader
        title="JSON Formatter & Validator"
        description="Format messy JSON or validate syntax with helpful errors."
      />

      <div className="space-y-6">
        <TextareaWithLabel
          label="JSON Input"
          placeholder='{"key": "value"}'
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <div className="flex flex-wrap gap-2">
          <Button onClick={format}>Format</Button>
          <Button variant="secondary" onClick={validate}>
            Validate
          </Button>
        </div>

        <ResultBox value={output} error={error} />
      </div>
    </div>
  );
}
