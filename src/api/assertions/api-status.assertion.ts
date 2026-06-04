import { expect, type APIResponse } from "@playwright/test";

export function expectResponseStatus(
  response: APIResponse,
  expectedStatus: number,
  context: string,
): void {
  expect(
    response.status(),
    `${context}: expected status ${expectedStatus}, received ${response.status()}`,
  ).toBe(expectedStatus);
}
