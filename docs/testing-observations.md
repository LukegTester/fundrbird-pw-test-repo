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
