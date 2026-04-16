export type CliOptionType = "boolean" | "number" | "string";

export interface CliOptionDefinition {
  cliFlag: string;
  description: string;
  name: string;
  type: CliOptionType;
}

export const commonCliOptions: readonly CliOptionDefinition[] = [
  {
    name: "file-ini",
    cliFlag: "--file-ini",
    type: "string",
    description: "Path to custom INI configuration file",
  },
  {
    name: "credential-issuer-uri",
    cliFlag: "--credential-issuer-uri",
    type: "string",
    description: "Override the credential issuer URL",
  },
  {
    name: "credential-offer-uri",
    cliFlag: "--credential-offer-uri",
    type: "string",
    description: "Override the credential offer URL",
  },
  {
    name: "presentation-authorize-uri",
    cliFlag: "--presentation-authorize-uri",
    type: "string",
    description: "Override the presentation authorize URL",
  },
  {
    name: "credential-types",
    cliFlag: "--credential-types",
    type: "string",
    description: "Comma-separated list of credential configuration IDs to test",
  },
  {
    name: "timeout",
    cliFlag: "--timeout",
    type: "number",
    description: "Network timeout in seconds",
  },
  {
    name: "max-retries",
    cliFlag: "--max-retries",
    type: "number",
    description: "Maximum number of retry attempts",
  },
  {
    name: "log-level",
    cliFlag: "--log-level",
    type: "string",
    description: "Logging level (DEBUG, INFO, WARN, ERROR)",
  },
  {
    name: "log-file",
    cliFlag: "--log-file",
    type: "string",
    description: "Path to log file",
  },
  {
    name: "port",
    cliFlag: "--port",
    type: "number",
    description: "Trust Anchor server port",
  },
  {
    name: "save-credential",
    cliFlag: "--save-credential",
    type: "boolean",
    description: "Save the received credential to disk",
  },
  {
    name: "issuance-tests-dir",
    cliFlag: "--issuance-tests-dir",
    type: "string",
    description: "Override directory for issuance test specs",
  },
  {
    name: "issuance-certificate-subject",
    cliFlag: "--issuance-certificate-subject",
    type: "string",
    description: "Override mock issuer's certificate subject",
  },
  {
    name: "presentation-tests-dir",
    cliFlag: "--presentation-tests-dir",
    type: "string",
    description: "Override directory for presentation test specs",
  },
  {
    name: "steps-mapping",
    cliFlag: "--steps-mapping",
    type: "string",
    description: "Override steps mapping as comma-separated key=value pairs",
  },
  {
    name: "unsafe-tls",
    cliFlag: "--unsafe-tls",
    type: "boolean",
    description: "Disable TLS certificate verification",
  },
  {
    name: "external-ta-url",
    cliFlag: "--external-ta-url",
    type: "string",
    description: "URL of an external Trust Anchor",
  },
  {
    name: "external-ta-onboarding-url",
    cliFlag: "--external-ta-onboarding-url",
    type: "string",
    description: "Onboarding URL of an external Trust Anchor",
  },
  {
    name: "tests",
    cliFlag: "--tests",
    type: "string",
    description: "Comma separated list of test names",
  },
] as const;

export const optionAliasToName: Readonly<Record<string, string>> = {
  credential_offer: "credential-offer-uri",
  credential_offer_uri: "credential-offer-uri",
  presentation_request: "presentation-authorize-uri",
  presentation_request_uri: "presentation-authorize-uri",
};

export function getOptionByName(
  name: string,
): CliOptionDefinition | undefined {
  return commonCliOptions.find((option) => option.name === name);
}
