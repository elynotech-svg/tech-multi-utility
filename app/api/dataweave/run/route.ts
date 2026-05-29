import { randomUUID } from "crypto";
import { spawn } from "child_process";
import { mkdir, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_SCRIPT_SIZE = 50_000;
const MAX_PAYLOAD_SIZE = 250_000;
const MAX_OUTPUT_SIZE = 500_000;
const EXECUTION_TIMEOUT_MS = 8_000;

type DataWeaveRunRequest = {
  script?: unknown;
  payload?: unknown;
  inputMime?: unknown;
};

type RunResult = {
  stdout: string;
  stderr: string;
  exitCode: number | null;
  timedOut: boolean;
};

const inputExtensions: Record<string, string> = {
  "application/json": "json",
  "application/xml": "xml",
  "application/csv": "csv",
  "text/plain": "txt",
};

function getPayloadExtension(inputMime: string) {
  return inputExtensions[inputMime] ?? "txt";
}

function appendLimited(current: string, chunk: Buffer) {
  if (current.length >= MAX_OUTPUT_SIZE) return current;

  const next = current + chunk.toString("utf8");
  return next.length > MAX_OUTPUT_SIZE
    ? `${next.slice(0, MAX_OUTPUT_SIZE)}\n...output truncated...`
    : next;
}

function runDataWeaveCli(
  cliPath: string,
  script: string,
  payloadPath: string
): Promise<RunResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(cliPath, ["run", "-i", "payload", payloadPath, script], {
      windowsHide: true,
    });

    let stdout = "";
    let stderr = "";
    let timedOut = false;

    const timeout = setTimeout(() => {
      timedOut = true;
      child.kill("SIGKILL");
    }, EXECUTION_TIMEOUT_MS);

    child.stdout.on("data", (chunk: Buffer) => {
      stdout = appendLimited(stdout, chunk);
    });

    child.stderr.on("data", (chunk: Buffer) => {
      stderr = appendLimited(stderr, chunk);
    });

    child.on("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });

    child.on("close", (exitCode) => {
      clearTimeout(timeout);
      resolve({ stdout, stderr, exitCode, timedOut });
    });
  });
}

export async function POST(request: NextRequest) {
  let workingDirectory = "";

  try {
    const body = (await request.json()) as DataWeaveRunRequest;
    const script = typeof body.script === "string" ? body.script : "";
    const payload = typeof body.payload === "string" ? body.payload : "";
    const inputMime =
      typeof body.inputMime === "string" ? body.inputMime : "application/json";

    if (!script.trim()) {
      return NextResponse.json(
        { error: "Enter a DataWeave script to execute." },
        { status: 400 }
      );
    }

    if (script.length > MAX_SCRIPT_SIZE) {
      return NextResponse.json(
        { error: "Script is too large to execute in the browser lab." },
        { status: 413 }
      );
    }

    if (payload.length > MAX_PAYLOAD_SIZE) {
      return NextResponse.json(
        { error: "Payload is too large to execute in the browser lab." },
        { status: 413 }
      );
    }

    const cliPath = process.env.DATAWEAVE_CLI_PATH || "dw";
    workingDirectory = path.join(tmpdir(), `dataweave-${randomUUID()}`);
    await mkdir(workingDirectory, { recursive: true });

    const payloadPath = path.join(
      workingDirectory,
      `payload.${getPayloadExtension(inputMime)}`
    );
    await writeFile(payloadPath, payload, "utf8");

    const result = await runDataWeaveCli(cliPath, script, payloadPath);

    if (result.timedOut) {
      return NextResponse.json(
        {
          error:
            "DataWeave execution timed out. Reduce the payload size or script complexity.",
          stderr: result.stderr,
        },
        { status: 408 }
      );
    }

    if (result.exitCode !== 0) {
      return NextResponse.json(
        {
          error: "DataWeave execution failed.",
          stdout: result.stdout,
          stderr: result.stderr,
          exitCode: result.exitCode,
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      output: result.stdout.trimEnd(),
      stderr: result.stderr.trimEnd(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const code = (error as NodeJS.ErrnoException | undefined)?.code;

    if (code === "ENOENT") {
      return NextResponse.json(
        {
          error:
            "DataWeave CLI is not installed on this server. Install the MuleSoft dw CLI and set DATAWEAVE_CLI_PATH if it is not on PATH.",
        },
        { status: 503 }
      );
    }

    console.error("DataWeave execution error:", error);
    return NextResponse.json(
      { error: `Failed to execute DataWeave script: ${message}` },
      { status: 500 }
    );
  } finally {
    if (workingDirectory) {
      await rm(workingDirectory, { recursive: true, force: true }).catch(() => {});
    }
  }
}
