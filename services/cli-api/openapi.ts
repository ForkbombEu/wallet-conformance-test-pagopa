import { writeFileSync } from "node:fs";
import path from "node:path";

import { commonCliOptions } from "./options";

type OpenApiSchema = {
  components: {
    schemas: Record<string, unknown>;
  };
  info: {
    description: string;
    title: string;
    version: string;
  };
  openapi: string;
  paths: Record<string, unknown>;
  servers: Array<{ url: string }>;
};

interface BuildOpenApiSpecOptions {
  serverUrls?: string[];
}

function jsonTypeForOption(type: "boolean" | "number" | "string"): string {
  if (type === "number") {
    return "number";
  }
  if (type === "boolean") {
    return "boolean";
  }
  return "string";
}

function buildRequestSchema(): Record<string, unknown> {
  const properties: Record<string, unknown> = {};

  for (const option of commonCliOptions) {
    properties[option.name] = {
      type: jsonTypeForOption(option.type),
      description: option.description,
    };
  }

  properties.credential_offer = {
    type: "string",
    description:
      "Compatibility alias for credential-offer-uri, mapped 1:1 to --credential-offer-uri",
  };
  properties.presentation_request = {
    type: "string",
    description:
      "Compatibility alias for presentation-authorize-uri, mapped 1:1 to --presentation-authorize-uri",
  };

  return {
    type: "object",
    additionalProperties: false,
    properties,
  };
}

function buildQueryParameters(): Array<Record<string, unknown>> {
  return commonCliOptions.map((option) => ({
    in: "query",
    name: option.name,
    required: false,
    schema: {
      type: jsonTypeForOption(option.type),
    },
    description: option.description,
  }));
}

export function buildOpenApiSpec(
  options: BuildOpenApiSpecOptions = {},
): OpenApiSchema {
  const requestSchema = buildRequestSchema();
  const serverUrls = options.serverUrls ?? ["http://127.0.0.1:3100"];

  return {
    openapi: "3.0.3",
    info: {
      title: "WCT CLI REST Wrapper",
      version: "1.0.0",
      description:
        "External REST wrapper around the WCT CLI. Request fields map 1:1 to CLI options.",
    },
    servers: serverUrls.map((url) => ({ url })),
    components: {
      schemas: {
        RunRequest: requestSchema,
      },
    },
    paths: {
      "/api/test/issuance": {
        get: {
          summary: "Run wct test:issuance with query params",
          parameters: buildQueryParameters(),
          responses: {
            "200": {
              description: "Command execution result",
            },
          },
        },
        post: {
          summary: "Run wct test:issuance with JSON body",
          requestBody: {
            required: false,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/RunRequest",
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Command execution result",
            },
          },
        },
      },
      "/api/test/verification": {
        get: {
          summary: "Run wct test:presentation with query params",
          parameters: buildQueryParameters(),
          responses: {
            "200": {
              description: "Command execution result",
            },
          },
        },
        post: {
          summary: "Run wct test:presentation with JSON body",
          requestBody: {
            required: false,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/RunRequest",
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Command execution result",
            },
          },
        },
      },
      "/openapi.json": {
        get: {
          summary: "OpenAPI specification for this service",
          responses: {
            "200": {
              description: "OpenAPI JSON",
            },
          },
        },
      },
      "/docs": {
        get: {
          summary: "Swagger UI page",
          responses: {
            "200": {
              description: "HTML page with Swagger UI",
            },
          },
        },
      },
      "/health": {
        get: {
          summary: "Health check",
          responses: {
            "200": {
              description: "Service is running",
            },
          },
        },
      },
    },
  };
}

if (process.argv.includes("--write")) {
  const outPath = path.resolve(
    process.cwd(),
    "services/cli-api/openapi.generated.json",
  );

  writeFileSync(outPath, JSON.stringify(buildOpenApiSpec(), null, 2));
  // eslint-disable-next-line no-console
  console.log(`OpenAPI written to ${outPath}`);
}
