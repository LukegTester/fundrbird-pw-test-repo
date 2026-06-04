import type { APIResponse } from "@playwright/test";
import type { MarketplaceRequest } from "@src/api/requests/marketplace.request";
import type {
  CreateOfferPayload,
  MarketplaceItemType,
  SellableItem,
} from "@src/models/marketplace.model";

type ItemListResponse = {
  success?: boolean;
  data?: {
    fields?: Array<{ id?: number; fieldId?: number }>;
    animals?: Array<{ id?: number; animalId?: number }>;
  };
};

export type CreateOfferWithSellableItemResult = {
  response: APIResponse;
  sellableItem: SellableItem;
};

function extractItemIds(
  items: Array<{ id?: number; fieldId?: number; animalId?: number }>,
): number[] {
  return items
    .map((item) => item.id ?? item.fieldId ?? item.animalId)
    .filter((id): id is number => typeof id === "number");
}

function isCreateOfferSuccessStatus(status: number): boolean {
  return status === 200 || status === 201;
}

async function tryCreateOffer(
  marketplaceRequest: MarketplaceRequest,
  token: string,
  itemType: MarketplaceItemType,
  itemIds: number[],
  offerDetails: Omit<CreateOfferPayload, "itemType" | "itemId">,
): Promise<CreateOfferWithSellableItemResult | null> {
  for (const itemId of itemIds) {
    const response = await marketplaceRequest.createOffer(token, {
      itemType,
      itemId,
      ...offerDetails,
    });

    if (isCreateOfferSuccessStatus(response.status())) {
      return {
        response,
        sellableItem: { itemType, itemId },
      };
    }
  }

  return null;
}

async function parseItemIds(response: APIResponse): Promise<number[]> {
  const body = (await response.json()) as ItemListResponse;
  const data = body.data;

  if (!data) {
    return [];
  }

  if (Array.isArray(data)) {
    return extractItemIds(data);
  }

  if (data.fields && data.fields.length > 0) {
    return extractItemIds(data.fields);
  }

  if (data.animals && data.animals.length > 0) {
    return extractItemIds(data.animals);
  }

  const record = data as Record<
    string,
    { id?: number; fieldId?: number; animalId?: number }
  >;

  return extractItemIds(Object.values(record));
}

type MyOffersResponse = {
  data?: {
    offers?: Array<{ id: number; status?: string }>;
  };
};

export async function cancelActiveMyOffers(
  marketplaceRequest: MarketplaceRequest,
  token: string,
): Promise<void> {
  const myOffersResponse = await marketplaceRequest.getMyOffers(token);

  if (!myOffersResponse.ok()) {
    return;
  }

  const body = (await myOffersResponse.json()) as MyOffersResponse;
  const offers = body.data?.offers ?? [];

  for (const offer of offers) {
    if (offer.status !== "active") {
      continue;
    }

    const cancelResponse = await marketplaceRequest.cancelOffer(
      token,
      offer.id,
    );

    if (!cancelResponse.ok() && cancelResponse.status() !== 400) {
      continue;
    }
  }
}

export async function createOfferWithSellableItem(
  marketplaceRequest: MarketplaceRequest,
  token: string,
  offerDetails: Omit<CreateOfferPayload, "itemType" | "itemId">,
): Promise<CreateOfferWithSellableItemResult> {
  await cancelActiveMyOffers(marketplaceRequest, token);

  const fieldsResponse = await marketplaceRequest.getFields(token);
  const fieldIds = await parseItemIds(fieldsResponse);

  const fieldResult = await tryCreateOffer(
    marketplaceRequest,
    token,
    "field",
    fieldIds,
    offerDetails,
  );

  if (fieldResult) {
    return fieldResult;
  }

  const animalsResponse = await marketplaceRequest.getAnimals(token);
  const animalIds = await parseItemIds(animalsResponse);

  const animalResult = await tryCreateOffer(
    marketplaceRequest,
    token,
    "animal",
    animalIds,
    offerDetails,
  );

  if (animalResult) {
    return animalResult;
  }

  throw new Error(
    "No sellable field or animal found for marketplace offer creation",
  );
}
