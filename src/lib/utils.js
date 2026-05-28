import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function calculateRewardPoints(amount) {
  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount) || numericAmount <= 50) {
    return 0;
  }

  const wholeDollars = Math.floor(numericAmount);

  if (wholeDollars <= 100) {
    return wholeDollars - 50;
  }

  return (wholeDollars - 100) * 2 + 50;
}

function safeDate(dateValue) {
  const parsedDate = new Date(dateValue);
  return Number.isNaN(parsedDate.getTime()) ? new Date(0) : parsedDate;
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(amount) || 0);
}

export function formatDisplayDate(dateValue) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(safeDate(dateValue));
}

export function getDateParts(dateValue) {
  const date = safeDate(dateValue);

  return {
    date,
    year: date.getFullYear(),
    monthIndex: date.getMonth(),
    monthName: new Intl.DateTimeFormat("en-US", {
      month: "long",
    }).format(date),
  };
}

export function sortTransactionsByDate(transactions) {
  return [...transactions].sort((left, right) => {
    const dateDifference =
      safeDate(left.purchaseDate).getTime() -
      safeDate(right.purchaseDate).getTime();

    if (dateDifference !== 0) {
      return dateDifference;
    }

    return String(left.transactionId).localeCompare(
      String(right.transactionId),
    );
  });
}

export function enrichTransactions(transactions) {
  return sortTransactionsByDate(transactions).map((transaction) => ({
    ...transaction,
    rewardPoints: calculateRewardPoints(transaction.price),
    formattedPurchaseDate: formatDisplayDate(transaction.purchaseDate),
    formattedPrice: formatCurrency(transaction.price),
  }));
}

export function calculateMonthlyRewards(transactions) {
  const grouped = transactions.reduce((accumulator, transaction) => {
    const points = calculateRewardPoints(transaction.price);
    const { year, monthIndex, monthName } = getDateParts(
      transaction.purchaseDate,
    );
    const key = `${transaction.customerId}-${year}-${monthIndex}`;

    const currentEntry = accumulator[key] ?? {
      customerId: transaction.customerId,
      name: transaction.customerName,
      month: monthName,
      monthIndex,
      year,
      rewardPoints: 0,
    };

    return {
      ...accumulator,
      [key]: {
        ...currentEntry,
        rewardPoints: currentEntry.rewardPoints + points,
      },
    };
  }, {});

  return Object.values(grouped).sort((left, right) => {
    if (left.year !== right.year) {
      return left.year - right.year;
    }

    if (left.monthIndex !== right.monthIndex) {
      return left.monthIndex - right.monthIndex;
    }

    return String(left.name).localeCompare(String(right.name));
  });
}

export function calculateTotalRewards(transactions) {
  const grouped = transactions.reduce((accumulator, transaction) => {
    const points = calculateRewardPoints(transaction.price);
    const key = transaction.customerId;

    const currentEntry = accumulator[key] ?? {
      customerId: transaction.customerId,
      name: transaction.customerName,
      rewardPoints: 0,
    };

    return {
      ...accumulator,
      [key]: {
        ...currentEntry,
        rewardPoints: currentEntry.rewardPoints + points,
      },
    };
  }, {});

  return Object.values(grouped).sort((left, right) =>
    String(left.name).localeCompare(String(right.name)),
  );
}
