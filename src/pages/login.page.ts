import type { Locator, Page } from "@playwright/test";
import { routes } from "@src/routes/routes";
import type { LoginUserModel } from "@src/models/user.model";

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly loginError: Locator;

  constructor(page: Page) {
    this.page = page;
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
