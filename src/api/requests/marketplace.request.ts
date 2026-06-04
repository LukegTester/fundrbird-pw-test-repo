import type { APIRequestContext, APIResponse } from "@playwright/test";
import { API_BASE_URL } from "@config/env.config";
import { routes } from "@src/routes/routes";
import type { CreateOfferPayload } from "@src/models/marketplace.model";

export class MarketplaceRequest {
  constructor(private readonly request: APIRequestContext) {}

  async getFields(token: string): Promise<APIResponse> {
    return this.request.get(`${API_BASE_URL}${routes.api.fields}`, {
      headers: { token },
    });
  }

  async getAnimals(token: string): Promise<APIResponse> {
    return this.request.get(`${API_BASE_URL}${routes.api.animals}`, {
      headers: { token },
    });
  }

  async getMyOffers(token: string): Promise<APIResponse> {
    return this.request.get(
      `${API_BASE_URL}${routes.api.marketplaceMyOffers}`,
      {
        headers: { token },
      },
    );
  }

  async cancelOffer(token: string, offerId: number): Promise<APIResponse> {
    return this.request.delete(
      `${API_BASE_URL}${routes.api.marketplaceOfferById(offerId)}`,
      {
        headers: { token },
      },
    );
  }

  async createOffer(
    token: string,
    payload: CreateOfferPayload,
  ): Promise<APIResponse> {
    return this.request.post(`${API_BASE_URL}${routes.api.marketplaceOffers}`, {
      headers: { token },
      data: payload,
    });
  }
}
