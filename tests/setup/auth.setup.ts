import { STORAGE_STATE } from "@config/paths";
import { expect, test as setup } from "@src/fixtures/merge.fixtures";
import { routes } from "@src/routes/routes";
import { demoUser } from "@src/test-data/users";

setup("Sign in demo user and save session", async ({ loginPage, page }) => {
  await loginPage.login(demoUser);
  await expect(page).toHaveURL(new RegExp(`${routes.pages.profile}$`));

  await page.context().storageState({ path: STORAGE_STATE });
});
