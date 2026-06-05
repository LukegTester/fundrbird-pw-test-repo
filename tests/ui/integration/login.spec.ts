import { expect, test } from "@src/fixtures/merge.fixtures";
import { createUnknownEmailUser } from "@src/factories/auth.factory";
import { routes } from "@src/routes/routes";
import { demoUser, wrongPasswordUser } from "@src/test-data/users";

test.describe("User login", () => {
  test(
    "User can log in with valid credentials",
    { tag: ["@ui", "@smoke", "@integration", "@non-logged"] },
    async ({ loginPage, page }) => {
      // Arrange
      const expectedProfileUrl = new RegExp(`${routes.pages.profile}$`);

      // Act
      const profilePage = await loginPage.login(demoUser);

      // Assert
      await expect(page).toHaveURL(expectedProfileUrl);
      await expect(profilePage.profileEmail).toBeVisible();
      await expect(profilePage.logoutButton).toBeVisible();
    },
  );

  test(
    "Login is rejected for a valid email with the wrong password",
    { tag: ["@ui", "@integration", "@non-logged"] },
    async ({ loginPage, page }) => {
      // Arrange
      const expectedLoginError = /Invalid credentials/i;
      const expectedLoginUrl = new RegExp(`${routes.pages.login}$`);

      // Act
      await loginPage.login(wrongPasswordUser);

      // Assert
      await expect.soft(loginPage.loginError).toContainText(expectedLoginError);
      await expect(page).toHaveURL(expectedLoginUrl);
    },
  );

  test(
    "Login is rejected for an unknown email",
    { tag: ["@ui", "@integration", "@non-logged"] },
    async ({ loginPage, page }) => {
      // Arrange
      const unknownEmailUser = createUnknownEmailUser();
      const expectedLoginError = /Invalid credentials/i;
      const expectedLoginUrl = new RegExp(`${routes.pages.login}$`);

      // Act
      await loginPage.login(unknownEmailUser);

      // Assert
      await expect.soft(loginPage.loginError).toContainText(expectedLoginError);
      await expect(page).toHaveURL(expectedLoginUrl);
    },
  );
});
