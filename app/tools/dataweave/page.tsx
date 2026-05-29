"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/Button";
import { ResultBox } from "@/components/ResultBox";
import { TextareaWithLabel } from "@/components/TextareaWithLabel";
import { ToolPageHeader } from "@/components/ToolPageHeader";
import {
  dataWeaveLessons,
  dataWeaveOutputTypes,
  dataWeaveSuggestions,
  dataWeaveSnippets,
  type DataWeaveSuggestion,
  type DataWeaveSnippet,
} from "@/lib/dataweave";

type ActiveTab = "learn" | "builder" | "snippets";

type MappingRow = {
  id: string;
  field: string;
  expression: string;
};

type ExecutionResponse = {
  output?: string;
  stdout?: string;
  stderr?: string;
  error?: string;
  exitCode?: number;
};

type ExecuteOptions = {
  auto?: boolean;
};

const snippetCategories = [
  "All",
  "Core",
  "Arrays",
  "Objects",
  "Strings",
  "Dates",
  "XML",
  "Runtime",
] as const;

const starterRows: MappingRow[] = [
  { id: "1", field: "id", expression: "payload.id" },
  {
    id: "2",
    field: "displayName",
    expression: 'payload.firstName ++ " " ++ payload.lastName',
  },
  { id: "3", field: "active", expression: "payload.active default false" },
];

const AUTO_RUN_DELAY_MS = 900;

function makeRow(): MappingRow {
  return {
    id: crypto.randomUUID(),
    field: "",
    expression: "",
  };
}

function formatDataWeave(script: string) {
  return script
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function quoteObjectKey(key: string) {
  return /^[A-Za-z_$][\w$]*$/.test(key) ? key : `"${key.replace(/"/g, '\\"')}"`;
}

function buildMappingScript(rows: MappingRow[], outputType: string) {
  const mappings = rows
    .filter((row) => row.field.trim() && row.expression.trim())
    .map(
      (row) =>
        `  ${quoteObjectKey(row.field.trim())}: ${row.expression.trim()}`
    );

  const body =
    mappings.length > 0
      ? mappings.join(",\n")
      : "  // Add output fields and DataWeave expressions below";

  return `%dw 2.0
output ${outputType}
---
{
${body}
}`;
}

function getScriptChecks(script: string) {
  const checks = [
    {
      label: "DataWeave 2.x header",
      ok: /^%dw\s+2\.0/m.test(script),
      hint: "Add %dw 2.0 at the top of the script.",
    },
    {
      label: "Output directive",
      ok: /^output\s+[\w/+.-]+/m.test(script),
      hint: "Declare the target media type, for example output application/json.",
    },
    {
      label: "Body separator",
      ok: script.includes("---"),
      hint: "Separate directives from the body with ---.",
    },
    {
      label: "Balanced braces",
      ok:
        (script.match(/{/g)?.length ?? 0) ===
        (script.match(/}/g)?.length ?? 0),
      hint: "Check that every opening brace has a closing brace.",
    },
  ];

  return checks;
}

function summarizePayload(payload: string) {
  try {
    const parsed = JSON.parse(payload);

    if (Array.isArray(parsed)) {
      return `JSON array with ${parsed.length} item${parsed.length === 1 ? "" : "s"}.`;
    }

    if (parsed && typeof parsed === "object") {
      return `JSON object with keys: ${Object.keys(parsed).join(", ") || "none"}.`;
    }

    return `JSON ${typeof parsed} value.`;
  } catch {
    if (payload.trim().startsWith("<")) {
      return "XML-like payload. Use namespace declarations for qualified elements.";
    }

    if (payload.includes(",")) {
      return "Delimited text or CSV-like payload. Declare input payload application/csv when needed.";
    }

    return "Plain text payload.";
  }
}

function getPayloadSelectors(payload: string): DataWeaveSuggestion[] {
  try {
    const parsed = JSON.parse(payload);
    const source = Array.isArray(parsed) ? parsed[0] : parsed;

    if (!source || typeof source !== "object" || Array.isArray(source)) {
      return [];
    }

    return Object.keys(source)
      .slice(0, 8)
      .map((key) => ({
        id: `payload-${key}`,
        label: `payload.${key}`,
        description: `Insert selector for the ${key} field.`,
        insertText: `payload.${key}`,
      }));
  } catch {
    return [];
  }
}

function getContextSuggestions(
  script: string,
  payload: string
): DataWeaveSuggestion[] {
  const lowerScript = script.toLowerCase();
  const suggestions = [...getPayloadSelectors(payload)];

  if (!lowerScript.includes("map")) {
    suggestions.push(
      dataWeaveSuggestions.find((item) => item.id === "map-array")!
    );
  }

  if (!lowerScript.includes("default")) {
    suggestions.push(
      dataWeaveSuggestions.find((item) => item.id === "default-value")!
    );
  }

  if (!lowerScript.includes("update")) {
    suggestions.push(
      dataWeaveSuggestions.find((item) => item.id === "update-operator")!
    );
  }

  suggestions.push(
    ...dataWeaveSuggestions.filter((item) =>
      ["filter-array", "object-output", "match-expression", "group-by"].includes(
        item.id
      )
    )
  );

  return suggestions
    .filter((suggestion): suggestion is DataWeaveSuggestion => Boolean(suggestion))
    .filter(
      (suggestion, index, all) =>
        all.findIndex((item) => item.id === suggestion.id) === index
    )
    .slice(0, 10);
}

export default function DataWeaveToolPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("learn");
  const [lessonId, setLessonId] = useState(dataWeaveLessons[0].id);
  const lesson = dataWeaveLessons.find((item) => item.id === lessonId) ?? dataWeaveLessons[0];
  const [payload, setPayload] = useState(lesson.payload);
  const [script, setScript] = useState(lesson.script);
  const [outputType, setOutputType] = useState(lesson.outputMime);
  const [rows, setRows] = useState<MappingRow[]>(starterRows);
  const [snippetQuery, setSnippetQuery] = useState("");
  const [snippetCategory, setSnippetCategory] =
    useState<(typeof snippetCategories)[number]>("All");
  const [selectedSnippetId, setSelectedSnippetId] = useState(dataWeaveSnippets[0].id);
  const [executionOutput, setExecutionOutput] = useState("");
  const [executionError, setExecutionError] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [autoRun, setAutoRun] = useState(true);
  const [executionUnavailable, setExecutionUnavailable] = useState(false);
  const [lastRunMode, setLastRunMode] = useState<"manual" | "auto" | null>(null);
  const runSequenceRef = useRef(0);

  const selectedSnippet =
    dataWeaveSnippets.find((snippet) => snippet.id === selectedSnippetId) ??
    dataWeaveSnippets[0];

  const filteredSnippets = useMemo(() => {
    const query = snippetQuery.trim().toLowerCase();

    return dataWeaveSnippets.filter((snippet) => {
      const matchesCategory =
        snippetCategory === "All" || snippet.category === snippetCategory;
      const matchesQuery =
        !query ||
        `${snippet.title} ${snippet.description} ${snippet.code}`
          .toLowerCase()
          .includes(query);

      return matchesCategory && matchesQuery;
    });
  }, [snippetCategory, snippetQuery]);

  const generatedScript = useMemo(
    () => buildMappingScript(rows, outputType),
    [outputType, rows]
  );

  const scriptChecks = useMemo(() => getScriptChecks(script), [script]);
  const payloadSummary = useMemo(() => summarizePayload(payload), [payload]);
  const contextSuggestions = useMemo(
    () => getContextSuggestions(script, payload),
    [payload, script]
  );

  const selectLesson = (id: string) => {
    const nextLesson =
      dataWeaveLessons.find((item) => item.id === id) ?? dataWeaveLessons[0];

    setLessonId(nextLesson.id);
    setPayload(nextLesson.payload);
    setScript(nextLesson.script);
    setOutputType(nextLesson.outputMime);
    setExecutionOutput("");
    setExecutionError(false);
    setExecutionUnavailable(false);
  };

  const updateRow = (id: string, field: keyof MappingRow, value: string) => {
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const removeRow = (id: string) => {
    setRows((current) => current.filter((row) => row.id !== id));
  };

  const insertSuggestion = (insertText: string) => {
    setScript((current) => {
      const separator = current.endsWith("\n") || current.length === 0 ? "" : "\n";
      return `${current}${separator}${insertText}`;
    });
  };

  const executeScript = useCallback(async (options: ExecuteOptions = {}) => {
    const runId = runSequenceRef.current + 1;
    runSequenceRef.current = runId;
    setExecuting(true);
    setLastRunMode(options.auto ? "auto" : "manual");
    setExecutionError(false);
    if (!options.auto) {
      setExecutionOutput("");
      setExecutionUnavailable(false);
    }

    try {
      const response = await fetch("/api/dataweave/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          script,
          payload,
          inputMime: lesson.inputMime,
        }),
      });
      const data = (await response.json()) as ExecutionResponse;

      if (runId !== runSequenceRef.current) return;

      if (!response.ok) {
        setExecutionError(true);
        if (response.status === 503) {
          setExecutionUnavailable(true);
          setAutoRun(false);
        }
        setExecutionOutput(
          [
            data.error ?? "DataWeave execution failed.",
            data.stderr ? `\nSTDERR:\n${data.stderr}` : "",
            data.stdout ? `\nSTDOUT:\n${data.stdout}` : "",
            data.exitCode !== undefined ? `\nExit code: ${data.exitCode}` : "",
          ]
            .filter(Boolean)
            .join("")
        );
        return;
      }

      setExecutionOutput(
        data.stderr ? `${data.output ?? ""}\n\nSTDERR:\n${data.stderr}` : data.output ?? ""
      );
    } catch (error) {
      if (runId !== runSequenceRef.current) return;
      setExecutionError(true);
      setExecutionOutput(
        error instanceof Error
          ? error.message
          : "Unable to call the DataWeave execution API."
      );
    } finally {
      if (runId === runSequenceRef.current) {
        setExecuting(false);
      }
    }
  }, [lesson.inputMime, payload, script]);

  useEffect(() => {
    if (!autoRun || executionUnavailable || activeTab !== "learn") return;
    if (!script.trim()) return;

    const timeout = window.setTimeout(() => {
      void executeScript({ auto: true });
    }, AUTO_RUN_DELAY_MS);

    return () => window.clearTimeout(timeout);
  }, [activeTab, autoRun, executeScript, executionUnavailable, script]);

  return (
    <div>
      <ToolPageHeader
        title="DataWeave Learn Lab"
        description="Explore MuleSoft DataWeave 2.x examples, reusable snippets, and mapping script templates."
      />

      <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-950">
        This lab can execute DataWeave through the official MuleSoft
        <code className="mx-1 rounded bg-blue-100 px-1">dw</code>
        CLI when it is installed on the server. If the CLI is unavailable, the
        run button will explain how to enable it.
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <Button
          variant={activeTab === "learn" ? "primary" : "secondary"}
          onClick={() => setActiveTab("learn")}
        >
          Learn examples
        </Button>
        <Button
          variant={activeTab === "builder" ? "primary" : "secondary"}
          onClick={() => setActiveTab("builder")}
        >
          Mapping builder
        </Button>
        <Button
          variant={activeTab === "snippets" ? "primary" : "secondary"}
          onClick={() => setActiveTab("snippets")}
        >
          Snippet library
        </Button>
      </div>

      {activeTab === "learn" && (
        <div className="space-y-6">
          <section className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[minmax(0,1fr)_220px]">
            <div>
              <label
                htmlFor="dataweave-lesson"
                className="text-sm font-medium text-slate-700"
              >
                Lesson
              </label>
              <select
                id="dataweave-lesson"
                value={lessonId}
                onChange={(event) => selectLesson(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              >
                {dataWeaveLessons.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {lesson.description}
              </p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3 text-sm">
              <p className="font-medium text-slate-900">{lesson.level}</p>
              <p className="mt-1 text-slate-600">Input: {lesson.inputMime}</p>
              <p className="text-slate-600">Output: {lesson.outputMime}</p>
              <div className="mt-3 flex flex-wrap gap-1">
                {lesson.concepts.map((concept) => (
                  <span
                    key={concept}
                    className="rounded-full bg-white px-2 py-1 text-xs text-slate-600 ring-1 ring-slate-200"
                  >
                    {concept}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <TextareaWithLabel
              label="Sample payload"
              hint={payloadSummary}
              value={payload}
              onChange={(event) => setPayload(event.target.value)}
              className="min-h-[300px]"
            />
            <div className="space-y-3">
              <TextareaWithLabel
                label="DataWeave script"
                hint="Edit the script or load another lesson."
                value={script}
                onChange={(event) => setScript(event.target.value)}
                className="min-h-[300px]"
              />
              <div className="flex flex-wrap items-center gap-2">
                <Button onClick={() => executeScript()} loading={executing}>
                  Run script
                </Button>
                <Button onClick={() => setScript(formatDataWeave(script))}>
                  Format spacing
                </Button>
                <Button variant="secondary" onClick={() => setScript(lesson.script)}>
                  Reset script
                </Button>
                <label className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={autoRun}
                    disabled={executionUnavailable}
                    onChange={(event) => setAutoRun(event.target.checked)}
                    className="h-4 w-4 accent-blue-600"
                  />
                  Auto-run
                </label>
              </div>
              <p className="text-xs text-slate-500">
                {executing
                  ? `${lastRunMode === "auto" ? "Auto-running" : "Running"} script...`
                  : autoRun
                    ? "Auto-run executes about one second after you stop typing."
                    : executionUnavailable
                      ? "Auto-run paused because the DataWeave CLI is not available on this server."
                      : "Auto-run is off. Use Run script to execute manually."}
              </p>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Auto suggestions
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Insert common DataWeave patterns or selectors detected from
                  the sample payload.
                </p>
              </div>
              <Button
                variant="ghost"
                className="justify-start px-0 text-xs sm:justify-center sm:px-3"
                onClick={() => setActiveTab("snippets")}
              >
                Browse all snippets
              </Button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {contextSuggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  type="button"
                  onClick={() => insertSuggestion(suggestion.insertText)}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left text-sm transition hover:border-accent hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
                  title={suggestion.description}
                >
                  <span className="block font-medium text-slate-900">
                    {suggestion.label}
                  </span>
                  <span className="block text-xs text-slate-500">
                    {suggestion.description}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="space-y-6">
              <ResultBox
                label="Execution output"
                value={executionOutput}
                error={executionError}
                emptyMessage="Run the script to see DataWeave CLI output."
              />
              <ResultBox
                label="Expected output for selected lesson"
                value={lesson.expectedOutput}
                emptyMessage="Select a lesson to see sample output."
              />
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900">
                Script checklist
              </h2>
              <ul className="mt-3 space-y-3">
                {scriptChecks.map((check) => (
                  <li key={check.label} className="text-sm">
                    <div
                      className={
                        check.ok
                          ? "font-medium text-green-700"
                          : "font-medium text-amber-700"
                      }
                    >
                      {check.ok ? "Pass" : "Check"}: {check.label}
                    </div>
                    {!check.ok && (
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {check.hint}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      )}

      {activeTab === "builder" && (
        <div className="space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="grid gap-4 md:grid-cols-[1fr_220px]">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Mapping script generator
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Add target fields and DataWeave expressions to draft a common
                  JSON object mapping. Expressions are inserted exactly as typed.
                </p>
              </div>
              <div>
                <label
                  htmlFor="dataweave-output-type"
                  className="text-sm font-medium text-slate-700"
                >
                  Output type
                </label>
                <select
                  id="dataweave-output-type"
                  value={outputType}
                  onChange={(event) => setOutputType(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  {dataWeaveOutputTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {rows.map((row, index) => (
                <div
                  key={row.id}
                  className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 md:grid-cols-[180px_minmax(0,1fr)_auto]"
                >
                  <div>
                    <label
                      htmlFor={`field-${row.id}`}
                      className="text-xs font-medium text-slate-600"
                    >
                      Output field {index + 1}
                    </label>
                    <input
                      id={`field-${row.id}`}
                      value={row.field}
                      onChange={(event) =>
                        updateRow(row.id, "field", event.target.value)
                      }
                      placeholder="customerName"
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`expression-${row.id}`}
                      className="text-xs font-medium text-slate-600"
                    >
                      DataWeave expression
                    </label>
                    <input
                      id={`expression-${row.id}`}
                      value={row.expression}
                      onChange={(event) =>
                        updateRow(row.id, "expression", event.target.value)
                      }
                      placeholder='payload.firstName ++ " " ++ payload.lastName'
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      variant="ghost"
                      className="w-full text-red-600 hover:text-red-700 md:w-auto"
                      onClick={() => removeRow(row.id)}
                      disabled={rows.length === 1}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button onClick={() => setRows((current) => [...current, makeRow()])}>
                Add mapping
              </Button>
              <Button variant="secondary" onClick={() => setRows(starterRows)}>
                Reset mappings
              </Button>
            </div>
          </section>

          <ResultBox
            label="Generated DataWeave script"
            value={generatedScript}
            emptyMessage="Generated script will appear here."
          />
        </div>
      )}

      {activeTab === "snippets" && (
        <div className="space-y-6">
          <section className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_220px]">
            <div>
              <label
                htmlFor="snippet-search"
                className="text-sm font-medium text-slate-700"
              >
                Search snippets
              </label>
              <input
                id="snippet-search"
                value={snippetQuery}
                onChange={(event) => setSnippetQuery(event.target.value)}
                placeholder="Search map, update, date, XML..."
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <div>
              <label
                htmlFor="snippet-category"
                className="text-sm font-medium text-slate-700"
              >
                Category
              </label>
              <select
                id="snippet-category"
                value={snippetCategory}
                onChange={(event) =>
                  setSnippetCategory(
                    event.target.value as (typeof snippetCategories)[number]
                  )
                }
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              >
                {snippetCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
            <div className="space-y-3">
              {filteredSnippets.length > 0 ? (
                filteredSnippets.map((snippet) => (
                  <SnippetCard
                    key={snippet.id}
                    snippet={snippet}
                    selected={selectedSnippet.id === snippet.id}
                    onSelect={() => setSelectedSnippetId(snippet.id)}
                  />
                ))
              ) : (
                <p className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  No snippets match your filters.
                </p>
              )}
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-accent">
                  {selectedSnippet.category}
                </p>
                <h2 className="mt-1 text-xl font-semibold text-slate-900">
                  {selectedSnippet.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {selectedSnippet.description}
                </p>
              </div>
              <ResultBox
                label="Snippet code"
                value={selectedSnippet.code}
                emptyMessage="Choose a snippet to view code."
              />
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function SnippetCard({
  snippet,
  selected,
  onSelect,
}: {
  snippet: DataWeaveSnippet;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-xl border p-4 text-left shadow-sm transition focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 ${
        selected
          ? "border-accent bg-blue-50"
          : "border-slate-200 bg-white hover:border-accent"
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-accent">
        {snippet.category}
      </p>
      <h3 className="mt-1 font-semibold text-slate-900">{snippet.title}</h3>
      <p className="mt-1 text-sm leading-6 text-slate-600">
        {snippet.description}
      </p>
    </button>
  );
}
