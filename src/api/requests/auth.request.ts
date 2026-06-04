import type { APIRequestContext, APIResponse } from "@playwright/test";
import { API_BASE_URL } from "@config/env.config";
import { routes } from "@src/routes/routes";
import type { ApiLoginResponseBody } from "@src/models/user.model";

export class AuthRequest {
  constructor(private readonly request: APIRequestContext) {}

  async login(email: string, password: string): Promise<APIResponse> {
    return this.request.post(`${API_BASE_URL}${routes.api.login}`, {
      data: {
        email,
        password,
      },
    });
  }

  async getToken(email: string, password: string): Promise<string> {
    const response = await this.login(email, password);

    if (!response.ok()) {
      throw new Error(
        `Authentication failed with status ${response.status()} — cannot proceed with test arrange`,
      );
    }

    const body = (await response.json()) as ApiLoginResponseBody;

    return body.data.token;
  }
}
