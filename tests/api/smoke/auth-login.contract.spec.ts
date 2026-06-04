import { expect, test } from "@playwright/test";
import { expectResponseStatus } from "@src/api/assertions/api-status.assertion";
import { expectResponseMatchesOpenApi } from "@src/api/assertions/openapi-response.assertion";
import { AuthRequest } from "@src/api/requests/auth.request";
import { routes } from "@src/routes/routes";
import { demoUser } from "@src/test-data/users";
import type { ApiLoginResponseBody } from "@src/models/user.model";

test.describe("Auth /api/v1/auth/login API contract", () => {
  test(
    "login response matches OpenAPI contract",
    { tag: ["@api", "@contract"] },
    async ({ request }) => {
      // Arrange
      const authRequest = new AuthRequest(request);

      // Act
      const response = await authRequest.login(
        demoUser.email,
        demoUser.password,
      );

      // Assert — status code
      expectResponseStatus(response, 200, "Login API response");

      const body = (await response.json()) as ApiLoginResponseBody;

      // Assert — OpenAPI schema
      await expectResponseMatchesOpenApi({
        request,
        body,
        path: routes.api.login,
        method: "post",
        statusCode: 200,
        context: "Login API response",
      });

      // Assert — business fields
      expect(
        body.success,
        `expected login response success to be true, and received ${body.success}`,
      ).toBe(true);

      expect(
        body.data.user.email,
        `expected authenticated user email to be ${demoUser.email}, and received ${body.data.user.email}`,
      ).toBe(demoUser.email);

      expect(
        body.data.token,
        "expected login response to contain token",
      ).toBeTruthy();
    },
  );
});
