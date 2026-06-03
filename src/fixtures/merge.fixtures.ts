import { test as base, expect } from "@playwright/test";
import { LoginPage } from "@src/pages/login.page";
import { MarketplacePage } from "@src/pages/marketplace.page";

type UiFixtures = {
  loginPage: LoginPage;
  marketplacePage: MarketplacePage;
};

export const test = base.extend<UiFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  marketplacePage: async ({ page }, use) => {
    await use(new MarketplacePage(page));
  },
});

export { expect };
