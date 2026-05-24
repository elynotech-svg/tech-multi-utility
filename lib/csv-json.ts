import Papa from "papaparse";

export function csvToJson(csv: string): string {
  const result = Papa.parse<Record<string, string>>(csv.trim(), {
    header: true,
    skipEmptyLines: true,
  });

  if (result.errors.length > 0) {
    const first = result.errors[0];
    throw new Error(`CSV parse error (row ${first.row ?? "?"}): ${first.message}`);
  }

  if (!result.data.length) {
    throw new Error("CSV contains no data rows.");
  }

  return JSON.stringify(result.data, null, 2);
}

export function jsonToCsv(json: string): string {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid JSON";
    throw new Error(message);
  }

  if (!Array.isArray(parsed)) {
    throw new Error("JSON must be an array of objects to convert to CSV.");
  }

  if (parsed.length === 0) {
    throw new Error("JSON array is empty.");
  }

  const rows = parsed as Record<string, unknown>[];
  if (typeof rows[0] !== "object" || rows[0] === null || Array.isArray(rows[0])) {
    throw new Error("Each array item must be a plain object.");
  }

  return Papa.unparse(rows);
}
