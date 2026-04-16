import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import express, { type Request } from "express";

import { buildOpenApiSpec } from "./openapi";
import {
  commonCliOptions,
  getOptionByName,
  optionAliasToName,
} from "./options";

interface CommandResult {
  command: string[];
  durationMs: number;
  exitCode: null | number;
  startedAt: string;
  stderr: string;
  stdout: string;
  success: boolean;
}

const app = express();
const openApiSpec = buildOpenApiSpec();
const port = Number(process.env.API_PORT ?? "3100");
const host = process.env.API_HOST ?? "0.0.0.0";

app.use(express.json({ limit: "1mb" }));

const defaultIniPath = ensureDefaultIniFile();

function ensureDefaultIniFile(): string {
  const generatedDir = path.resolve(process.cwd(), ".generated");
  const generatedFile = path.resolve(generatedDir, "api-default.config.ini");
  const templatePath = path.resolve(
    process.cwd(),
    "services/cli-api/default.config.ini",
  );

  if (!existsSync(generatedDir)) {
    mkdirSync(generatedDir, { recursive: true });
  }

  if (!existsSync(generatedFile)) {
    const template = readFileSync(templatePath, "utf-8");
    writeFileSync(generatedFile, template);
  }

  return generatedFile;
}

function parseBoolean(value: unknown): boolean {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    const lowered = value.trim().toLowerCase();
    return lowered === "1" || lowered === "true";
  }

  return false;
}

function normalizeSource(
  source: Record<string, unknown>,
): Record<string, unknown> {
  const normalized: Record<string, unknown> = {};

  for (const [rawKey, value] of Object.entries(source)) {
    const canonical = rawKey.trim().toLowerCase().replace(/_/g, "-");
    normalized[optionAliasToName[canonical] ?? canonical] = value;
  }

  return normalized;
}

function collectInput(req: Request): Record<string, unknown> {
  if (req.method === "GET") {
    return normalizeSource(req.query as Record<string, unknown>);
  }

  const body = (req.body ?? {}) as Record<string, unknown>;
  return normalizeSource(body);
}

function buildArgs(
  cliCommand: "test:issuance" | "test:presentation",
  input: Record<string, unknown>,
): string[] {
  const args: string[] = ["./bin/wct", cliCommand];

  if (!input["file-ini"]) {
    args.push("--file-ini", defaultIniPath);
  }

  for (const option of commonCliOptions) {
    const rawValue = input[option.name];
    if (rawValue === undefined || rawValue === null || rawValue === "") {
      continue;
    }

    if (option.type === "boolean") {
      if (parseBoolean(rawValue)) {
        args.push(option.cliFlag);
      }
      continue;
    }

    if (option.type === "number") {
      const parsed = Number(rawValue);
      if (Number.isFinite(parsed)) {
        args.push(option.cliFlag, String(parsed));
      }
      continue;
    }

    args.push(option.cliFlag, String(rawValue));
  }

  return args;
}

function validateInput(input: Record<string, unknown>): string[] {
  const errors: string[] = [];

  for (const key of Object.keys(input)) {
    if (!getOptionByName(key)) {
      errors.push(`Unsupported parameter: ${key}`);
    }
  }

  return errors;
}

function executeCli(args: string[]): Promise<CommandResult> {
  const startedAt = new Date();

  return new Promise((resolve) => {
    const child = spawn("node", args, {
      cwd: process.cwd(),
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    child.on("close", (exitCode) => {
      const durationMs = Date.now() - startedAt.getTime();

      resolve({
        success: exitCode === 0,
        exitCode,
        stdout,
        stderr,
        durationMs,
        startedAt: startedAt.toISOString(),
        command: ["node", ...args],
      });
    });
  });
}

function docsHtml(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>WCT CLI Wrapper API Docs</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.onload = () => {
        window.SwaggerUIBundle({
          url: '/openapi.json',
          dom_id: '#swagger-ui'
        });
      };
    </script>
  </body>
</html>`;
}

async function runTest(
  req: Request,
  res: express.Response,
  cliCommand: "test:issuance" | "test:presentation",
): Promise<void> {
  const input = collectInput(req);
  const validationErrors = validateInput(input);

  if (validationErrors.length > 0) {
    res.status(400).json({ errors: validationErrors });
    return;
  }

  const args = buildArgs(cliCommand, input);
  const result = await executeCli(args);

  res.status(200).json(result);
}

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true, host, port });
});

app.get("/openapi.json", (_req, res) => {
  res.status(200).json(openApiSpec);
});

app.get("/docs", (_req, res) => {
  res.status(200).send(docsHtml());
});

app.get("/api/test/issuance", async (req, res) => {
  await runTest(req, res, "test:issuance");
});

app.post("/api/test/issuance", async (req, res) => {
  await runTest(req, res, "test:issuance");
});

app.get("/api/test/verification", async (req, res) => {
  await runTest(req, res, "test:presentation");
});

app.post("/api/test/verification", async (req, res) => {
  await runTest(req, res, "test:presentation");
});

app.get("/api/test/presentation", async (req, res) => {
  await runTest(req, res, "test:presentation");
});

app.post("/api/test/presentation", async (req, res) => {
  await runTest(req, res, "test:presentation");
});

app.listen(port, host, () => {
  // eslint-disable-next-line no-console
  console.log(`WCT CLI wrapper listening on http://${host}:${port}`);
  // eslint-disable-next-line no-console
  console.log(`Swagger UI available at http://${host}:${port}/docs`);
});
