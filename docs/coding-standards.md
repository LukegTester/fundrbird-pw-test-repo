# Coding Standards — Rolnopol Playwright Framework

Canonical reference for naming, structure, style, and commits. A short summary lives in `global-guideline.mdc` (always on); UI/API test patterns are in `ui-guideline` and `api-guideline`.

---

## 1. General principles

This repository contains a Playwright + TypeScript test automation framework for the Rolnopol application.

The code should be:

- readable,
- explicit,
- maintainable,
- easy to review,
- stable in CI,
- simple enough for a recruitment assignment,
- structured enough to demonstrate senior-level framework design.

Prefer clear test intent over clever abstractions.

Avoid adding abstractions before they solve a real problem.

---

## 2. File naming conventions

Use kebab-case for file names.

Recommended suffixes:

```txt
*.page.ts
*.request.ts
*.factory.ts
*.assertion.ts
*.mock.ts
*.spec.ts
*.setup.ts
```

Examples:

```txt
login.page.ts
marketplace.page.ts
auth.request.ts
marketplace.request.ts
api-status.assertion.ts
openapi-response.assertion.ts
marketplace.factory.ts
marketplace-error-state.mock.spec.ts
auth-login.contract.spec.ts
auth.setup.ts
```

Avoid vague names:

```txt
utils.ts
helpers.ts
data.ts
test1.spec.ts
common.ts
```

If a helper file grows too much, split it by responsibility.

---

## 3. Type and model naming

Use `PascalCase` for types, interfaces and models.

Prefer names that describe the object's role.

Good:

```ts
type LoginCredentials = {
  email: string;
  password: string;
};

type MarketplaceOffer = {
  id: number;
  price: number;
  itemType: string;
};

interface OpenApiValidationOptions {
  path: string;
  method: HttpMethod;
  statusCode: number;
}
```

Avoid:

```ts
interface data {}
interface userData {}
type Obj = {};
type Thing = {};
```

Do not add the `Model` suffix everywhere by default.

Use `Model` only when it improves clarity.

Good:

```ts
interface UserModel {}
interface MarketplaceOffer {}
```

Both are acceptable depending on context.

---

## 4. Variable naming

Use `camelCase`.

Names should explain intent.

Good:

```ts
const expectedStatusCode = 200;
const loginResponse = await authRequest.login(email, password);
const currentBalance = await marketplacePage.getCurrentBalance();
```

Avoid:

```ts
const res = await authRequest.login(email, password);
const x = 200;
const data = await response.json();
```

Exception: very local and obvious variables are acceptable in short scopes, but avoid unclear names in tests and framework code.

---

## 5. Method naming

Use `camelCase`.

Method names should usually follow a `verbNoun` format.

Good:

```ts
openLoginPage();
loginAsUser();
getCurrentBalance();
buyFirstAvailableCommodity();
expectErrorStateVisible();
createInvalidBuyPayload();
```

Avoid:

```ts
doStuff();
check();
click();
test();
handle();
```

For Page Objects, method names should describe user behavior, not implementation details.

Good:

```ts
await loginPage.loginAs(demoUser);
await marketplacePage.buyFirstAvailableCommodity();
await marketplacePage.expectPurchaseConfirmationVisible();
```

Avoid exposing low-level actions directly in tests:

```ts
await loginPage.clickButton();
await loginPage.fillInput();
```

Low-level actions can exist inside Page Objects, but tests should read like scenarios.

---

## 6. Page Object standards

Page Objects should hide UI implementation details and expose business/user-level methods.

Locators should be stored inside Page Object classes, not scattered across tests.

For this framework size, `public readonly` locators on Page Objects are acceptable so specs can assert on them directly. Prefer wrapping user actions in methods (`open`, `login`, `buyFirstAvailableOffer`). Add dedicated assertion methods on the Page Object only when they improve readability.

Good:

```ts
export class LoginPage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly loginError: Locator;

  constructor(readonly page: Page) {
    this.emailInput = page.getByTestId("email-input");
    this.passwordInput = page.getByTestId("password-input");
    this.submitButton = page.getByTestId("login-submit-btn");
    this.loginError = page.getByRole("alert");
  }

  async open(): Promise<void> {
    await this.page.goto(routes.pages.login);
  }

  async login(user: LoginUserModel): Promise<void> {
    await this.emailInput.fill(user.email);
    await this.passwordInput.fill(user.password);
    await this.submitButton.click();
  }
}
```

Avoid raw selectors in tests:

```ts
await page.locator("#email").fill("demo@example.com");
await page.locator(".btn-primary").click();
```

Tests should use Page Object methods:

```ts
await loginPage.open();
await loginPage.loginAs(demoUser);
```

---

## 7. Returning Page Objects after navigation

If a Page Object method causes navigation to another page, it should return the new Page Object.

Good:

```ts
async loginAs(credentials: LoginCredentials): Promise<DashboardPage> {
  await this.emailInput.fill(credentials.email);
  await this.passwordInput.fill(credentials.password);
  await this.submitButton.click();

  return new DashboardPage(this.page);
}
```

Usage:

```ts
const dashboardPage = await loginPage.loginAs(demoUser);
await dashboardPage.expectLoaded();
```

If the method does not navigate to a new page, return `Promise<void>`.

Good:

```ts
async buyFirstAvailableCommodity(): Promise<void> {
  await this.firstBuyButton.click();
}
```

Do not return Page Objects just to be clever. Return them only when navigation or screen transition really happens.

---

## 8. Locator strategy

Locator priority:

```txt
1. getByTestId
2. getByRole
3. getByLabel
4. getByText
5. stable CSS / id selector
```

Why `getByTestId` first?

Rolnopol is a training application and may not always expose perfect accessibility semantics. If stable `data-testid` attributes exist, they are explicit test hooks and are usually the most stable option.

Good:

```ts
page.getByTestId("login-email-input");
page.getByRole("button", { name: "Login" });
page.getByLabel("Email");
page.getByText("Invalid credentials");
page.locator("#email");
```

Avoid:

```ts
page.locator("div > div > section > button");
page.locator("//button[1]");
page.locator(".btn").nth(2);
```

Rules:

- keep locators inside Page Objects,
- prefer stable selectors,
- avoid XPath unless there is no better option,
- avoid long CSS chains,
- avoid index-based selectors unless the UI genuinely requires it,
- add a short comment if an unusual selector is necessary.

---

## 9. Test structure — Arrange, Act, Assert

Tests should follow the AAA structure:

```txt
Arrange — prepare data, pages, requests, expected values
Act — perform the tested action
Assert — verify the result
```

Good:

```ts
test("user can log in with valid credentials @ui @smoke", async ({ page }) => {
  // Arrange
  const loginPage = new LoginPage(page);

  // Act
  await loginPage.open();
  const dashboardPage = await loginPage.loginAs(demoUser);

  // Assert
  await dashboardPage.expectLoaded();
});
```

Avoid mixing too many unrelated actions and assertions in one test.

A test should verify one main behavior.

---

## 10. Test naming

Test names should describe user-visible or business behavior.

Good:

```ts
test("user can log in with valid credentials @ui @smoke", async ({
  page,
}) => {});
test("invalid login shows an error message @ui", async ({ page }) => {});
test("user can buy a commodity from marketplace @ui @business", async ({
  page,
}) => {});
test("login API response matches OpenAPI contract @api @contract", async ({
  request,
}) => {});
```

Avoid:

```ts
test("login test", async () => {});
test("check marketplace", async () => {});
test("test 1", async () => {});
```

Use tags intentionally:

```txt
@ui
@api
@mock
@contract
@smoke
@business
```

Do not over-tag every test.

---

## 11. Assertion standards

Assertions should verify meaningful behavior.

For UI tests, prefer user-visible assertions.

Good:

```ts
await expect(page.getByTestId("purchase-confirmation")).toBeVisible();
await expect(page).toHaveURL(/marketplace/);
```

For API tests, validate:

```txt
status code
OpenAPI contract when relevant
business-relevant response body fields
```

Good:

```ts
expectResponseStatus(response, 200, "Login API response");

expect(
  body.data.email,
  `expected authenticated user email to be ${demoUser.email}, and received ${body.data.email}`,
).toBe(demoUser.email);
```

Avoid assertions that do not prove useful behavior:

```ts
expect(response).toBeTruthy();
expect(body).toBeDefined();
```

These are too weak unless they are part of a more meaningful check.

---

## 12. Assertion messages

Use assertion messages when they improve debugging.

Recommended for:

- API status checks,
- business-critical values,
- non-obvious expectations,
- custom helpers.

Good:

```ts
expect(
  response.status(),
  `expected status code ${expectedStatusCode}, and received ${response.status()}`,
).toBe(expectedStatusCode);
```

Good:

```ts
expect(
  body.data.email,
  `expected authenticated user email to be ${demoUser.email}, and received ${body.data.email}`,
).toBe(demoUser.email);
```

Do not add noisy messages to obvious Playwright UI assertions unless they improve clarity.

Acceptable:

```ts
await expect(loginPage.emailInput).toBeVisible();
```

Also acceptable when the context matters:

```ts
await expect(
  page.getByTestId("purchase-confirmation"),
  "purchase confirmation should be visible after successful marketplace buy",
).toBeVisible();
```

---

## 13. Expected values in assertions

Extract expected values when they are:

- reused,
- business-relevant,
- not immediately obvious,
- useful for debugging,
- part of a test scenario setup.

Good:

```ts
const expectedStatusCode = 200;
const expectedEmail = demoUser.email;

expectResponseStatus(response, expectedStatusCode, "Login API response");
expect(body.data.email).toBe(expectedEmail);
```

Do not extract values only to satisfy a rule if it makes the test noisier.

Acceptable:

```ts
expect(
  body.data.token,
  "expected login response to contain token",
).toBeTruthy();
```

Avoid:

```ts
expect(someComplexFunction()).toBe("hardcoded value");
```

Better:

```ts
const expectedMessage = "Invalid credentials";
const actualMessage = await loginPage.getErrorMessage();

expect(actualMessage).toBe(expectedMessage);
```

---

## 14. API request layer standards

API request classes should perform HTTP calls only.

They should not contain test assertions.

Good:

```ts
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

Tests decide what to assert:

```ts
const response = await authRequest.login(demoUser.email, demoUser.password);

expectResponseStatus(response, 200, "Login API response");
```

Avoid putting assertions inside request classes.

Bad:

```ts
async login(email: string, password: string): Promise<void> {
  const response = await this.request.post(...);
  expect(response.status()).toBe(200);
}
```

Request classes should be reusable across positive and negative tests.

---

## 15. API contract validation with OpenAPI

Rolnopol exposes an OpenAPI document at:

```txt
http://localhost:3000/schema/openapi.json
```

OpenAPI is the source of truth for API response contracts.

API contract tests should follow this structure:

```txt
1. Send request
2. Assert status code
3. Parse response body
4. Validate response body against OpenAPI response schema
5. Assert business-relevant response fields
```

Good:

```ts
const response = await authRequest.login(demoUser.email, demoUser.password);

expectResponseStatus(response, 200, "Login API response");

const body = await response.json();

await expectResponseMatchesOpenApi({
  body,
  path: routes.api.login,
  method: "post",
  statusCode: 200,
  context: "Login API response",
});

expect(body.data.email).toBe(demoUser.email);
expect(body.data.token).toBeTruthy();
```

Rules:

- OpenAPI validates the documented response shape,
- Playwright assertions validate business logic,
- do not validate every header unless the scenario requires it,
- do not write manual schemas for responses already covered by OpenAPI.

---

## 16. OpenAPI helper standards

OpenAPI helpers should be reusable and explicit.

Good helper name:

```ts
expectResponseMatchesOpenApi();
```

The helper should require:

```txt
body
path
method
statusCode
context
```

Example call:

```ts
await expectResponseMatchesOpenApi({
  body,
  path: routes.api.login,
  method: "post",
  statusCode: 200,
  context: "Login API response",
});
```

The OpenAPI document should be loaded once and cached.

Do not fetch `/schema/openapi.json` in every assertion if it is already loaded.

---

## 17. Test data standards

Use two types of test data:

```txt
static test data
factory-generated test data
```

Use static test data for known demo users:

```ts
export const demoUser = {
  email: USER_EMAIL,
  password: USER_PASSWORD,
} as const;
```

Use factories for generated payloads:

```ts
export const createInvalidMarketplaceBuyPayload = (): {
  offerId: string;
} => ({
  offerId: faker.string.uuid(),
});
```

Rules:

- prefer static data when it is clearer,
- use faker when generated or invalid data adds value,
- factories should return plain objects,
- avoid random data in UI tests unless necessary,
- avoid hiding important business values behind factory magic.

---

## 18. Storage state standards

Authenticated UI tests should use storage state.

Public login tests should not use storage state.

Structure:

```txt
tests/ui/integration   (@non-logged login specs)
tests/ui/e2e           (@logged business specs)
tests/setup/auth.setup.ts
tmp/session.json       (generated, gitignored)
```

Rules:

- login tests use `@non-logged` and verify real login behavior,
- authenticated tests use `@logged` and reuse `tmp/session.json` from the setup project,
- storage state must not be committed,
- do not repeat UI login in every authenticated test.

Add to `.gitignore`:

```txt
tmp/*
!tmp/.gitkeep
```

---

## 19. Network synchronization standards

Use `page.waitForResponse()` only when the test needs to verify a specific backend request triggered by a UI action.

Good use case:

```txt
Marketplace purchase triggers buy API request.
```

Recommended pattern:

```ts
const [buyResponse] = await Promise.all([
  page.waitForResponse(
    (response) =>
      response.url().includes("/api/v1/marketplace/buy") &&
      response.request().method() === "POST",
  ),
  marketplacePage.buyFirstAvailableCommodity(),
]);

expect(
  buyResponse.status(),
  `expected marketplace buy request status 200, and received ${buyResponse.status()}`,
).toBe(200);
```

Rules:

- use `Promise.all` to avoid missing the response,
- match both URL and method,
- do not use arbitrary waits,
- always add UI assertions after network assertions,
- do not use network assertions as a replacement for user-visible validation.

---

## 20. Mocking standards

Use `page.route()` for frontend integration tests on mocks.

Good cases for mocking:

```txt
API returns 500
API returns empty list
API returns edge-case data
API responds slowly
```

Do not mock happy paths that can be covered through the real backend.

Good:

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
```

Rules:

- mock only endpoints needed for the scenario,
- keep mock data in `src/mocks`,
- verify user-visible frontend behavior,
- document unstable or missing error handling in `docs/testing-observations.md`.

---

## 21. Waiting standards

Do not use hard waits.

Avoid:

```ts
await page.waitForTimeout(3000);
```

Prefer:

```ts
await expect(page.getByTestId('marketplace')).toBeVisible();
await page.waitForResponse(...);
await expect(locator).toHaveText(expectedText);
```

Playwright auto-waiting should handle most UI synchronization.

Hard waits make tests slower and flaky.

---

## 22. Comments standards

Comments should explain why, not what.

Good:

```ts
// Rolnopol stores state in JSON files, so this test avoids mutating shared data.
```

Bad:

```ts
// Click login button
await loginButton.click();
```

Code should already make the "what" obvious.

---

## 23. Error handling standards

Custom helpers should throw or assert with useful context.

Good:

```ts
throw new Error(`${context}: OpenAPI path '${path}' was not found`);
```

Good:

```ts
expect(
  validationError,
  `${context}: response does not match OpenAPI schema. ${JSON.stringify(validationError, null, 2)}`,
).toBeUndefined();
```

Avoid vague errors:

```ts
throw new Error("Failed");
```

---

## 24. Import standards

Use path aliases for project imports.

Good:

```ts
import { LoginPage } from "@src/pages/login.page";
import { routes } from "@src/routes/routes";
import { demoUser } from "@src/test-data/users";
```

Avoid deep relative imports when aliases are available:

```ts
import { LoginPage } from "../../../src/pages/login.page";
```

Relative imports are acceptable inside the same small folder.

---

## 25. TypeScript standards

Use strict TypeScript.

Avoid `any`.

Good:

```ts
type HttpMethod = "get" | "post" | "put" | "patch" | "delete";
```

Avoid:

```ts
const body: any = await response.json();
```

Use `unknown` when the shape is not known yet.

Good:

```ts
const body: unknown = await response.json();
```

Then validate it through OpenAPI or business-specific checks.

Explicit return types are required in `src` and `config`.

They are not required for Playwright test callbacks.

---

## 26. Test isolation standards

Tests should not depend on execution order.

Avoid:

```txt
test B depends on data created by test A
```

If a test mutates backend state, it should either:

- use isolated data,
- use a controlled reset/debug endpoint,
- or clearly document why it is safe.

This project runs with parallel workers (`fullyParallel: true`, multiple workers in `playwright.config.ts`) after verifying test isolation. Residual risks (shared demo user, JSON persistence, rate limiting) are documented in `docs/known-issues.md`.

---

## 27. Quality gate standards

Every completed work unit should pass:

```bash
npm run quality:quick
```

Before final submission, run:

```bash
npm run app:start
npm run app:wait
npm run quality
npm run app:stop
```

Quality gate includes:

```txt
lint
format check
typecheck
tests
```

Do not commit code with:

```txt
test.only
console.log
hard waits
unused code
TypeScript errors
ESLint warnings
```

---

## 28. Git standards — Conventional Commits

Follow [Conventional Commits](https://www.conventionalcommits.org/) using this project's cheatsheet: [qoomon/conventional-commits-cheatsheet](https://gist.github.com/qoomon/5dfcdf8eec66a051ecd85625518cfd13).

### Format

```txt
<type>(<optional scope>): <description>

<optional body>

<optional footer>
```

### Description rules

- **Mandatory**, imperative present tense: `add` not `added` / `adds`
- Lowercase first letter, no trailing period
- Think: "This commit will…"

### Type (choose first match)

| Order | Question                                  | Type       |
| ----- | ----------------------------------------- | ---------- |
| 1     | Bug fix?                                  | `fix`      |
| 2     | New or changed test behavior (UI/API)?    | `feat`     |
| 3     | Tests added or corrected?                 | `test`     |
| 4     | Formatting only (no behavior)?            | `style`    |
| 5     | Documentation only?                       | `docs`     |
| 6     | Dependencies, build tools, versions?      | `build`    |
| 7     | CI/CD, Docker, GitHub Actions?            | `ops`      |
| 8     | Maintenance (`.gitignore`, init, chores)? | `chore`    |
| 9     | Performance-focused change?               | `perf`     |
| 10    | Otherwise                                 | `refactor` |

Common types for this repo:

- `feat` — new tests, Page Objects, API helpers, framework capability
- `fix` — failing tests, wrong locators, contract/assertion bugs
- `test` — test-only changes when not adding new capability
- `docs` — README, architecture, coding standards
- `build` / `ops` — npm deps, ESLint, Playwright install, CI workflow

### Scope (optional)

Logical area of the framework — **not** issue/ticket IDs.

Suggested scopes: `ui`, `api`, `pages`, `config`, `e2e`, `ci`, `deps`, `docs`.

### Breaking changes

- Append `!` before `:` in subject: `feat(api)!: remove legacy login helper`
- Or footer: `BREAKING CHANGE: <description>`

### Examples

```txt
test(ui): add positive login spec
feat(api): add OpenAPI response validation helper
fix(pages): use stable test id for marketplace buy button
refactor(config): centralize routes in routes.ts
docs: add coding standards
build(deps): add openapi-response-validator
ops(ci): add GitHub Actions workflow with repository variables
chore: init
```

### Avoid

```txt
fix
changes
update
work
test
Add storage state setup
```

Prefer small, logical commits with a clear conventional subject line.

---

## 29. Practical rule

When in doubt, choose the simpler solution that is:

```txt
readable
testable
stable
easy to explain in README
easy for a reviewer to run
```

This is a recruitment framework, not a long-lived enterprise platform.

The goal is to demonstrate good judgment, not maximum abstraction.
