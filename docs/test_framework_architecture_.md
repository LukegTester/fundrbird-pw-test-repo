# Rolnopol Playwright Test Framework — Final Architecture Plan

## 1. Project goal

The goal of this project is to build a clean, maintainable, CI-ready Playwright test automation framework for the Rolnopol application.

The framework should demonstrate:

- clear project structure,
- good test architecture,
- Page Object Model,
- environment configuration,
- test data management,
- API testing,
- UI testing,
- frontend integration testing with mocks,
- API contract validation based on OpenAPI,
- reporting,
- code quality gates,
- scalability without overengineering.

This is a recruitment assignment, so the solution should be professional but not unnecessarily complex.

The target is a **medium-light framework**: structured enough to show senior-level thinking, simple enough to be easy to review and run.

---

## 2. Application under test

Rolnopol is treated as an external system under test.

The test framework does not copy or depend on Rolnopol source code.

Rolnopol is a training web application for test automation practice. It contains:

- GUI,
- REST API,
- Swagger / OpenAPI documentation,
- JWT authentication,
- role-based access,
- JSON-file based persistence,
- rate limiting,
- intentional bugs,
- edge cases,
- real-world style business workflows.

Because of that, the framework should prioritize stable and readable execution over aggressive parallelization.

---

## 3. Core architecture decisions

### Main stack

```txt
Playwright
TypeScript
ESLint
eslint-plugin-playwright
Prettier
dotenv
OpenAPI response validation
@faker-js/faker
Husky
wait-on
Docker Compose
GitHub Actions
```

### Main architectural patterns

```txt
Page Object Model for UI tests
Storage state for authenticated UI tests
API request classes for API tests
OpenAPI as the source of truth for API response contracts
Factory functions for generated test data
Playwright route mocking for frontend integration tests
Shared assertion helpers for API response validation
```

---

## 4. What this framework should not do at the beginning

Do not build a huge enterprise framework for five tests.

Avoid at the beginning:

```txt
complex fixture chains
too many custom fixtures
multiple browsers
GitHub Pages report deployment
blob report merging
full API schema model of the whole application
overly generic factories
random data everywhere
test data cleanup system before it is needed
```

These can be added later if the suite grows.

---

## 5. Project structure

```txt
.
├── .github/
│   └── workflows/
│       └── playwright.yml
│
├── .husky/
│   └── pre-commit
│
├── config/
│   ├── env.config.ts
│   └── global.setup.ts
│
├── tmp/
│   └── .gitkeep
│
├── docs/
│   ├── architecture-plan.md
│   └── testing-observations.md
│
├── src/
│   ├── api/
│   │   ├── assertions/
│   │   │   ├── api-status.assertion.ts
│   │   │   └── openapi-response.assertion.ts
│   │   ├── auth/
│   │   │   └── extract-token.ts
│   │   ├── helpers/
│   │   │   └── find-sellable-item.ts
│   │   ├── openapi/
│   │   │   └── openapi.loader.ts
│   │   └── requests/
│   │       ├── auth.request.ts
│   │       ├── financial.request.ts
│   │       └── marketplace.request.ts
│   │
│   ├── config/
│   │   └── routes.ts
│   │
│   ├── factories/
│   │   └── auth.factory.ts
│   │
│   ├── fixtures/
│   │   └── merge.fixtures.ts
│   │
│   ├── mocks/
│   │   └── financial.mock.ts
│   │
│   ├── pages/
│   │   ├── login.page.ts
│   │   └── marketplace.page.ts
│   │
│   └── test-data/
│       └── users.ts
│
├── tests/
│   ├── setup/
│   │   └── auth.setup.ts
│   │
│   ├── api/
│   │   ├── smoke/
│   │   │   └── auth-login.contract.spec.ts
│   │   ├── integration/
│   │   │   ├── financial-transaction.contract.spec.ts
│   │   │   └── marketplace-create-offer.contract.spec.ts
│   │   └── e2e/
│   │
│   └── ui/
│       ├── smoke/
│       ├── integration/
│       │   └── login.spec.ts
│       └── e2e/
│           └── marketplace-purchase.spec.ts
│
├── .env-template
├── .gitignore
├── .prettierignore
├── .prettierrc.json
├── docker-compose.yml
├── eslint.config.mjs
├── package.json
├── playwright.config.ts
├── README.md
└── tsconfig.json
```

---

## 6. Docker strategy

Use Docker Compose with the official Rolnopol Docker image.

`docker-compose.yml`:

```yaml
services:
  rolnopol:
    image: jaktestowac/rolnopol:1.25.0
    ports:
      - "3000:3000"
```

Reasons:

- the framework is independent from the application source code,
- setup is simple for reviewers,
- local and CI execution are aligned,
- pinned image makes test execution more reproducible.

---

## 7. Environment configuration

Use `.env-template` and `dotenv`.

`.env-template`:

```env
BASE_URL=http://localhost:3000
API_BASE_URL=http://localhost:3000/api/v1
OPENAPI_URL=http://localhost:3000/schema/openapi.json

USER_EMAIL=demo@example.com
USER_PASSWORD=demo123
```

`config/env.config.ts`:

```ts
import * as dotenv from "dotenv";

dotenv.config({ override: true });

const requireEnvVariable = (name: string): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Environment variable ${name} is not set`);
  }

  return value;
};

export const BASE_URL = requireEnvVariable("BASE_URL");
export const API_BASE_URL = requireEnvVariable("API_BASE_URL");
export const OPENAPI_URL = requireEnvVariable("OPENAPI_URL");

export const USER_EMAIL = requireEnvVariable("USER_EMAIL");
export const USER_PASSWORD = requireEnvVariable("USER_PASSWORD");
```

Rules:

- no hardcoded URLs in tests,
- no hardcoded credentials in tests,
- demo credentials are loaded from env,
- OpenAPI URL is configurable.

---

## 8. Routes config

Keep UI paths and API endpoints in one place.

OpenAPI paths are relative to `/api/v1`, so API routes should not include `/api/v1` directly.

`src/routes/routes.ts`:

```ts
export const routes = {
  pages: {
    login: "/login.html",
    marketplace: "/marketplace.html",
  },

  api: {
    login: "/login",
    authorization: "/authorization",
    healthcheck: "/healthcheck",
    ping: "/ping",
    marketplaceOffers: "/marketplace/offers",
    marketplaceBuy: "/marketplace/buy",
  },

  openapi: {
    document: "/schema/openapi.json",
  },
} as const;
```

API request classes should combine `API_BASE_URL` and `routes.api.*`:

```ts
return this.request.post(`${API_BASE_URL}${routes.api.login}`, {
  data: {
    email,
    password,
  },
});
```

---

## 9. Package scripts

`package.json` scripts:

```json
{
  "scripts": {
    "app:start": "docker compose up -d",
    "app:stop": "docker compose down",
    "app:wait": "wait-on http://localhost:3000",

    "test": "playwright test",
    "test:ui": "playwright test tests/ui",
    "test:api": "playwright test tests/api",
    "test:integration": "playwright test tests/integration",

    "smoke": "playwright test --grep \"@smoke\"",
    "api": "playwright test --grep \"@api\"",
    "ui": "playwright test --grep \"@ui\"",
    "mock": "playwright test --grep \"@mock\"",
    "contract": "playwright test --grep \"@contract\"",

    "test:headed": "npm run test -- --headed",
    "test:ui-mode": "npm run test -- --ui",
    "show-report": "playwright show-report",

    "lint": "eslint . --max-warnings=0",
    "format": "prettier --write .",
    "format:check": "prettier . --check",
    "typecheck": "tsc --noEmit --pretty --strict",

    "quality:quick": "npm run lint && npm run format:check && npm run typecheck",
    "quality": "npm run quality:quick && npm test",

    "prepare": "husky"
  }
}
```

---

## 10. Dependencies

Install:

```bash
npm install -D \
  @eslint/js \
  @faker-js/faker \
  @playwright/test \
  @types/node \
  dotenv \
  eslint \
  eslint-config-prettier \
  eslint-plugin-prettier \
  eslint-plugin-playwright \
  globals \
  husky \
  prettier \
  typescript \
  typescript-eslint \
  wait-on \
  openapi-response-validator
```

Rationale:

- `wait-on` keeps app readiness simple,
- `faker` is useful for data factories,
- `openapi-response-validator` validates API responses against Rolnopol OpenAPI,
- `eslint-plugin-prettier` runs Prettier as an ESLint rule so formatting issues surface in `npm run lint`,
- add further dependencies only when a concrete test need justifies them.

---

## 11. Playwright config

Use storage state for authenticated UI tests, but keep login tests public.

`playwright.config.ts`:

```ts
import path from "path";
import { defineConfig, devices } from "@playwright/test";
import { BASE_URL } from "./config/env.config";

export const STORAGE_STATE = path.join(__dirname, "tmp/session.json");

export default defineConfig({
  testDir: "./tests",
  globalSetup: require.resolve("./config/global.setup.ts"),

  timeout: 60_000,
  expect: { timeout: 10_000 },

  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  workers: 3,

  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
  ],

  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    video: "retain-on-failure",
    screenshot: "only-on-failure",
  },

  projects: [
    { name: "api", testMatch: "tests/api/**/*.spec.ts" },
    {
      name: "chromium-non-logged",
      testMatch: "tests/ui/**/*.spec.ts",
      grep: /@non-logged/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "setup",
      testMatch: /.*\.setup\.ts/,
      dependencies: ["api", "chromium-non-logged"],
    },
    {
      name: "chromium-logged",
      testMatch: "tests/ui/**/*.spec.ts",
      grep: /@logged/,
      dependencies: ["setup"],
      use: {
        ...devices["Desktop Chrome"],
        storageState: STORAGE_STATE,
      },
    },
  ],
});
```

Key decisions:

- `@non-logged` UI tests run without storage state; `@logged` tests reuse `tmp/session.json`,
- setup project runs after `api` and `chromium-non-logged` (see `docs/known-issues.md`),
- parallel execution with multiple workers — suite is isolated enough; CI starts clean,
- Chromium only,
- one retry in CI.

---

## 12. Auth setup with storage state

Use Playwright setup project to create storage state.

This is better than logging in through UI in every authenticated test.

`tests/setup/auth.setup.ts`:

```ts
import { STORAGE_STATE } from "../../playwright.config";
import { expect, test as setup } from "@src/fixtures/merge.fixtures";
import { routes } from "@src/routes/routes";
import { demoUser } from "@src/test-data/users";

setup("authenticate demo user", async ({ loginPage, page }) => {
  await loginPage.open();
  await loginPage.login(demoUser);
  await expect(page).toHaveURL(new RegExp(`${routes.pages.profile}$`));
  await page.context().storageState({ path: STORAGE_STATE });
});
```

Add to `.gitignore`:

```txt
tmp/*
!tmp/.gitkeep
```

Rules:

- login tests use `@non-logged` in `tests/ui/integration/`,
- authenticated UI tests use `@logged` and storage state from setup,
- `tmp/session.json` is never committed.

---

## 13. Locator strategy

Locator strategy priority:

```txt
1. getByTestId
2. getByRole
3. getByLabel
4. getByText
5. stable CSS / id selector
```

Why this order?

Rolnopol is a training application and some views may not have ideal accessibility semantics. If stable `data-testid` attributes exist, they are the first choice because they are explicit test hooks and usually less fragile than text or CSS structure.

Use:

```ts
page.getByTestId("login-email-input");
page.getByRole("button", { name: "Login" });
page.getByLabel("Email");
page.getByText("Invalid credentials");
page.locator("#email");
```

Avoid:

```txt
XPath
long CSS chains
nth() without explanation
hard waits
force clicks
selectors based on layout structure
raw selectors scattered across test files
```

Rules:

- selectors should live inside Page Objects,
- tests should describe business behavior,
- use CSS/id only when no better locator exists,
- if a CSS/id selector is used, keep it stable and local to Page Object.

---

## 14. Page Object Model

Page Objects should expose user-level actions and assertions.

Example `src/pages/login.page.ts`:

```ts
import { expect, Locator, Page } from "@playwright/test";
import { routes } from "@src/routes/routes";

type LoginCredentials = {
  email: string;
  password: string;
};

export class LoginPage {
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly submitButton: Locator;
  private readonly errorMessage: Locator;

  constructor(private readonly page: Page) {
    this.emailInput = page.getByTestId("login-email-input");
    this.passwordInput = page.getByTestId("login-password-input");
    this.submitButton = page.getByTestId("login-submit-button");
    this.errorMessage = page.getByTestId("login-error-message");
  }

  async open(): Promise<void> {
    await this.page.goto(routes.pages.login);
  }

  async loginAs(credentials: LoginCredentials): Promise<void> {
    await this.emailInput.fill(credentials.email);
    await this.passwordInput.fill(credentials.password);
    await this.submitButton.click();
  }

  async expectLoaded(): Promise<void> {
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
  }

  async expectInvalidLoginError(): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
  }

  async expectUserIsLoggedIn(): Promise<void> {
    await expect(this.page).not.toHaveURL(/login\.html/);
  }
}
```

If a `data-testid` does not exist in the application, replace with the next best locator according to the locator strategy.

---

## 15. Test data management

Use two levels of test data:

```txt
static test data
factories
```

### Static users

`src/test-data/users.ts`:

```ts
import { USER_EMAIL, USER_PASSWORD } from "@config/env.config";

export const demoUser = {
  email: USER_EMAIL,
  password: USER_PASSWORD,
} as const;

export const invalidUser = {
  email: "invalid@example.com",
  password: "wrong-password",
} as const;
```

### Factories

Factories should create data used in API tests, mock tests and negative scenarios.

They should not create random noise everywhere.

Use faker for:

- invalid payloads,
- generated names,
- unique values,
- mock data,
- edge-case payloads.

`src/factories/auth.factory.ts`:

```ts
import { faker } from "@faker-js/faker";

export const createInvalidLoginPayload = (): {
  email: string;
  password: string;
} => ({
  email: faker.internet.email(),
  password: faker.internet.password(),
});
```

`src/factories/marketplace.factory.ts`:

```ts
import { faker } from "@faker-js/faker";

export const createInvalidMarketplaceBuyPayload = (): {
  offerId: string;
} => ({
  offerId: faker.string.uuid(),
});
```

Factory rules:

- prefer static test data when it is clearer,
- use faker when uniqueness or generated invalid payloads are useful,
- do not hide important business values behind random factories,
- factories should return plain objects.

---

## 16. API request layer

Keep API layer practical and simple.

Use request classes, not over-abstracted clients.

Example `src/api/requests/auth.request.ts`:

```ts
import { APIRequestContext, APIResponse } from "@playwright/test";
import { API_BASE_URL } from "@config/env.config";
import { routes } from "@src/routes/routes";

export class AuthRequest {
  constructor(private readonly request: APIRequestContext) {}

  async login(email: string, password: string): Promise<APIResponse> {
    return this.request.post(`${API_BASE_URL}${routes.api.login}`, {
      data: {
        email,
        password,
      },
    });
  }
}
```

Example `src/api/requests/marketplace.request.ts`:

```ts
import { APIRequestContext, APIResponse } from "@playwright/test";
import { API_BASE_URL } from "@config/env.config";
import { routes } from "@src/routes/routes";

export class MarketplaceRequest {
  constructor(private readonly request: APIRequestContext) {}

  async getOffers(token: string): Promise<APIResponse> {
    return this.request.get(`${API_BASE_URL}${routes.api.marketplaceOffers}`, {
      headers: {
        token,
      },
    });
  }

  async buy(token: string, offerId: number | string): Promise<APIResponse> {
    return this.request.post(`${API_BASE_URL}${routes.api.marketplaceBuy}`, {
      headers: {
        token,
      },
      data: {
        offerId,
      },
    });
  }
}
```

Rules:

- request classes perform HTTP calls,
- tests decide what should be asserted,
- endpoint paths come from `routes.ts`,
- do not create a generic API framework too early.

---

## 17. API assertion strategy

API assertions should be useful, not overcomplicated.

Minimum expected API validation:

```txt
status code
OpenAPI response schema validation when the response contract matters
business-relevant response body checks
clear failure message
```

Optional validation:

```txt
content-type
headers
response timing
```

Do not validate everything in every API test.

The main goal is to verify the contract and business behavior that matters for the scenario.

---

## 18. API status assertion helper

Use helper assertions with clear failure messages.

`src/api/assertions/api-status.assertion.ts`:

```ts
import { APIResponse, expect } from "@playwright/test";

export const expectResponseStatus = (
  response: APIResponse,
  expectedStatusCode: number,
  context: string,
): void => {
  expect(
    response.status(),
    `${context}: expected status code ${expectedStatusCode}, and received ${response.status()}`,
  ).toBe(expectedStatusCode);
};
```

Example usage:

```ts
const response = await authRequest.login(demoUser.email, demoUser.password);

expectResponseStatus(response, 200, "Login API response");
```

This keeps failure output readable.

---

## 19. OpenAPI loading strategy

OpenAPI document should be loaded at runtime, only when API contract tests run.

Do not load OpenAPI during imports, linting or typechecking.

The document should be cached after the first request.

`src/api/openapi/openapi.loader.ts`:

```ts
import { APIRequestContext } from "@playwright/test";
import { OPENAPI_URL } from "@config/env.config";

export type OpenApiDocument = Record<string, unknown>;

let cachedOpenApiDocument: OpenApiDocument | null = null;

export const loadOpenApiDocument = async (
  request: APIRequestContext,
): Promise<OpenApiDocument> => {
  if (cachedOpenApiDocument) {
    return cachedOpenApiDocument;
  }

  const response = await request.get(OPENAPI_URL);

  if (!response.ok()) {
    throw new Error(
      `Failed to load OpenAPI document. Expected 200, received ${response.status()}`,
    );
  }

  cachedOpenApiDocument = (await response.json()) as OpenApiDocument;

  return cachedOpenApiDocument;
};
```

Why this is efficient:

- OpenAPI is downloaded only once per worker process,
- JSON schema lookup is fast,
- UI tests are not affected,
- contract validation cost is negligible compared to browser UI tests.

---

## 20. OpenAPI response assertion helper

The helper finds the expected response schema by:

```txt
path + method + status code
```

Example lookup:

```txt
paths['/login'].post.responses['200']
```

`src/api/assertions/openapi-response.assertion.ts`:

```ts
import { APIRequestContext, expect } from "@playwright/test";
import OpenAPIResponseValidator from "openapi-response-validator";
import { loadOpenApiDocument } from "@src/api/openapi/openapi.loader";

type HttpMethod = "get" | "post" | "put" | "patch" | "delete";

type OpenApiResponseValidationOptions = {
  request: APIRequestContext;
  body: unknown;
  path: string;
  method: HttpMethod;
  statusCode: number;
  context: string;
};

export const expectResponseMatchesOpenApi = async ({
  request,
  body,
  path,
  method,
  statusCode,
  context,
}: OpenApiResponseValidationOptions): Promise<void> => {
  const openApiDocument = await loadOpenApiDocument(request);

  const paths = openApiDocument.paths as Record<
    string,
    Record<string, unknown>
  >;
  const pathDefinition = paths[path];

  if (!pathDefinition) {
    throw new Error(`${context}: OpenAPI path '${path}' was not found`);
  }

  const operation = pathDefinition[method] as
    | { responses?: Record<string, unknown> }
    | undefined;

  if (!operation?.responses) {
    throw new Error(
      `${context}: OpenAPI operation '${method.toUpperCase()} ${path}' was not found`,
    );
  }

  const validator = new OpenAPIResponseValidator({
    responses: operation.responses,
    components: openApiDocument.components,
  });

  const validationError = validator.validateResponse(statusCode, body);

  expect(
    validationError,
    `${context}: response does not match OpenAPI schema. ${JSON.stringify(
      validationError,
      null,
      2,
    )}`,
  ).toBeUndefined();
};
```

Note:

The exact import/constructor style may need small adjustment during implementation depending on the package export style, but this is the intended architecture.

---

## 21. Example API contract test

`tests/api/auth-login.contract.spec.ts`:

```ts
import { test, expect } from "@playwright/test";
import { AuthRequest } from "@src/api/requests/auth.request";
import { expectResponseStatus } from "@src/api/assertions/api-status.assertion";
import { expectResponseMatchesOpenApi } from "@src/api/assertions/openapi-response.assertion";
import { routes } from "@src/routes/routes";
import { demoUser } from "@src/test-data/users";

test("user can authenticate through API @api @contract", async ({
  request,
}) => {
  const authRequest = new AuthRequest(request);

  const response = await authRequest.login(demoUser.email, demoUser.password);

  expectResponseStatus(response, 200, "Login API response");

  const body = await response.json();

  await expectResponseMatchesOpenApi({
    request,
    body,
    path: routes.api.login,
    method: "post",
    statusCode: 200,
    context: "Login API response",
  });

  expect(
    body.success,
    `expected login response success to be true, and received ${body.success}`,
  ).toBe(true);

  expect(
    body.data.email,
    `expected authenticated user email to be ${demoUser.email}, and received ${body.data.email}`,
  ).toBe(demoUser.email);

  expect(
    body.data.token,
    "expected login response to contain token",
  ).toBeTruthy();
});
```

This test validates:

- status code,
- OpenAPI response schema,
- business-relevant body values,
- readable failure messages.

---

## 22. OpenAPI documentation smoke test

This test verifies that the OpenAPI document is available.

`tests/api/openapi-documentation.spec.ts`:

```ts
import { test, expect } from "@playwright/test";
import { OPENAPI_URL } from "@config/env.config";

test("OpenAPI document is available @api @contract", async ({ request }) => {
  const response = await request.get(OPENAPI_URL);

  expect(
    response.status(),
    `expected OpenAPI document status 200, and received ${response.status()}`,
  ).toBe(200);

  const body = await response.json();

  expect(
    body.openapi,
    "expected OpenAPI document to contain openapi version",
  ).toBeTruthy();
  expect(body.paths, "expected OpenAPI document to contain paths").toBeTruthy();
  expect(
    body.components,
    "expected OpenAPI document to contain components",
  ).toBeTruthy();
});
```

This test is optional, but useful because the framework relies on OpenAPI contract validation.

---

## 23. Mocking strategy

Use Playwright route mocking for frontend integration tests.

Mocking is useful for:

```txt
empty API response
API error response
slow response / loading state
edge-case data
```

Do not mock happy paths if they can be covered through real backend.

Example:

```ts
await page.route("**/api/v1/marketplace/offers**", async (route) => {
  await route.fulfill({
    status: 500,
    contentType: "application/json",
    body: JSON.stringify({
      success: false,
      error: "Internal server error",
    }),
  });
});

await marketplacePage.open();

await marketplacePage.expectErrorStateVisible();
```

A mocked frontend integration test should verify that the frontend:

- does not crash,
- stops loading,
- shows an understandable error or empty state,
- allows recovery if the app supports it.

If the application does not handle a mocked 500 response in a stable way, document that in `docs/testing-observations.md` and submit a stable empty-state mock instead.

---

## 24. UI business test with network synchronization

Marketplace purchase is the main business UI scenario.

This test should combine:

- authenticated UI state,
- business action,
- network synchronization,
- user-visible UI assertion.

Use `page.waitForResponse()` only around the action that triggers the request.

Recommended pattern:

```ts
const [buyResponse] = await Promise.all([
  page.waitForResponse(
    (response) =>
      response.url().includes("/api/v1/marketplace/buy") &&
      response.request().method() === "POST",
  ),
  marketplacePage.buyFirstAvailableOffer(),
]);

expect(
  buyResponse.status(),
  `expected marketplace buy request status 200, and received ${buyResponse.status()}`,
).toBe(200);

await marketplacePage.expectPurchaseResultVisible();
```

Rules:

- do not use hard waits,
- do not assert only on network status,
- always verify a visible UI result after the network assertion,
- if the endpoint differs, update the matcher after checking Swagger or browser Network tab.

---

## 25. Test plan

Implement 5 core tests.

### 1. UI positive login

File:

```txt
tests/ui/public/login-positive.spec.ts
```

Tags:

```txt
@ui @smoke
```

Purpose:

- verify that demo user can log in,
- show Page Object Model,
- verify real user-facing login flow.

Assertions:

- login page is loaded,
- user can submit valid credentials,
- user reaches authenticated state.

---

### 2. UI negative login

File:

```txt
tests/ui/public/login-negative.spec.ts
```

Tags:

```txt
@ui
```

Purpose:

- verify invalid login handling,
- show negative UI scenario.

Assertions:

- error message is visible,
- user stays unauthenticated,
- login form remains available.

---

### 3. UI marketplace purchase business test

File:

```txt
tests/ui/authenticated/marketplace-purchase.spec.ts
```

Tags:

```txt
@ui @business @smoke
```

Purpose:

- use storage state,
- verify authenticated page access,
- check one important economic/business flow,
- show network synchronization with `page.waitForResponse()`.

Assertions:

- marketplace page loads,
- purchase request returns expected 200 status,
- purchase confirmation or updated state is visible,
- balance/resource value changes if reliable in UI.

---

### 4. API login contract test with OpenAPI validation

File:

```txt
tests/api/auth-login.contract.spec.ts
```

Tags:

```txt
@api @contract
```

Purpose:

- verify authentication through API,
- validate response status,
- validate response against OpenAPI,
- validate business-relevant body fields.

Assertions:

- status code is 200,
- response body matches OpenAPI response schema,
- success is true,
- user email matches expected user,
- token exists.

---

### 5. Mocked frontend error or empty-state test

File:

```txt
tests/integration/marketplace-error-state.mock.spec.ts
```

Tags:

```txt
@mock
```

Purpose:

- show frontend integration testing on mocked API,
- verify edge/error state without depending on backend state.

Assertions:

- page does not crash,
- error/empty state is visible,
- loading state disappears,
- user receives understandable feedback.

---

## 26. Optional sixth test

If time allows, add one more API validation test.

File:

```txt
tests/api/marketplace-buy.validation.spec.ts
```

Tags:

```txt
@api
```

Purpose:

- verify controlled negative API behavior for invalid marketplace buy payload,
- use factory-generated invalid payload,
- validate documented error response shape through OpenAPI.

Assertions:

- status code is 400, 401, 404 or 422 depending on documented behavior,
- response body matches OpenAPI error schema,
- business error message is meaningful,
- response is not an unexpected 500.

---

## 27. Execution strategy

Default execution:

```txt
Chromium only
workers: 3
fullyParallel: true
CI retries: 1
```

Why parallel is enabled:

- tests use isolated arrange (API funding, offer creation) where needed,
- CI starts from a clean Docker container each run,
- faster feedback for reviewers.

Residual risks (shared demo user, JSON persistence, rate limiting) are documented in `docs/known-issues.md`.

## 28. GitHub Actions

Configure **repository variables** and **secrets** in GitHub (Settings → Secrets and variables → Actions) instead of hardcoding values in the workflow.

| Name            | Type     | Example value (local `.env`)                |
| --------------- | -------- | ------------------------------------------- |
| `BASE_URL`      | Variable | `http://localhost:3000`                     |
| `API_BASE_URL`  | Variable | `http://localhost:3000/api/v1`              |
| `OPENAPI_URL`   | Variable | `http://localhost:3000/schema/openapi.json` |
| `USER_EMAIL`    | Variable | `demo@example.com`                          |
| `USER_PASSWORD` | Secret   | `demo123`                                   |

`.github/workflows/playwright.yml`:

```yaml
name: Rolnopol Playwright Tests

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]
  workflow_dispatch:

env:
  BASE_URL: ${{ vars.BASE_URL }}
  API_BASE_URL: ${{ vars.API_BASE_URL }}
  OPENAPI_URL: ${{ vars.OPENAPI_URL }}
  USER_EMAIL: ${{ vars.USER_EMAIL }}
  USER_PASSWORD: ${{ secrets.USER_PASSWORD }}

jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 20

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright Chromium
        run: npx playwright install --with-deps chromium

      - name: Run quality checks
        run: npm run quality:quick

      - name: Start Rolnopol
        run: npm run app:start

      - name: Wait for Rolnopol
        run: npm run app:wait

      - name: Run Playwright tests
        run: npm test

      - name: Print Docker logs on failure
        if: failure()
        run: docker compose logs

      - name: Stop Rolnopol
        if: always()
        run: npm run app:stop

      - name: Upload Playwright report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7
```

Order rationale:

1. install dependencies,
2. install browser,
3. run lint/format/typecheck,
4. start app,
5. wait for app,
6. run tests,
7. upload report.

Lint and typecheck do not need the application running, so they should run before Docker startup.

---

## 29. ESLint strategy

Use ESLint flat config with:

```txt
@eslint/js
typescript-eslint
eslint-plugin-playwright
eslint-config-prettier
eslint-plugin-prettier
globals
```

`eslint-plugin-prettier` keeps ESLint and Prettier aligned: formatting problems appear as lint errors in the editor and in `npm run lint`, not only when running `npm run format:check` separately.

`eslint.config.mjs` (minimal shape):

```js
import eslint from "@eslint/js";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import playwright from "eslint-plugin-playwright";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  eslintPluginPrettierRecommended,
  {
    ...playwright.configs["flat/recommended"],
    files: ["tests/**/*.ts", "**/*.spec.ts"],
  },
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "no-console": "error",
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
);
```

Main goals:

- catch TypeScript mistakes,
- prevent bad Playwright practices,
- prevent committed debug code,
- enforce Prettier formatting through ESLint,
- avoid warnings being ignored.

Suggested rules:

```txt
prettier/prettier: error
no-console: error
@typescript-eslint/no-explicit-any: error
playwright/no-wait-for-timeout: error
playwright/no-force-option: warn
playwright/expect-expect: error
```

`@typescript-eslint/explicit-function-return-type` should be strict in `src` and `config`, but not necessarily in test callbacks.

Keep `npm run format` / `format:check` for bulk fixes; lint is the day-to-day gate via `quality:quick`.

---

## 30. Husky

Pre-commit should be strict but fast.

`.husky/pre-commit`:

```sh
#!/bin/sh
npm run quality:quick
```

Do not run full Playwright tests on pre-commit because they need the application running.

Before final submission, run:

```bash
npm run quality
```

---

## 31. README structure

README should include:

```txt
1. Project overview
2. Application under test
3. Tech stack
4. Architecture decisions
5. Project structure
6. Prerequisites
7. Local setup
8. Environment variables
9. How to run the app
10. How to run tests
11. Test types and tags
12. Storage state authentication
13. OpenAPI contract validation
14. Test data management
15. Mocking strategy
16. Coding standards (link to docs/coding-standards.md)
17. Quality gate
18. CI
19. Reporting
20. Assumptions and limitations
21. Future improvements
```

Important README messages:

- Rolnopol is treated as external SUT,
- Docker Compose starts the app,
- image is pinned,
- authenticated UI tests use storage state,
- login tests stay public,
- API contracts are validated against OpenAPI,
- API tests focus on status code, OpenAPI schema and business body checks,
- default execution is serial (one worker) for stability,
- agent conventions are in `.cursor/rules/`,
- framework is intentionally medium-light.

---

## 32. Testing observations

Create `docs/testing-observations.md`.

```md
# Testing Observations

This document contains observations found during test implementation.

## Application context

Rolnopol is a training application for test automation practice. It contains intentional bugs, edge cases, API rate limiting and JSON-file based persistence.

Because of that, not every observed application issue should be treated as a test framework problem.

## Observed issues

| Area | Observation | Impact | Recommendation |
| ---- | ----------- | ------ | -------------- |
| TBD  | TBD         | TBD    | TBD            |
```

This file is useful if you discover behavior that looks like a real application bug or training-app edge case.

---

## 33. AI agent rules (Cursor)

Keep agent guidance lightweight and close to the code. Conventions live in **`.cursor/rules/`**:

| Rule file              | Scope                                                                                                 |
| ---------------------- | ----------------------------------------------------------------------------------------------------- |
| `global-guideline.mdc` | Always applied — boundaries, coding standards summary, conventional commits, execution, quality gates |
| `ui-guideline.mdc`     | UI tests, setup, integration mocks, Page Objects                                                      |
| `api-guideline.mdc`    | API tests, request layer, factories, OpenAPI assertions                                               |

Detailed references: this architecture document, `docs/coding-standards.md`, and `docs/rolnopol_context.md`. Rules stay short and point to docs rather than duplicate full examples.

After code changes, run `npm run quality:quick`. Before final submission, run `npm run quality`.

---

## 34. Definition of Done

Before final submission:

```txt
npm install works
cp .env-template .env works
npm run app:start starts Rolnopol
npm run app:wait passes
npm run quality:quick passes
npm run quality passes
Playwright HTML report is generated
GitHub Actions workflow passes
README explains setup and decisions
storage state is generated and not committed
OpenAPI document is available
API contract tests validate responses against OpenAPI
tests are readable and business-relevant
API tests have clear failure messages
API tests validate status, OpenAPI schema and business-relevant response body
Page Objects hide UI selectors
factories are used where they add value
no hardcoded URLs in tests
no hardcoded credentials in tests
no .only committed
no hard waits
no unnecessary abstractions
```

---

## 35. Recommended commit order

### Commit 1 — Project bootstrap

```txt
Initialize Playwright TypeScript project
Add base folder structure
Add .gitignore and Prettier config
```

### Commit 2 — Quality gate

```txt
Add ESLint, eslint-plugin-playwright, Prettier and TypeScript strict checks
Add quality scripts
Add Husky pre-commit
```

### Commit 3 — App startup and env

```txt
Add Docker Compose for Rolnopol
Add env config and .env-template
Add wait-on app readiness script
```

### Commit 4 — Storage state setup

```txt
Add authentication setup project
Add storage state generation
Add public and authenticated test project split
```

### Commit 5 — Framework base layers

```txt
Add routes config
Add Page Object foundation
Add API request classes
Add API status assertion helper
Add OpenAPI loader and response validator helper
Add factories
```

### Commit 6 — UI tests

```txt
Add positive login UI test
Add negative login UI test
Add authenticated marketplace purchase test
```

### Commit 7 — API tests

```txt
Add OpenAPI documentation smoke test
Add auth login API contract test using OpenAPI validation
Add API validation test with factory payload if time allows
```

### Commit 8 — Mocked integration test

```txt
Add mocked marketplace error or empty-state frontend integration test
```

### Commit 9 — CI and docs

```txt
Add GitHub Actions workflow
Add README
Add testing observations
Finalize architecture documentation
```

---

## 36. Final architecture summary

The final framework should be:

```txt
small but structured
simple but not primitive
stable by default
CI-ready
easy to run
easy to review
easy to extend
```

Final technical decisions:

```txt
Playwright + TypeScript
Docker Compose with pinned Rolnopol image
dotenv env config
Page Object Model
storage state for authenticated UI tests
public/authenticated test split
API request classes
OpenAPI as source of truth for API contracts
openapi-response-validator for API response validation
faker-based factories for generated payloads
Playwright route mocking for frontend integration tests
marketplace purchase UI test with page.waitForResponse synchronization
ESLint + eslint-plugin-playwright + eslint-plugin-prettier
Prettier
TypeScript strict
Husky quality:quick
GitHub Actions
HTML report artifact
parallel execution (see docs/known-issues.md)
```

This is the recommended balance for the assignment: it demonstrates senior-level framework design without becoming unnecessarily heavy.
