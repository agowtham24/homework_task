import { render, screen } from "@testing-library/react";
import RewardsDashboard from "@/components/RewardsDashboard";
import { fetchTransactions } from "@/services/rewardsApi";

jest.mock("@/services/rewardsApi", () => ({
  fetchTransactions: jest.fn(),
}));

describe("RewardsDashboard", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("shows loading state initially", () => {
    fetchTransactions.mockImplementation(() => new Promise(() => {}));

    render(<RewardsDashboard />);

    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });

  test("shows error state when fetch fails", async () => {
    fetchTransactions.mockRejectedValueOnce(
      new Error("Failed to load data"),
    );

    render(<RewardsDashboard />);

    expect(
      await screen.findByText(/Failed to load data/i),
    ).toBeInTheDocument();
  });

  test("shows empty state when no data is returned", async () => {
    fetchTransactions.mockResolvedValueOnce([]);

    render(<RewardsDashboard />);

    expect(
      await screen.findByText(/No data available/i),
    ).toBeInTheDocument();
  });

  test("shows tables when data is returned", async () => {
    fetchTransactions.mockResolvedValueOnce([
      {
        transactionId: "TXN-1",
        customerId: "C001",
        customerName: "John Doe",
        purchaseDate: "2024-01-05",
        productPurchased: "Backpack",
        price: 60,
      },
    ]);

    render(<RewardsDashboard />);

    expect(
      await screen.findByText(/User Monthly Rewards/i),
    ).toBeInTheDocument();

    expect(
      await screen.findByText(/Total Rewards/i),
    ).toBeInTheDocument();

    expect(
      await screen.findByText(/Transactions/i),
    ).toBeInTheDocument();

    const customerEntries = await screen.findAllByText(/John Doe/i);

    expect(customerEntries.length).toBeGreaterThan(0);
  });
});