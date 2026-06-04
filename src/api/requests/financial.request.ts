import type { APIRequestContext, APIResponse } from "@playwright/test";
import { API_BASE_URL } from "@config/env.config";
import { routes } from "@src/config/routes";
import type { AddTransactionPayload } from "@src/models/financial.model";

export class FinancialRequest {
  constructor(private readonly request: APIRequestContext) {}

  async addTransaction(
    token: string,
    payload: AddTransactionPayload,
  ): Promise<APIResponse> {
    return this.request.post(
      `${API_BASE_URL}${routes.api.financialTransactions}`,
      {
        headers: { token },
        data: payload,
      },
    );
  }
}
