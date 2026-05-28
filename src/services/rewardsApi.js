import mockTransactions from "../data/mockTransactions";

export async function fetchTransactions() {
  const clonedTransactions = mockTransactions.map((transaction) => ({
    ...transaction,
  }));

  return clonedTransactions;
}
