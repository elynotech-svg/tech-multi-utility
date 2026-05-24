"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { ResultBox } from "@/components/ResultBox";
import { TextareaWithLabel } from "@/components/TextareaWithLabel";
import { ToolPageHeader } from "@/components/ToolPageHeader";
import { formatXml, validateXml } from "@/lib/xml";

export default function XmlToolPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState(false);

  const format = () => {
    setError(false);
    setOutput("");

    try {
      setOutput(formatXml(input));
    } catch (e) {
      const message = e instanceof Error ? e.message : "Invalid XML";
      setOutput(`Format error: ${message}`);
      setError(true);
    }
  };

  const validate = () => {
    setError(false);
    setOutput("");

    try {
      validateXml(input);
      setOutput("✓ Valid XML");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Invalid XML";
      setOutput(`✗ ${message}`);
      setError(true);
    }
  };

  return (
    <div>
      <ToolPageHeader
        title="XML Formatter"
        description="Format messy XML with indentation or validate syntax."
      />

      <div className="space-y-6">
        <TextareaWithLabel
          label="XML Input"
          placeholder="<root><item>value</item></root>"
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
