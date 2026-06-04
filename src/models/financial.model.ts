export type TransactionType = "income" | "expense";

export type AddTransactionPayload = {
  type: TransactionType;
  amount: number;
  description: string;
  category?: string;
  cardNumber?: string;
  cvv?: string;
};

export type ApiFinancialTransactionResponseBody = {
  success: boolean;
  data: {
    transaction: {
      id: number;
      type: TransactionType;
      amount: number;
      description: string;
      category: string;
    };
  };
};
