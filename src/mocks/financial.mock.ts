export const financialAccountZeroBalance = {
  status: 200,
  body: {
    success: true,
    data: { balance: 0, currency: "USD" },
  },
} as const;
