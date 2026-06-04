export type MarketplaceItemType = "field" | "animal";

export type CreateOfferPayload = {
  itemType: MarketplaceItemType;
  itemId: number;
  price: number;
  description?: string;
};

export type ApiCreateOfferResponseBody = {
  success: boolean;
  data: {
    offer: {
      id: number;
      itemType: MarketplaceItemType;
      itemId: number;
      price: number;
      description?: string;
    };
    message?: string;
  };
};

export type SellableItem = {
  itemType: MarketplaceItemType;
  itemId: number;
};
