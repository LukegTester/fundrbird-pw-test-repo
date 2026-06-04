import { expect, test } from "@src/fixtures/merge.fixtures";
import { createOfferWithSellableItem } from "@src/api/helpers/find-sellable-item";
import { expectResponseStatus } from "@src/api/assertions/api-status.assertion";
import { FinancialRequest } from "@src/api/requests/financial.request";
import { MarketplaceRequest } from "@src/api/requests/marketplace.request";
import { routes } from "@src/config/routes";
import { financialAccountZeroBalance } from "@src/mocks/financial.mock";
import { incomeTransactionPayload } from "@src/test-data/financial-transactions";

test.describe("Marketplace purchase", () => {
  test(
    "completes a marketplace purchase",
    { tag: ["@ui", "@business", "@smoke", "@logged"] },
    async ({ marketplacePage, page, request, apiToken }) => {
      // Arrange — fund account and create a purchasable offer via API
      const financialRequest = new FinancialRequest(request);
      const fundResponse = await financialRequest.addTransaction(
        apiToken,
        incomeTransactionPayload,
      );
      expectResponseStatus(fundResponse, 201, "Fund account via API");

      const marketplaceRequest = new MarketplaceRequest(request);
      await createOfferWithSellableItem(marketplaceRequest, apiToken, {
        price: 50,
        description: "Playwright purchase arrange offer",
      });

      await marketplacePage.open();
      await marketplacePage.waitForOffersLoaded();
      await expect(marketplacePage.firstBuyButton).toBeVisible();

      // Act
      await marketplacePage.buyFirstAvailableOffer();
      await expect(marketplacePage.confirmationModal).toBeVisible();

      const [buyResponse] = await Promise.all([
        page.waitForResponse(
          (response) =>
            response.url().includes(routes.api.marketplaceBuy) &&
            response.request().method() === "POST",
        ),
        marketplacePage.confirmPurchase(),
      ]);

      // Assert
      expect(buyResponse.status()).toBe(200);
      await expect(marketplacePage.notification).toContainText(
        "Purchase completed successfully!",
      );
    },
  );

  /**
   * Improvement opportunity: the UI should validate balance client-side and
   * block the purchase (or disable buy buttons) when funds are insufficient,
   * avoiding an unnecessary round-trip to the server.  Currently the backend
   * accepts the order regardless of balance, so the purchase succeeds even
   * with 0 funds.  The assertion below reflects that actual (unguarded)
   * behaviour.
   */
  test(
    "0 balance should not allow to purchase (no client-side guard)",
    { tag: ["@mock", "@logged", "@integration"] },
    async ({ marketplacePage, page }) => {
      // Arrange
      await page.route(`**${routes.api.financialAccount}`, (route) =>
        route.fulfill({
          status: financialAccountZeroBalance.status,
          contentType: "application/json",
          body: JSON.stringify(financialAccountZeroBalance.body),
        }),
      );

      await marketplacePage.open();
      await marketplacePage.waitForOffersLoaded();
      await expect(marketplacePage.userBalance).toContainText("0");

      // Act
      await marketplacePage.buyFirstAvailableOffer();
      await expect(marketplacePage.confirmationModal).toBeVisible();

      const [buyResponse] = await Promise.all([
        page.waitForResponse(
          (response) =>
            response.url().includes(routes.api.marketplaceBuy) &&
            response.request().method() === "POST",
        ),
        marketplacePage.confirmPurchase(),
      ]);

      // Assert — purchase goes through; ideally this should be blocked
      // with an "Insufficient funds" error before the request is sent.
      expect(buyResponse.status()).toBe(200);
      await expect(marketplacePage.notification).toContainText(
        "Purchase completed successfully!",
      );
    },
  );
});
