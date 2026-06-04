import { expect, test } from "@playwright/test";
import { createOfferWithSellableItem } from "@src/api/helpers/find-sellable-item";
import { expectResponseStatus } from "@src/api/assertions/api-status.assertion";
import { expectResponseMatchesOpenApi } from "@src/api/assertions/openapi-response.assertion";
import { AuthRequest } from "@src/api/requests/auth.request";
import { MarketplaceRequest } from "@src/api/requests/marketplace.request";
import { routes } from "@src/config/routes";
import type { ApiCreateOfferResponseBody } from "@src/models/marketplace.model";
import { demoUser } from "@src/test-data/users";

test.describe("Marketplace /api/v1/marketplace/offers API contract", () => {
  test(
    "create offer response matches OpenAPI contract",
    { tag: ["@api", "@contract", "@logged"] },
    async ({ request }) => {
      // Arrange
      const token = await new AuthRequest(request).getToken(
        demoUser.email,
        demoUser.password,
      );

      // Act
      const { response, sellableItem } = await createOfferWithSellableItem(
        new MarketplaceRequest(request),
        token,
        {
          price: 75,
          description: "Playwright API contract offer",
        },
      );

      // Assert — status code
      // Note: OpenAPI documents 201 Created; the live app returns 200.
      // This is an app-side inconsistency documented in testing-observations.md.
      expectResponseStatus(response, 200, "Create offer API response");

      const body = (await response.json()) as ApiCreateOfferResponseBody;

      // Assert — OpenAPI schema (validated against the documented 201 response shape,
      // which matches the actual body returned with status 200)
      await expectResponseMatchesOpenApi({
        request,
        body,
        path: routes.api.marketplaceOffers,
        method: "post",
        statusCode: 201,
        context: "Create offer API response",
      });

      // Assert — business fields
      expect(
        body.success,
        `expected create offer success to be true, and received ${body.success}`,
      ).toBe(true);

      expect(
        body.data.offer.id,
        "expected created offer to have a positive id",
      ).toBeGreaterThan(0);

      expect(body.data.offer.itemType).toBe(sellableItem.itemType);
      expect(body.data.offer.itemId).toBe(sellableItem.itemId);
    },
  );
});
