import { test as base, expect } from "@playwright/test";
import { LoginPage } from "@src/pages/login.page";

type UiFixtures = {
  loginPage: LoginPage;
};

export const test = base.extend<UiFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
});

export { expect };
