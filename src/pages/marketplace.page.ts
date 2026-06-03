import type { Locator, Page } from "@playwright/test";
import { routes } from "@src/config/routes";

export class MarketplacePage {
  readonly page: Page;
  readonly offersGrid: Locator;
  readonly offerCards: Locator;
  readonly firstBuyButton: Locator;
  readonly firstBuyButtonAny: Locator;
  readonly disabledBuyButtons: Locator;
  readonly confirmationModal: Locator;
  readonly confirmButton: Locator;
  readonly emptyState: Locator;
  readonly userBalance: Locator;
  readonly notification: Locator;

  constructor(page: Page) {
    this.page = page;
    this.offersGrid = page.locator("#browseOffers");
    this.offerCards = this.offersGrid.locator(".offer-card");
    this.firstBuyButton = this.offersGrid
      .locator(".btn-buy:not([disabled])")
      .first();
    this.firstBuyButtonAny = this.offersGrid.locator(".btn-buy").first();
    this.disabledBuyButtons = this.offersGrid.locator(".btn-buy[disabled]");
    this.confirmationModal = page.getByTestId("confirmation-modal");
    this.confirmButton = this.confirmationModal.getByTestId(
      "confirmation-modal-confirm",
    );
    this.emptyState = this.offersGrid.locator(".empty-state");
    this.userBalance = page.locator("#userBalance");
    this.notification = page.getByRole("alert");
  }

  async open(): Promise<void> {
    await this.page.goto(routes.pages.marketplace);
  }

  async waitForOffersLoaded(): Promise<void> {
    await this.offersGrid.waitFor({ state: "visible" });
    await this.offersGrid.locator(".loading").waitFor({ state: "hidden" });
  }

  async buyFirstAvailableOffer(): Promise<void> {
    await this.firstBuyButton.click();
  }

  async tryBuyFirstOffer(): Promise<void> {
    await this.firstBuyButtonAny.click();
  }

  async confirmPurchase(): Promise<void> {
    await this.confirmButton.click();
  }
}
