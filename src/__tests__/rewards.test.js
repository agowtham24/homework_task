import {
  calculateRewardPoints,
  calculateMonthlyRewards,
  calculateTotalRewards,
  enrichTransactions,
  sortTransactionsByDate,
  formatCurrency,
  formatDisplayDate,
} from "@/lib/utils";

describe("calculateRewardPoints", () => {
  test("returns 0 for amounts below or equal to 50", () => {
    expect(calculateRewardPoints(0)).toBe(0);
    expect(calculateRewardPoints(49.99)).toBe(0);
    expect(calculateRewardPoints(50)).toBe(0);
  });

  test("returns 1 point per dollar between 50 and 100", () => {
    expect(calculateRewardPoints(51)).toBe(1);
    expect(calculateRewardPoints(75)).toBe(25);
    expect(calculateRewardPoints(100)).toBe(50);
  });

  test("handles decimals correctly", () => {
    expect(calculateRewardPoints(100.2)).toBe(50);
    expect(calculateRewardPoints(100.4)).toBe(50);
    expect(calculateRewardPoints(120.9)).toBe(90);
  });

  test("returns correct points above 100", () => {
    expect(calculateRewardPoints(101)).toBe(52);
    expect(calculateRewardPoints(120)).toBe(90);
    expect(calculateRewardPoints(130)).toBe(110);
  });

  test("returns 0 for invalid input", () => {
    expect(calculateRewardPoints(undefined)).toBe(0);
    expect(calculateRewardPoints(null)).toBe(0);
    expect(calculateRewardPoints("abc")).toBe(0);
  });
});

describe("format helpers", () => {
  test("formats currency", () => {
    expect(formatCurrency(120.4)).toBe("$120.40");
  });

  test("formats display date", () => {
    expect(formatDisplayDate("2024-01-05")).toMatch(/Jan/i);
    expect(formatDisplayDate("2024-01-05")).toMatch(/05/i);
    expect(formatDisplayDate("2024-01-05")).toMatch(/2024/i);
  });
});

describe("sortTransactionsByDate", () => {
  test("sorts by purchase date ascending", () => {
    const transactions = [
      {
        transactionId: "TXN-3",
        purchaseDate: "2024-02-10",
      },
      {
        transactionId: "TXN-1",
        purchaseDate: "2023-12-15",
      },
      {
        transactionId: "TXN-2",
        purchaseDate: "2024-01-05",
      },
    ];

    const sorted = sortTransactionsByDate(transactions);

    expect(sorted.map((item) => item.transactionId)).toEqual([
      "TXN-1",
      "TXN-2",
      "TXN-3",
    ]);
  });
});

describe("calculateMonthlyRewards", () => {
  const transactions = [
    {
      transactionId: "TXN-1",
      customerId: "C001",
      customerName: "John Doe",
      purchaseDate: "2023-12-15",
      price: 120,
    },
    {
      transactionId: "TXN-2",
      customerId: "C001",
      customerName: "John Doe",
      purchaseDate: "2024-01-05",
      price: 60,
    },
    {
      transactionId: "TXN-3",
      customerId: "C001",
      customerName: "John Doe",
      purchaseDate: "2024-02-10",
      price: 99.9,
    },
    {
      transactionId: "TXN-4",
      customerId: "C002",
      customerName: "Jane Smith",
      purchaseDate: "2024-01-11",
      price: 101.2,
    },
  ];

  test("groups by customer, month, and year", () => {
    const result = calculateMonthlyRewards(transactions);

    expect(result).toEqual([
      {
        customerId: "C001",
        name: "John Doe",
        month: "December",
        monthIndex: 11,
        year: 2023,
        rewardPoints: 90,
      },
      {
        customerId: "C002",
        name: "Jane Smith",
        month: "January",
        monthIndex: 0,
        year: 2024,
        rewardPoints: 52,
      },
      {
        customerId: "C001",
        name: "John Doe",
        month: "January",
        monthIndex: 0,
        year: 2024,
        rewardPoints: 10,
      },
      {
        customerId: "C001",
        name: "John Doe",
        month: "February",
        monthIndex: 1,
        year: 2024,
        rewardPoints: 49,
      },
    ]);
  });
});

describe("calculateTotalRewards", () => {
  const transactions = [
    {
      transactionId: "TXN-1",
      customerId: "C001",
      customerName: "John Doe",
      purchaseDate: "2023-12-15",
      price: 120,
    },
    {
      transactionId: "TXN-2",
      customerId: "C001",
      customerName: "John Doe",
      purchaseDate: "2024-01-05",
      price: 60,
    },
    {
      transactionId: "TXN-3",
      customerId: "C002",
      customerName: "Jane Smith",
      purchaseDate: "2024-01-11",
      price: 101.2,
    },
  ];

  test("returns totals per customer", () => {
    const result = calculateTotalRewards(transactions);

    expect(result).toEqual([
      {
        customerId: "C002",
        name: "Jane Smith",
        rewardPoints: 52,
      },
      {
        customerId: "C001",
        name: "John Doe",
        rewardPoints: 100,
      },
    ]);
  });
});

describe("enrichTransactions", () => {
  test("adds reward points and formatted fields", () => {
    const result = enrichTransactions([
      {
        transactionId: "TXN-1",
        customerId: "C001",
        customerName: "John Doe",
        purchaseDate: "2024-01-05",
        productPurchased: "Backpack",
        price: 60,
      },
    ]);

    expect(result).toEqual([
      {
        transactionId: "TXN-1",
        customerId: "C001",
        customerName: "John Doe",
        purchaseDate: "2024-01-05",
        productPurchased: "Backpack",
        price: 60,
        rewardPoints: 10,
        formattedPurchaseDate: expect.any(String),
        formattedPrice: "$60.00",
      },
    ]);
  });
});