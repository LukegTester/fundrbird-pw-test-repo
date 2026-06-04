# Testing observations — Rolnopol

Discovery notes and app behavior captured during test implementation.
Updated slice-by-slice; feeds into implementation decisions.

---

## Slice 0 — Sanity

- `.env` copied from `.env-template`; credentials: `demo@example.com` / `demo123`.
- `npm run quality:quick` passes on baseline codebase (lint, format, typecheck all green).
- App runs via Docker: `jaktestowac/rolnopol:1.25.0` on `http://localhost:3000`.

---

## Slice 1 — Login (v1.25.0)

### Login page — discovery notes

- **URL:** `/login.html`
- **Stable locators:** `data-testid` present — `login-form`, `email-input`, `password-input`, `login-submit-btn`, `login-message` (message div may stay empty)
- **API calls:** `POST /api/v1/login` with `{ email, password }` → 200 on success, 401 on invalid creds
- **Success UI:** redirect to `/profile.html`
- **Error UI:** stays on `/login.html`; visible text `Invalid credentials` in notification `role="alert"` (both wrong-password and unknown-email cases)
- **Auth in tests:** `@non-logged` = no storage state; `@logged` = `tmp/session.json` from setup project
- **Gotchas:** after login, `/login.html` redirects to profile until logout; use fresh context for `@non-logged` tests

---

## Slice 2 — Marketplace (v1.25.0)

### Marketplace page — discovery notes

- **URL:** `/marketplace.html` (requires auth; use `@logged` + storage state)
- **Initial load:** `GET /api/v1/marketplace/offers` populates `#browseOffers`; loading spinner shown until response
- **Stable locators:**
  - Offers grid: `#browseOffers`
  - Buy buttons: `.btn-buy[data-offer-id]` (disabled when offer unavailable/sold)
  - Confirmation modal: `data-testid="confirmation-modal"`, `confirmation-modal-confirm`, `confirmation-modal-cancel`
  - Balance: `#userBalance`
  - No `data-testid` on offer cards — use `.offer-card` inside `#browseOffers`
- **Purchase flow:**
  1. Click first enabled `.btn-buy` → confirmation modal opens (`Confirm Purchase`)
  2. Click `confirmation-modal-confirm` → `POST /api/v1/marketplace/buy` with `{ offerId }`
  3. Success: 200 response; notification "Purchase completed successfully!" via event bus (`role="alert"`)
  4. Offers grid and balance refresh
- **Mock error strategy:** intercept `GET /api/v1/marketplace/offers` with 500 → frontend calls `_showError("browseOffers", "Failed to load offers")` → `.empty-state` with exclamation icon and visible text inside `#browseOffers`
- **Gotchas:** `waitForResponse` must wrap the confirm click, not the initial buy click (modal step in between)
- **Mock quirk (v1.25.0):** mocked 500 on offers leaves `#browseOffers` stuck on "Loading offers..." — `_showError` is never reached because the loading spinner is never cleared. Bug filed: `docs/bugs/BUG-001-marketplace-offers-500-silent-fail.md`. Stable mock alternative: return 200 with empty `offers: []` → visible "No offers available" empty state
- **Flaky note:** purchase test mutates marketplace JSON state; repeated runs may hit 400 (insufficient funds after prior purchases) or 429 (rate limit). Fresh Docker (`npm run app:stop && npm run app:start`) resets state; CI starts clean each run

---

## Slice 3 — Auth login API contract (v1.25.0)

### OpenAPI document — discovery notes

- **URL:** `http://localhost:3000/schema/openapi.json` (`OPENAPI_URL`)
- **Version:** OpenAPI 3.0.0
- **Login path key:** `/login` (relative, no `/api/v1` prefix) — matches `routes.api.login`
- **Operation:** `POST /login` with request body `$ref: #/components/schemas/UserLogin` (`email`, `password`)
- **200 response:** `content.application/json.schema` → `$ref: #/components/schemas/LoginResponse`
- **Actual API URL:** `POST ${API_BASE_URL}/login` → `http://localhost:3000/api/v1/login`
- **200 body shape (live):** `{ success, timestamp, data: { user: { email, ... }, token, expiration, loginTime }, message }`
- **Business assertions:** use `body.data.user.email` and `body.data.token` (email is nested under `user`, not flat on `data`)
- **Validator:** `openapi-response-validator` accepts OAS3 `responses` with `content` + passes `components` for `$ref` resolution

---

## Slice 2b — Financial + marketplace create (v1.25.0)

**Scope:** API contract tests + API arrange for `marketplace-purchase.spec.ts` only (no dedicated UI specs for financial or create-offer flows).

### Financial page — discovery notes

- **URL:** `/financial.html` (requires auth; `@logged` + storage state)
- **Stable locators:**
  - Income type: `.type-option[data-type="income"]` (sets hidden `#transaction-type`)
  - Amount: `#transaction-amount`
  - Category: `#transaction-category` (options include `general`)
  - Description: `#transaction-description`
  - Card (income only): `#transaction-card-number`, `#transaction-cvv` (shown after income selected)
  - Submit: `#submit-transaction`
  - History: `#transactions-container` (table rows after load)
  - Balance: `#current-balance`
- **Missing test-ids:** transaction form uses `#id` selectors only
- **API calls:** `POST /api/v1/financial/transactions` with body per `TransactionCreate` OpenAPI schema
  - Income requires `cardNumber` + `cvv` (write-only, not stored)
  - Example: `{ type: "income", amount: 5000, description: "...", category: "general", cardNumber: "4242424242424242", cvv: "123" }`
  - Response: **201** with `data.transaction` (id, amount, balanceAfter, …)
- **UI assertions:** new row/description visible in `#transactions-container`; optional `role="alert"` notification
- **Gotchas:** form section `#transaction-form-content` may need income type click before card fields appear

### Marketplace create offer — discovery notes

- **URL:** `/marketplace.html` tab **Create Offer** (`button.tab-button[data-tab="create"]`, panel `#create`)
- **Stable locators:**
  - Form: `#createOfferForm`
  - Item type: `#itemType` (`field` | `animal`)
  - Item: `#itemId` (populated after type change via API)
  - Price: `#price`
  - Description: `#description`
  - Submit: `.btn-create` / `button[type=submit]` in form
  - My offers grid: `#myOffers` (tab `data-tab="my-offers"`)
- **API calls:** `POST /api/v1/marketplace/offers` with `MarketplaceOfferCreate` (`itemType`, `itemId`, `price`, optional `description`)
  - Response: OpenAPI documents **201 Created**; live app returns **200 OK** with the same body shape — status code inconsistency (app bug). Contract test asserts `200` (actual) and validates body against the `201` schema (documented shape).
  - **400** common errors: `Cannot sell field with assigned animals`, `Cannot sell animal assigned to a field`, `Item is already offered for sale`
- **Sellable items:** probe `GET /api/v1/fields` and `GET /api/v1/animals`; use `createOfferWithSellableItem` (cancels active `my-offers` first). Not every item can be listed.
- **Arrange helper:** `src/api/helpers/find-sellable-item.ts` — used by purchase spec and contract test

### Auth token — discovery notes (Slice 2b)

- **Storage state file:** `tmp/session.json` (see `STORAGE_STATE` in `playwright.config.ts`)
- **JWT location:** cookie `rolnopolToken` (not localStorage)
- **Header:** protected API calls use `token: <jwt>` (Rolnopol convention)
- **Invalidation:** second `POST /login` for the same user returns a new token; **first token returns 403** on protected endpoints — confirmed live
- **Test strategy:** `chromium-logged` arrange steps must **read token from storage state**, never call `AuthRequest.login()` in the same run after `setup`

---
