import { expect, test } from "@playwright/test";
import { expectResponseStatus } from "@src/api/assertions/api-status.assertion";
import { expectResponseMatchesOpenApi } from "@src/api/assertions/openapi-response.assertion";
import { AuthRequest } from "@src/api/requests/auth.request";
import { FinancialRequest } from "@src/api/requests/financial.request";
import { routes } from "@src/routes/routes";
import type { ApiFinancialTransactionResponseBody } from "@src/models/financial.model";
import { incomeTransactionPayload } from "@src/test-data/financial-transactions";
import { demoUser } from "@src/test-data/users";

test.describe("Financial /api/v1/financial/transactions API contract", () => {
  test(
    "add income transaction response matches OpenAPI contract",
    { tag: ["@api", "@contract", "@logged"] },
    async ({ request }) => {
      // Arrange
      const token = await new AuthRequest(request).getToken(
        demoUser.email,
        demoUser.password,
      );

      // Act
      const response = await new FinancialRequest(request).addTransaction(
        token,
        incomeTransactionPayload,
      );

      // Assert — status code
      expectResponseStatus(response, 201, "Add transaction API response");

      const body =
        (await response.json()) as ApiFinancialTransactionResponseBody;

      // Assert — OpenAPI schema
      await expectResponseMatchesOpenApi({
        request,
        body,
        path: routes.api.financialTransactions,
        method: "post",
        statusCode: 201,
        context: "Add transaction API response",
      });

      // Assert — business fields
      expect(
        body.success,
        `expected transaction response success to be true, and received ${body.success}`,
      ).toBe(true);

      expect(
        body.data.transaction.type,
        `expected transaction type income, and received ${body.data.transaction.type}`,
      ).toBe("income");

      expect(
        body.data.transaction.amount,
        `expected transaction amount ${incomeTransactionPayload.amount}, and received ${body.data.transaction.amount}`,
      ).toBe(incomeTransactionPayload.amount);

      expect(
        body.data.transaction.description,
        "expected transaction description to match submitted value",
      ).toBe(incomeTransactionPayload.description);
    },
  );
});
