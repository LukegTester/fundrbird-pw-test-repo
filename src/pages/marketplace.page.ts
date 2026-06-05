import { expect, Locator, Page } from "@playwright/test";
import { BasePage } from "@src/pages/base.page";

export class MarketplacePage extends BasePage {
  url = "/marketplace.html";
  readonly offersGrid: Locator;
  readonly firstBuyButton: Locator;
  readonly confirmationModal: Locator;
  readonly confirmButton: Locator;
  readonly userBalance: Locator;
  readonly notification: Locator;

  constructor(page: Page) {
    super(page);
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

  async waitForOffersLoaded(): Promise<void> {
    await expect(this.offersGrid).toBeVisible();
    // Loading spinner inside grid — no test-id; wait until hidden before interacting.
    await expect(this.offersGrid.locator(".loading")).toBeHidden();
  }

  async buyFirstAvailableOffer(): Promise<void> {
    await expect(this.firstBuyButton).toBeVisible();
    await this.firstBuyButton.click();
    await expect(this.confirmationModal).toBeVisible();
  }

  async confirmPurchase(): Promise<void> {
    await this.confirmButton.click();
  }
}
