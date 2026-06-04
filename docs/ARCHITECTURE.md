# Architecture

## Overview

Three layers. Specs describe behavior; the business layer hides app detail; the app runs in Docker.

```text
+-------------------------------------------------------------+
| TEST LAYER  (specs)                                         |
|   tests/ui/*   tests/api/*   tests/setup/auth.setup.ts      |
+-------------------------------------------------------------+
                               |
                               v  fixtures
+-------------------------------------------------------------+
| BUSINESS LAYER                                              |
|   Page Objects ........... src/pages                        |
|   API Requests ........... src/api/requests                 |
|   Assertions + OpenAPI ... src/api/assertions               |
|   Route Mocks ............ src/mocks                        |
|   Factories / Test Data .. src/factories, src/test-data     |
|   Storage State .......... tmp/session.json                 |
+-------------------------------------------------------------+
                               |
                               v  HTTP / browser
+-------------------------------------------------------------+
| APPLICATION UNDER TEST  (Docker)                            |
|   jaktestowac/rolnopol:1.25.0  ->  localhost:3000           |
|   GUI . REST API . OpenAPI schema . JWT auth                |
+-------------------------------------------------------------+
```

## Project structure

```text
.
├── .cursor/
│   └── rules/           # AI rules: guidelines (global/ui/api) + agent roles
├── .husky/              # pre-commit quality gate
├── config/              # env loading + global setup (clears stale session)
├── src/
│   ├── api/             # request classes, assertions, OpenAPI loader, auth, helpers
│   ├── pages/           # Page Objects (POM)
│   ├── mocks/           # Playwright route mocks
│   ├── factories/       # faker-based data builders
│   ├── test-data/       # static fixtures (demo user, transactions)
│   ├── models/          # shared TypeScript types
│   ├── fixtures/        # merged Playwright fixtures
│   └── routes/          # central URL/route map
├── tests/
│   ├── setup/           # auth.setup.ts -> tmp/session.json
│   ├── api/             # smoke / integration contract specs
│   └── ui/              # integration / e2e specs
├── playwright.config.ts # projects: api, non-logged, setup, logged
├── docker-compose.yml   # app under test
└── .github/workflows/   # CI (manual dispatch)
```

## Core decisions

### Page Object Model

UI specs talk to `src/pages/*`, not raw selectors. Locators live in one place; a UI change touches one file. Locators are `public readonly` so specs can assert on them directly.

### Storage state for auth

The `setup` project logs in once and writes `tmp/session.json`; the `chromium-logged` project loads it via `storageState`. Avoids per-test logins. Rolnopol invalidates a prior JWT on re-login, so authenticated arrange reads the token from storage state rather than calling `/login` again.

### OpenAPI runtime validation

API contract specs validate live responses against the app's published OpenAPI schema using `openapi-response-validator` (`src/api/assertions/openapi-response.assertion.ts`). The schema is the source of truth, so contract drift fails the test instead of being hand-coded.

### Strict linting + pre-commit hooks

ESLint (with eslint-plugin-playwright), Prettier, and `tsc --strict` run via `npm run quality:quick` (lint, format-check, typecheck). Husky runs that on `pre-commit`. Before submission, run `npm run quality:gate` (quality:quick + full test suite).

## Test projects & parallelism

`fullyParallel: true`, 3 workers. Projects run in order: `api` and `chromium-non-logged` → `setup` (storage state) → `chromium-logged`. See [known-issues.md](known-issues.md) for parallelism tradeoffs against Rolnopol's JSON persistence and rate limiting.

## AI-assisted workflow

The framework was built with Cursor using project-scoped rules in `.cursor/rules/`, treated as version-controlled conventions rather than ad-hoc prompts.

- **Guideline rules** (`alwaysApply`): `global-guideline` (structure, naming, commits, quality gates), `ui-guideline` (POM, locators), `api-guideline` (requests, OpenAPI). These keep generated code consistent with the standards in [coding-standards.md](coding-standards.md).
- **Agent-role rules** (activated per task): `agent-test-discovery`, `agent-ui-implementation`, `agent-api-contract`, `agent-quality-gate`. Each scopes one phase of work and its boundaries.
- **MCP:** the Playwright MCP (`user-playwright`) drives the live app during discovery — navigating flows, capturing locators and API traffic — feeding notes into [testing-observations.md](testing-observations.md) before specs are written.
- **Separation:** rules and discovery notes are committed, so the AI workflow is reviewable and reproducible rather than hidden in chat history.
