const User = require("../models/User/user");
const WalletLedger = require("../models/Wallet/walletLedger");

const roundCurrency = (value) =>
  Math.round(Math.max(0, Number(value) || 0) * 100) / 100;

const toSignedAmount = (type, amount) => {
  const normalizedAmount = roundCurrency(amount);
  if (type === "credit") return normalizedAmount;
  if (type === "debit") return -normalizedAmount;
  return 0;
};

const addWalletActivity = async ({
  userId,
  type,
  amount,
  sourceType,
  sourceId,
  note,
  balanceAfter,
  dedupe = false,
}) => {
  const normalizedAmount = roundCurrency(amount);
  if (!userId || normalizedAmount <= 0 || !["credit", "debit"].includes(type)) {
    return { changed: false };
  }

  const signedAmount = toSignedAmount(type, normalizedAmount);
  if (dedupe && sourceType && sourceId) {
    const existing = await WalletLedger.findOne({
      user: userId,
      type,
      sourceType,
      sourceId,
      amount: signedAmount,
    }).select("_id");
    if (existing) {
      return { changed: false };
    }
  }

  const user = await User.findById(userId).select("walletBalance");
  const resolvedBalanceAfter = Number.isFinite(Number(balanceAfter))
    ? roundCurrency(Number(balanceAfter))
    : roundCurrency(user?.walletBalance || 0);

  await WalletLedger.create({
    user: userId,
    type,
    amount: signedAmount,
    balanceAfter: resolvedBalanceAfter,
    sourceType: sourceType || "",
    sourceId,
    note: note || "",
  });

  return { changed: true };
};

const createWalletEntry = async ({
  userId,
  type,
  amount,
  sourceType,
  sourceId,
  note,
  dedupe = false,
}) => {
  const normalizedAmount = roundCurrency(amount);
  if (!userId || normalizedAmount <= 0 || !["credit", "debit"].includes(type)) {
    return {
      changed: false,
      amount: 0,
      balanceAfter: 0,
    };
  }

  if (dedupe && sourceType && sourceId) {
    const existing = await WalletLedger.findOne({
      user: userId,
      type,
      sourceType,
      sourceId,
      amount: toSignedAmount(type, normalizedAmount),
    }).select("_id");
    if (existing) {
      const user = await User.findById(userId).select("walletBalance");
      return {
        changed: false,
        amount: 0,
        balanceAfter: roundCurrency(user?.walletBalance || 0),
      };
    }
  }

  const user = await User.findById(userId).select("walletBalance");
  if (!user) {
    return {
      changed: false,
      amount: 0,
      balanceAfter: 0,
    };
  }

  const currentBalance = roundCurrency(user.walletBalance || 0);
  if (type === "debit" && currentBalance <= 0) {
    return {
      changed: false,
      amount: 0,
      balanceAfter: currentBalance,
    };
  }

  const usableAmount =
    type === "debit"
      ? Math.min(currentBalance, normalizedAmount)
      : normalizedAmount;

  if (usableAmount <= 0) {
    return {
      changed: false,
      amount: 0,
      balanceAfter: currentBalance,
    };
  }

  const nextBalance =
    type === "debit"
      ? roundCurrency(currentBalance - usableAmount)
      : roundCurrency(currentBalance + usableAmount);

  user.walletBalance = nextBalance;
  await user.save();

  await WalletLedger.create({
    user: userId,
    type,
    amount: toSignedAmount(type, usableAmount),
    balanceAfter: nextBalance,
    sourceType: sourceType || "",
    sourceId,
    note: note || "",
  });

  return {
    changed: true,
    amount: usableAmount,
    balanceAfter: nextBalance,
  };
};

const creditWallet = async ({
  userId,
  amount,
  sourceType,
  sourceId,
  note,
  dedupe = false,
}) =>
  createWalletEntry({
    userId,
    type: "credit",
    amount,
    sourceType,
    sourceId,
    note,
    dedupe,
  });

const debitWallet = async ({
  userId,
  amount,
  sourceType,
  sourceId,
  note,
  dedupe = false,
}) =>
  createWalletEntry({
    userId,
    type: "debit",
    amount,
    sourceType,
    sourceId,
    note,
    dedupe,
  });

const getPeriodRange = (period = "all") => {
  const now = new Date();
  const start = new Date(now);

  switch (String(period || "all").toLowerCase()) {
    case "today":
      start.setHours(0, 0, 0, 0);
      return { start, end: now, period: "today" };
    case "week": {
      const day = now.getDay();
      const diff = day === 0 ? 6 : day - 1; // Monday start
      start.setDate(now.getDate() - diff);
      start.setHours(0, 0, 0, 0);
      return { start, end: now, period: "week" };
    }
    case "month":
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      return { start, end: now, period: "month" };
    case "year":
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      return { start, end: now, period: "year" };
    default:
      return { start: null, end: now, period: "all" };
  }
};

module.exports = {
  roundCurrency,
  creditWallet,
  debitWallet,
  addWalletActivity,
  getPeriodRange,
};
