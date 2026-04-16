import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { buildOpenApiSpec } from "./openapi-spec";

if (process.argv.includes("--write")) {
  const outDir = path.resolve(process.cwd(), ".generated");
  const outPath = path.resolve(outDir, "cli-api.openapi.generated.json");

  if (!existsSync(outDir)) {
    mkdirSync(outDir, { recursive: true });
  }

  writeFileSync(outPath, JSON.stringify(buildOpenApiSpec(), null, 2));
  // eslint-disable-next-line no-console
  console.log(`OpenAPI written to ${outPath}`);
}
