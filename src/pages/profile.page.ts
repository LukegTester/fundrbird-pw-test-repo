import { Locator, Page } from "@playwright/test";
import { BasePage } from "@src/pages/base.page";

export class ProfilePage extends BasePage {
  url = "/profile.html";
  readonly profileEmail: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    super(page);
    this.profileEmail = page.locator("#profileEmail");
    this.logoutButton = page
      .getByTestId("header-component")
      .getByTestId("logout-btn");
  }
}
