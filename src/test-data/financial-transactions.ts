import type { AddTransactionPayload } from "@src/models/financial.model";

export const incomeTransactionPayload: AddTransactionPayload = {
  type: "income",
  amount: 10_000,
  description: "Playwright E2E income funding",
  category: "general",
  cardNumber: "4242424242424242",
  cvv: "123",
};
