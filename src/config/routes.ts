export const routes = {
  pages: {
    login: "/login.html",
    profile: "/profile.html",
    marketplace: "/marketplace.html",
  },
  api: {
    login: "/login",
    marketplaceOffers: "/api/v1/marketplace/offers",
    marketplaceBuy: "/api/v1/marketplace/buy",
    financialAccount: "/api/v1/financial/account",
  },
} as const;
