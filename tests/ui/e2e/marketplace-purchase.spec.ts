import { expect, test } from "@src/fixtures/merge.fixtures";
import { routes } from "@src/config/routes";
import { financialAccountZeroBalance } from "@src/mocks/marketplace.mock";

test.describe("Marketplace purchase", () => {
  test(
    "completes a marketplace purchase",
    { tag: ["@ui", "@business", "@smoke", "@logged"] },
    async ({ marketplacePage, page }) => {
      // Arrange
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
});

/**
 * Improvement opportunity: the UI should validate balance client-side and
 * block the purchase (or disable buy buttons) when funds are insufficient,
 * avoiding an unnecessary round-trip to the server.  Currently the backend
 * accepts the order regardless of balance, so the purchase succeeds even
 * with 0 funds.  The assertion below reflects that actual (unguarded)
 * behaviour.
 */
test.describe("Marketplace purchase — zero balance", () => {
  test(
    "purchase succeeds despite zero balance (no client-side guard)",
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
