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
- **Auth in tests:** `@non-logged` = no storage state; `@logged` = `.auth/user.json` from setup project
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
