import { STORAGE_STATE } from "../../playwright.config";
import { expect, test as setup } from "@src/fixtures/merge.fixtures";
import { routes } from "@src/routes/routes";
import { demoUser } from "@src/test-data/users";

setup("authenticate as demo user", async ({ loginPage, page }) => {
  await loginPage.open();
  await loginPage.login(demoUser);
  await expect(page).toHaveURL(new RegExp(`${routes.pages.profile}$`));

  await page.context().storageState({ path: STORAGE_STATE });
});
