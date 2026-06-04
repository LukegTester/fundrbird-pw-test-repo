# Rolnopol Playwright Test Framework

This repo is a Playwright + TypeScript test automation framework for recruitment. It runs UI tests, API contract tests, and mocked integration tests against an external app.

**Application under test:** [Rolnopol](https://github.com/jaktestowac/rolnopol) — a training web app with GUI, REST API, JWT auth, and OpenAPI docs. The suite starts Rolnopol via Docker (`jaktestowac/rolnopol:1.25.0`) on `http://localhost:3000`.

## Tech stack

- Playwright + TypeScript (strict)
- Husky, ESLint + eslint-plugin-playwright, Prettier, pre-commit quality gate
- dotenv environment config
- @faker-js/faker test data
- openapi-response-validator (runtime contract checks)
- Docker Compose (app under test), GitHub Actions CI

## Requirements mapping

- [x] UI tests — `tests/ui/` (`integration/login.spec.ts`, `e2e/marketplace-purchase.spec.ts`)
- [x] API tests — `tests/api/` (`smoke/`, `integration/` contract specs)
- [x] Mocked integration tests — Playwright route mocks in `src/mocks/financial.mock.ts`, used by UI specs
- [x] Page Object Model — `src/pages/` (`login.page.ts`, `marketplace.page.ts`)
- [x] Environment config — `config/env.config.ts` + `.env-template`
- [x] Test data management — `src/test-data/`, `src/factories/` (faker), `src/models/`
- [x] Code quality tools — ESLint + Prettier + tsc via `npm run quality:quick`, Husky pre-commit
- [x] CI setup — `.github/workflows/playwright.yml`
- [x] Bonuses: parallel execution (`fullyParallel`, 3 workers), data mocking, structured test data

## Prerequisites

- **Node.js** 22+ (matches CI)
- **npm** 10+ (ships with Node 22)
- **Docker** — Rolnopol runs in a container; no local app install

## Setup

```bash
cp .env-template .env
npm ci
npx playwright install --with-deps chromium
npm run app:start
npm run app:wait
npm test
```

To reset app state after repeated runs: `npm run app:stop && npm run app:start`.

## Environment

Copy `.env-template` to `.env`. All variables are required; startup fails if any are missing (`config/env.config.ts`).

- `BASE_URL` — app root (default `http://localhost:3000`)
- `API_BASE_URL` — REST API base (default `http://localhost:3000/api/v1`)
- `OPENAPI_URL` — OpenAPI schema URL
- `USER_EMAIL` / `USER_PASSWORD` — demo user for auth tests

Demo credentials are included in `.env-template` so reviewers can run the suite without extra setup. Normally I would not place them there.

## Scripts

**App (`app:*`)** — Docker lifecycle

| Script      | Purpose                              |
| ----------- | ------------------------------------ |
| `app:start` | Start Rolnopol container             |
| `app:stop`  | Stop container                       |
| `app:wait`  | Wait until app responds on port 3000 |

**Tests (`test*`)** — suite runners

| Script         | Purpose                             |
| -------------- | ----------------------------------- |
| `test`         | Full suite                          |
| `test:ui`      | UI specs only                       |
| `test:api`     | API specs only                      |
| `test:headed`  | Full suite, headed browser          |
| `test:ui-mode` | Playwright UI mode                  |
| `test:flaky`   | Repeat a spec 10× (stability check) |

**Tags (`tag:*`)** — run by `@tag`

| Script         | Purpose     |
| -------------- | ----------- |
| `tag:smoke`    | `@smoke`    |
| `tag:api`      | `@api`      |
| `tag:ui`       | `@ui`       |
| `tag:mock`     | `@mock`     |
| `tag:contract` | `@contract` |

**Report** — `report:show` opens the HTML report.

**Quality**

| Script          | Purpose                                     |
| --------------- | ------------------------------------------- |
| `quality:quick` | lint + format-check + typecheck (Husky, CI) |
| `quality:gate`  | quality:quick + full test run               |
| `lint`          | ESLint                                      |
| `format`        | Prettier write                              |
| `format-check`  | Prettier check                              |
| `typecheck`     | TypeScript strict                           |

## AI-assisted workflow

Built with Cursor using committed, project-scoped rules in `.cursor/rules/` — not ad-hoc prompting:

- **Guidelines** (`global`, `ui`, `api`) enforce structure, naming, commits, and quality gates.
- **Agent roles** (`test-discovery`, `ui-implementation`, `api-contract`, `quality-gate`) scope each phase of work.
- **Playwright MCP** drives the live app during discovery to capture locators and API traffic into `docs/testing-observations.md`.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md#ai-assisted-workflow) for detail.

## Documentation

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — design decisions, structure, AI workflow.
- [docs/known-issues.md](docs/known-issues.md) — limitations and intentional tradeoffs.
- [docs/coding-standards.md](docs/coding-standards.md) — naming, types, imports, commit conventions.
- [docs/rolnopol_context.md](docs/rolnopol_context.md) — app under test: behavior, quirks, intentional bugs.
- [docs/testing-observations.md](docs/testing-observations.md) — per-flow discovery notes.
