import { test as base, expect } from "@playwright/test";
import { extractTokenFromStorageState } from "@src/api/auth/extract-token";
import { LoginPage } from "@src/pages/login.page";
import { MarketplacePage } from "@src/pages/marketplace.page";

type UiFixtures = {
  loginPage: LoginPage;
  marketplacePage: MarketplacePage;
  apiToken: string;
};

export const test = base.extend<UiFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await use(loginPage);
  },
  marketplacePage: async ({ page }, use) => {
    const marketplacePage = new MarketplacePage(page);
    await use(marketplacePage);
  },
  // eslint-disable-next-line no-empty-pattern -- reads token from storage state file, no browser deps
  apiToken: async ({}, use) => {
    await use(extractTokenFromStorageState());
  },
});

export { expect };
