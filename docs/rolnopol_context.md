# 🤖 Project Context: Rolnopol Application

## 📌 Project Purpose & Characteristics

**Rolnopol** is a web application created by _jaktestowac.pl_, serving as a training ground to learn and practice test automation (e.g., using Playwright).
This is not a standard production application. It contains **intentionally introduced bugs**, edge cases, and special tools designed to either facilitate or complicate testing.

---

## 🏗️ Architecture & Technologies (High-Level)

The project is a **Monolith** based on a client-server architecture.

1. **Frontend (`public/` directory)**
   - **Architecture:** Multi-Page Application (MPA). Each page is a separate `.html` file (e.g., `login.html`, `marketplace.html`).
   - **Technology:** Vanilla JavaScript (pure JS), HTML5, CSS3. No frameworks like React/Angular are used.
   - **Implications for E2E Tests:** Due to Vanilla JS, the application relies mostly on standard DOM events. Locators should be based on `id`, `data-testid` (where available), and standard CSS classes. Dynamic component loading (e.g., headers) is handled via the Fetch API.

2. **Backend (`api/`, `controllers/`, `services/`, `routes/` directories)**
   - **Technology:** Node.js + Express.js.
   - **Architecture:** N-Tier / Layered (Router -> Middleware -> Controller -> Service -> DB).
   - **API:** REST API. Authentication is based on JWT tokens.
   - **Request Lifecycle:** Incoming HTTP requests pass through a strict middleware chain in `middleware/`: `version.middleware` -> `rate-limit` -> `chaos-engine` (if enabled) -> `auth` (if protected) -> `id-validation` -> Target Controller.

3. **Database (`data/` directory)**
   - **Technology:** Custom in-memory database that persists state to flat JSON files (e.g., `users.json`, `fields.json`, `financial.json`).
   - **Concurrency Handling:** Managed by `json-database.js` and `database-manager.js`. Because it's file-based, it uses a custom queuing/semaphore lock system to prevent race conditions during concurrent requests.
   - **Implications for Tests:** The application state can be easily reset and modified before tests by replacing JSON files or using dedicated reset endpoints (e.g., `debug-database-restore.service.js`). Note that heavily parallelized API tests mutating the exact same data file simultaneously might encounter lock delays.

4. **Modular Subsystems & Plugins**
   - **`modules/` Directory:** Contains encapsulated feature domains like `buddy` (virtual pet logic) and `notification-center` (event bus, policy routers, webhook dispatchers).
   - **`plugins/` Directory:** A dynamic plugin runtime (`plugin-runtime/`) that auto-discovers and loads middleware/routes (e.g., `teapot-blocker-plugin`, `response-size-logger-plugin`).
   - **Chatbot / LLM Engine:** Located in `services/chatbot/`. It implements various bot profiles (docs guide, alerts guide) and connector patterns (`mock-llm`, `gemini-llm`, `openrouter-llm`).

---

## 🔄 Core Flows

1. **Authentication Flow:**
   - Login via `/api/v1/auth/login`. Returns a JWT token.
   - Users have roles. Some views are protected and require a specific access level.

2. **Economic Flow (Marketplace & Commodities):**
   - The user buys/sells resources and commodities.
   - Path: UI -> `/api/v1/commodities/buy` -> `commodities.controller.js` -> `commodities.service.js` (balance check and update) -> Save to `financial.json` and `users.json`.

3. **Notifications & Communication (Messenger & Notifications):**
   - In-app notification handling (WebSocket / Polling) and via webhooks.
   - Managed by `modules/notification-center/` and `services/messenger.service.js`.

---

## 🛠️ Special Mechanisms (Crucial for E2E Tests)

1. **Chaos Engine (`middleware/chaos-engine.middleware.js`)**
   - **How it works:** A system that introduces intentional instability to the API (random delays, 500 errors, connection drops).
   - **Impact on Tests:** Playwright must be prepared to handle flakiness. Tests should utilize auto-wait mechanisms, retries, and assertions with timeouts.

2. **Feature Flags (`services/feature-flags.service.js`)**
   - The app uses flags to toggle specific features on/off (stored in `feature-flags.json`).
   - Playwright tests can modify these flags via the API before starting a test to verify different app variants without re-deploying.

3. **Rate Limiting (`middleware/rate-limit.middleware.js`)**
   - The application has request limits. When executing fast API tests (or running parallel E2E tests from a single IP), tests might hit the limiter and receive a `429 Too Many Requests` status.

4. **Testing Infrastructure (`tests/` directory)**
   - The repo already contains extensive backend tests (Vitest/Supertest) divided into `unit`, `property` (Property-Based Testing), and integration test suites. This serves as a strong reference point for understanding API payload structures and expected behaviors.
