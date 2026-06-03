import { expect, test as setup } from "@src/fixtures/merge.fixtures";
import { authFile } from "../../playwright.config";
import { routes } from "@src/config/routes";
import { demoUser } from "@src/test-data/users";

setup("authenticate as demo user", async ({ loginPage, page }) => {
  await loginPage.open();
  await loginPage.login(demoUser);
  await expect(page).toHaveURL(new RegExp(`${routes.pages.profile}$`));

  await page.context().storageState({ path: authFile });
});
