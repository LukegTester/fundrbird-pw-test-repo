import { expect, test } from "@src/fixtures/merge.fixtures";
import { createUnknownEmailUser } from "@src/factories/auth.factory";
import { routes } from "@src/config/routes";
import { demoUser, wrongPasswordUser } from "@src/test-data/users";

test.describe("Verify login", () => {
  test(
    "logs in with valid credentials",
    { tag: ["@ui", "@smoke", "@integration", "@non-logged"] },
    async ({ loginPage, page }) => {
      // Arrange
      const expectedProfileUrl = new RegExp(`${routes.pages.profile}$`);

      // Act
      await loginPage.open();
      await loginPage.login(demoUser);

      // Assert
      await expect(page).toHaveURL(expectedProfileUrl);
    },
  );

  test(
    "rejects valid email and wrong password",
    { tag: ["@ui", "@integration", "@non-logged"] },
    async ({ loginPage, page }) => {
      // Arrange
      const expectedLoginError = /Invalid credentials/i;
      const expectedLoginUrl = new RegExp(`${routes.pages.login}$`);

      // Act
      await loginPage.open();
      await loginPage.login(wrongPasswordUser);

      // Assert
      await expect.soft(loginPage.loginError).toContainText(expectedLoginError);
      await expect(page).toHaveURL(expectedLoginUrl);
    },
  );

  test(
    "rejects unknown email with valid password",
    { tag: ["@ui", "@integration", "@non-logged"] },
    async ({ loginPage, page }) => {
      // Arrange
      const unknownEmailUser = createUnknownEmailUser();
      const expectedLoginError = /Invalid credentials/i;
      const expectedLoginUrl = new RegExp(`${routes.pages.login}$`);

      // Act
      await loginPage.open();
      await loginPage.login(unknownEmailUser);

      // Assert
      await expect.soft(loginPage.loginError).toContainText(expectedLoginError);
      await expect(page).toHaveURL(expectedLoginUrl);
    },
  );
});
