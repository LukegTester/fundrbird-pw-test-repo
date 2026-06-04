# Known issues, limitations, and intentional tradeoffs

This document records decisions made for the recruitment assignment where time or app constraints led to pragmatic tradeoffs. See also [testing-observations.md](./testing-observations.md) for discovery notes.

---

## Parallel execution

The framework runs with `fullyParallel: true` and multiple workers (`playwright.config.ts`) after verifying the suite can run in parallel with isolated arrange steps and clean CI starts.

**Residual risks:** Rolnopol uses JSON-file persistence, rate limiting, and a single shared demo user. Repeated local runs without resetting Docker may surface 400/429 or token conflicts. CI starts from a clean container each run.

---

## Setup project cross-suite dependency

The `setup` project depends on `["api", "chromium-non-logged"]` before generating storage state. If an unrelated API or public UI test fails, authenticated `@logged` tests do not run. This ordering keeps the storage-state JWT fresh relative to earlier API login calls in the same run.

---

## Single demo user

All authenticated flows use one `USER_EMAIL` / `USER_PASSWORD` from env. API arrange in logged tests reads the token from `tmp/session.json` (cookie `rolnopolToken`) instead of calling `POST /login` again, because a second login invalidates the previous token (403 on protected endpoints).

---

## Create-offer status code vs OpenAPI

OpenAPI documents **201 Created** for `POST /marketplace/offers`; the live app returns **200 OK** with the same body shape. Contract tests assert status 200 and validate the body against the documented 201 response schema.

---

## Marketplace mocked 500 on offers

Intercepting `GET /marketplace/offers` with 500 leaves `#browseOffers` stuck on "Loading offers..." in v1.25.0 — the UI never reaches the error empty state. The zero-balance mock test intercepts `GET /financial/account` instead.

---

## Demo credentials in `.env-template`

A production `.env-template` would not ship real credentials. This repo includes `USER_EMAIL` and `USER_PASSWORD` so reviewers can copy the file to `.env` and run the suite without extra setup.

---

## Empty test-layer directories

`tests/ui/smoke/` and `tests/api/e2e/` are intentionally kept (with `.gitkeep`) as placeholders for future smoke/e2e specs beyond the current integration-focused coverage.

---

## Page Object locator visibility

Locators are `public readonly` on Page Objects so specs can assert on them directly. This is intentional for a small framework; see [coding-standards.md](./coding-standards.md) §6.

---

## Unseeded e2e test data

The suite runs fully parallel (`fullyParallel: true`), but some e2e flows do not generate or reset their own data. After several local runs without restoring the environment, tests can fail (e.g. insufficient funds, items already listed).

**Workaround:** `npm run app:stop && npm run app:start`. CI starts from a clean container each run.

---

## Auth / setup tradeoff

Storage state (`tmp/session.json`) plus a `setup` project that depends on other projects is a pragmatic shortcut, not a bulletproof session model. A second login invalidates the previous JWT; the suite avoids that by reusing the saved cookie. A more resilient approach (per-test tokens, isolated users, API-only setup) was out of scope for this time-boxed showcase.

---

## MVP scope

There are clear areas to improve (test data seeding, auth isolation, broader coverage). Given limited time with the app and the recruitment showcase goal, this repo is an MVP — enough to demonstrate structure and patterns, not a production-ready framework.
