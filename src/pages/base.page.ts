import { Page } from "@playwright/test";

export class BasePage {
  url = "";

  constructor(protected page: Page) {}

  async open(parameters = ""): Promise<void> {
    await this.page.goto(`${this.url}${parameters}`);
  }
}
