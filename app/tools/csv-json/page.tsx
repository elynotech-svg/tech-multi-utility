"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { ResultBox } from "@/components/ResultBox";
import { TextareaWithLabel } from "@/components/TextareaWithLabel";
import { ToolPageHeader } from "@/components/ToolPageHeader";
import { csvToJson, jsonToCsv } from "@/lib/csv-json";

type Direction = "csv-to-json" | "json-to-csv";

export default function CsvJsonPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState(false);
  const [direction, setDirection] = useState<Direction>("csv-to-json");

  const convert = () => {
    setError(false);
    setOutput("");

    if (!input.trim()) {
      setOutput("Please enter input to convert.");
      setError(true);
      return;
    }

    try {
      if (direction === "csv-to-json") {
        setOutput(csvToJson(input));
      } else {
        setOutput(jsonToCsv(input));
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Conversion failed";
      setOutput(message);
      setError(true);
    }
  };

  return (
    <div>
      <ToolPageHeader
        title="CSV ↔ JSON Converter"
        description="Convert CSV data to a JSON array of objects, or JSON back to CSV."
      />

      <div className="space-y-6">
        <div className="flex gap-2">
          <Button
            variant={direction === "csv-to-json" ? "primary" : "secondary"}
            onClick={() => setDirection("csv-to-json")}
          >
            CSV → JSON
          </Button>
          <Button
            variant={direction === "json-to-csv" ? "primary" : "secondary"}
            onClick={() => setDirection("json-to-csv")}
          >
            JSON → CSV
          </Button>
        </div>

        <TextareaWithLabel
          label={direction === "csv-to-json" ? "CSV Input" : "JSON Input"}
          hint={
            direction === "csv-to-json"
              ? "First row should be column headers."
              : "Provide a JSON array of objects, e.g. [{\"name\":\"Ada\"}]"
          }
          placeholder={
            direction === "csv-to-json"
              ? "name,email\nAda,ada@example.com"
              : '[{"name":"Ada","email":"ada@example.com"}]'
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <Button onClick={convert}>Convert</Button>

        <ResultBox
          label={direction === "csv-to-json" ? "JSON Output" : "CSV Output"}
          value={output}
          error={error}
        />
      </div>
    </div>
  );
}
