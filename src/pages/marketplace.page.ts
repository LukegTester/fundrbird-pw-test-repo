import type { Locator, Page } from "@playwright/test";
import { routes } from "@src/routes/routes";

export class MarketplacePage {
  readonly page: Page;
  readonly offersGrid: Locator;
  readonly firstBuyButton: Locator;
  readonly confirmationModal: Locator;
  readonly confirmButton: Locator;
  readonly userBalance: Locator;
  readonly notification: Locator;

  constructor(page: Page) {
    this.page = page;
    // No data-testid on browse grid / offer cards in v1.25.0 — stable IDs/classes from discovery.
    this.offersGrid = page.locator("#browseOffers");
    this.firstBuyButton = this.offersGrid
      .locator(".btn-buy:not([disabled])")
      .first();
    this.confirmationModal = page.getByTestId("confirmation-modal");
    this.confirmButton = this.confirmationModal.getByTestId(
      "confirmation-modal-confirm",
    );
    this.userBalance = page.locator("#userBalance");
    this.notification = page.getByRole("alert");
  }

  async open(): Promise<void> {
    await this.page.goto(routes.pages.marketplace);
  }

  async waitForOffersLoaded(): Promise<void> {
    await this.offersGrid.waitFor({ state: "visible" });
    // Loading spinner inside grid — no test-id; wait for hidden before interacting.
    await this.offersGrid.locator(".loading").waitFor({ state: "hidden" });
  }

  async buyFirstAvailableOffer(): Promise<void> {
    await this.firstBuyButton.click();
  }

  async confirmPurchase(): Promise<void> {
    await this.confirmButton.click();
  }
}
