export const routes = {
  pages: {
    login: "/login.html",
    profile: "/profile.html",
    marketplace: "/marketplace.html",
  },
  api: {
    login: "/login",
    fields: "/fields",
    animals: "/animals",
    marketplaceOffers: "/marketplace/offers",
    marketplaceMyOffers: "/marketplace/my-offers",
    marketplaceOfferById: (offerId: number): string =>
      `/marketplace/offers/${offerId}`,
    marketplaceBuy: "/marketplace/buy",
    financialAccount: "/financial/account",
    financialTransactions: "/financial/transactions",
  },
} as const;
