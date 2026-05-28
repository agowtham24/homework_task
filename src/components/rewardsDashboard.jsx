import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import RewardsSection from "@/components/RewardsSection";
import { fetchTransactions } from "@/services/rewardsApi";
import {
  calculateMonthlyRewards,
  calculateTotalRewards,
  enrichTransactions,
  sortTransactionsByDate,
} from "../lib/utils";

const monthlyColumns = [
  { header: "Customer ID", accessor: "customerId" },
  { header: "Name", accessor: "name" },
  { header: "Month", accessor: "month" },
  { header: "Year", accessor: "year" },
  {
    header: "Reward Points",
    accessor: "rewardPoints",
    cellClassName: "font-semibold",
  },
];

const totalColumns = [
  { header: "Customer Name", accessor: "name" },
  {
    header: "Reward Points",
    accessor: "rewardPoints",
    cellClassName: "font-semibold",
  },
];

const transactionColumns = [
  { header: "Transaction ID", accessor: "transactionId" },
  { header: "Customer Name", accessor: "customerName" },
  { header: "Purchase Date", accessor: "formattedPurchaseDate" },
  { header: "Product Purchased", accessor: "productPurchased" },
  { header: "Price", accessor: "formattedPrice" },
  {
    header: "Reward Points",
    accessor: "rewardPoints",
    cellClassName: "font-semibold",
  },
];

function RewardsDashboard() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [monthlySearch, setMonthlySearch] = useState("");
  const [totalSearch, setTotalSearch] = useState("");
  const [transactionSearch, setTransactionSearch] = useState("");

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await fetchTransactions();
      setTransactions(data);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Unable to load transaction data.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isActive = true;

    const loadInitialData = async () => {
      try {
        const data = await fetchTransactions();

        if (!isActive) {
          return;
        }

        setTransactions(data);
      } catch (fetchError) {
        if (!isActive) {
          return;
        }

        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Unable to load transaction data.",
        );
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadInitialData();

    return () => {
      isActive = false;
    };
  }, []);

  const sortedTransactions = useMemo(
    () => sortTransactionsByDate(transactions),
    [transactions],
  );

  const monthlyRewards = useMemo(
    () => calculateMonthlyRewards(sortedTransactions),
    [sortedTransactions],
  );

  const totalRewards = useMemo(
    () => calculateTotalRewards(sortedTransactions),
    [sortedTransactions],
  );

  const transactionRows = useMemo(
    () => enrichTransactions(sortedTransactions),
    [sortedTransactions],
  );

  const filteredMonthlyRewards = useMemo(() => {
    const query = monthlySearch.trim().toLowerCase();

    if (!query) {
      return monthlyRewards;
    }

    return monthlyRewards.filter((reward) =>
      [reward.customerId, reward.name, reward.month, String(reward.year)].some(
        (value) => String(value).toLowerCase().includes(query),
      ),
    );
  }, [monthlyRewards, monthlySearch]);

  const filteredTotalRewards = useMemo(() => {
    const query = totalSearch.trim().toLowerCase();

    if (!query) {
      return totalRewards;
    }

    return totalRewards.filter((reward) =>
      [reward.customerId, reward.name].some((value) =>
        String(value).toLowerCase().includes(query),
      ),
    );
  }, [totalRewards, totalSearch]);

  const filteredTransactions = useMemo(() => {
    const query = transactionSearch.trim().toLowerCase();

    if (!query) {
      return transactionRows;
    }

    return transactionRows.filter((transaction) =>
      [
        transaction.transactionId,
        transaction.customerId,
        transaction.customerName,
        transaction.productPurchased,
        transaction.formattedPurchaseDate,
        transaction.formattedPrice,
      ].some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [transactionRows, transactionSearch]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Customer Rewards Dashboard
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-600">
              Reward calculation by month, year, and customer using pure helper
              functions.
            </p>
          </div>

          <Button onClick={loadTransactions} disabled={loading}>
            {loading ? "Loading..." : "Reload Data"}
          </Button>
        </div>

        {error ? (
          <Card className="mb-6 border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">
                Something went wrong
              </CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={loadTransactions}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {!loading && !error && transactions.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No data available</CardTitle>
              <CardDescription>
                The dataset returned no transactions.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : null}

        {transactions.length > 0 || loading ? (
          <div className="space-y-6">
            <RewardsSection
              title="User Monthly Rewards"
              description="Grouped by customer, month, and year."
              columns={monthlyColumns}
              rows={filteredMonthlyRewards}
              loading={loading}
              getRowKey={(row) =>
                `${row.customerId}-${row.year}-${row.monthIndex}`
              }
              searchValue={monthlySearch}
              onSearchChange={(event) => setMonthlySearch(event.target.value)}
              searchPlaceholder="Search monthly rewards..."
            />

            <RewardsSection
              title="Total Rewards"
              description="Total reward points accumulated by each customer."
              columns={totalColumns}
              rows={filteredTotalRewards}
              loading={loading}
              getRowKey={(row) => row.customerId}
              searchValue={totalSearch}
              onSearchChange={(event) => setTotalSearch(event.target.value)}
              searchPlaceholder="Search customers..."
            />

            <RewardsSection
              title="Transactions"
              description="Each purchase with its reward points."
              columns={transactionColumns}
              rows={filteredTransactions}
              loading={loading}
              getRowKey={(row) => row.transactionId}
              searchValue={transactionSearch}
              onSearchChange={(event) => setTransactionSearch(event.target.value)}
              searchPlaceholder="Search transactions..."
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default RewardsDashboard;