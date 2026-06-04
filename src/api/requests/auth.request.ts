import type { APIRequestContext, APIResponse } from "@playwright/test";
import { API_BASE_URL } from "@config/env.config";
import { routes } from "@src/config/routes";

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
}
