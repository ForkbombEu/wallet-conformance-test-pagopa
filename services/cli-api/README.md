# CLI REST Wrapper (`services/cli-api`)

External HTTP wrapper around the `wct` CLI.

## Run

```bash
pnpm api:server
```

Defaults:
- host: `0.0.0.0`
- port: `3100`

Override:

```bash
API_HOST=0.0.0.0 API_PORT=3100 pnpm api:server
```

## CORS

Default behavior is **allow all origins** (`*`).

To restrict origins:

```bash
API_CORS_ALLOWED_ORIGINS="https://wallet.example.com,https://swagger.example.com" pnpm api:server
```

## Swagger/OpenAPI server URLs

By default, `/openapi.json` includes:
- request host URL (first/default)
- detected machine IPv4 URLs
- localhost / 127.0.0.1 URLs

To force explicit URLs (for example HTTPS behind reverse proxy):

```bash
API_PUBLIC_BASE_URLS="https://api.example.com,http://192.168.0.33:3100" pnpm api:server
```

Invalid/unroutable hosts such as `0.0.0.0` are ignored automatically.

If your app is behind a reverse proxy and you want Swagger URLs to be generated with HTTPS by default, set:

```bash
API_DEFAULT_SCHEME=https pnpm api:server
```

## Endpoints

- `GET /health`
- `GET /openapi.json`
- `GET /docs`
- `GET|POST /api/test/issuance`
- `GET|POST /api/test/verification`
- `GET|POST /api/test/presentation`

## CLI option mapping

Request parameters map 1:1 to CLI options.

Compatibility aliases:
- `credential_offer` / `credential_offer_uri` -> `--credential-offer-uri`
- `presentation_request` / `presentation_request_uri` -> `--presentation-authorize-uri`

## Default config behavior

When `file-ini` is not provided, the service generates and injects:

- `.generated/api-default.config.ini`

from:

- `services/cli-api/default.config.ini`

This avoids requiring a repository-root `config.ini`.

## OpenAPI generation

Generate the OpenAPI artifact:

```bash
pnpm api:openapi
```

This writes `.generated/cli-api.openapi.generated.json`.

Run generation + server:

```bash
pnpm api:server:openapi
```
