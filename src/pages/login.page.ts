import { Locator, Page } from "@playwright/test";
import type { LoginUserModel } from "@src/models/user.model";
import { BasePage } from "@src/pages/base.page";
import { ProfilePage } from "@src/pages/profile.page";

export class LoginPage extends BasePage {
  url = "/login.html";
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly loginError: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.getByTestId("email-input");
    this.passwordInput = page.getByTestId("password-input");
    this.submitButton = page.getByTestId("login-submit-btn");
    this.loginError = page.getByRole("alert");
  }

  async login(user: LoginUserModel): Promise<ProfilePage> {
    await this.emailInput.fill(user.email);
    await this.passwordInput.fill(user.password);
    await this.submitButton.click();

    return new ProfilePage(this.page);
  }
}
