const { roundCurrency } = require("./wallet");

const PAYOUT_STATUSES = [
  "pending",
  "approved",
  "processing",
  "disbursed",
  "rejected",
  "cancelled",
];

const RESERVED_PAYOUT_STATUSES = ["pending", "approved", "processing"];

const BANK_DETAILS_FIELDS = [
  "accountHolderName",
  "bankName",
  "accountNumber",
  "ifscCode",
  "branchName",
  "upiId",
];

const readMoneyLimit = (value, fallback) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.round(parsed * 100) / 100;
};

const readOptionalMoneyLimit = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return Math.round(parsed * 100) / 100;
};

const readPercent = (value, fallback) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(100, Math.max(0, Math.round(parsed * 100) / 100));
};

const MIN_PAYOUT_AMOUNT = readMoneyLimit(process.env.MIN_PAYOUT_AMOUNT, 100);
const MAX_PAYOUT_AMOUNT = readOptionalMoneyLimit(process.env.MAX_PAYOUT_AMOUNT);
const PAYOUT_PLATFORM_FEE_PERCENT = 3;

const sanitizeText = (value, fallback = "") =>
  String(value ?? fallback).trim();

const sanitizeBankDetails = (details = {}) => ({
  accountHolderName: sanitizeText(details.accountHolderName),
  bankName: sanitizeText(details.bankName),
  accountNumber: sanitizeText(details.accountNumber).replace(/\s+/g, ""),
  ifscCode: sanitizeText(details.ifscCode).toUpperCase(),
  branchName: sanitizeText(details.branchName),
  upiId: sanitizeText(details.upiId).toLowerCase(),
});

const maskAccountNumber = (accountNumber) => {
  const clean = sanitizeText(accountNumber).replace(/\s+/g, "");
  if (!clean) return "";
  if (clean.length <= 4) return clean;
  return `${"*".repeat(clean.length - 4)}${clean.slice(-4)}`;
};

const validateBankDetails = (payload = {}) => {
  const {
    accountHolderName,
    bankName,
    accountNumber,
    ifscCode,
    upiId,
    branchName,
    confirmAccountNumber,
  } = payload;

  const errors = [];
  const normalized = sanitizeBankDetails({
    accountHolderName,
    bankName,
    accountNumber,
    ifscCode,
    upiId,
    branchName,
  });

  if (!normalized.accountHolderName || normalized.accountHolderName.length < 2) {
    errors.push("Account holder name must be at least 2 characters");
  } else if (normalized.accountHolderName.length > 80) {
    errors.push("Account holder name cannot exceed 80 characters");
  } else if (!/^[a-zA-Z.\s'-]+$/.test(normalized.accountHolderName)) {
    errors.push("Account holder name can contain letters, space, apostrophe, dot and hyphen only");
  }

  if (!normalized.bankName || normalized.bankName.length < 2) {
    errors.push("Bank name must be at least 2 characters");
  } else if (normalized.bankName.length > 80) {
    errors.push("Bank name cannot exceed 80 characters");
  } else if (!/^[a-zA-Z0-9.&\s'-]+$/.test(normalized.bankName)) {
    errors.push("Bank name contains invalid characters");
  }

  if (!/^\d{9,18}$/.test(normalized.accountNumber)) {
    errors.push("Account number must be 9 to 18 digits");
  }

  if (confirmAccountNumber !== undefined) {
    const cleanConfirm = sanitizeText(confirmAccountNumber).replace(/\s+/g, "");
    if (cleanConfirm !== normalized.accountNumber) {
      errors.push("Account number and confirm account number do not match");
    }
  }

  if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(normalized.ifscCode)) {
    errors.push("Invalid IFSC code format");
  }

  if (normalized.branchName.length > 80) {
    errors.push("Branch name cannot exceed 80 characters");
  }

  if (
    normalized.upiId &&
    !/^[a-zA-Z0-9.\-_]{2,}@[a-zA-Z]{2,}$/.test(normalized.upiId)
  ) {
    errors.push("Invalid UPI ID format");
  }

  return {
    isValid: errors.length === 0,
    errors,
    bankDetails: normalized,
  };
};

const sanitizeBankDetailsForResponse = (details = {}) => {
  const normalized = sanitizeBankDetails(details);
  const hasBankDetails = BANK_DETAILS_FIELDS.every((field) =>
    Boolean(normalized[field] || field === "branchName" || field === "upiId"),
  );

  return {
    hasBankDetails:
      hasBankDetails &&
      Boolean(normalized.accountHolderName) &&
      Boolean(normalized.bankName) &&
      Boolean(normalized.accountNumber) &&
      Boolean(normalized.ifscCode),
    bankDetails: {
      accountHolderName: normalized.accountHolderName,
      bankName: normalized.bankName,
      accountNumberMasked: maskAccountNumber(normalized.accountNumber),
      ifscCode: normalized.ifscCode,
      branchName: normalized.branchName,
      upiId: normalized.upiId,
    },
  };
};

const toMoney = (value) =>
  Math.round(Math.max(0, Number(value) || 0) * 100) / 100;

const getPayoutFeeBreakdown = (
  amount,
  platformFeePercent = PAYOUT_PLATFORM_FEE_PERCENT,
) => {
  const grossAmount = toMoney(amount);
  const safePercent = readPercent(platformFeePercent, PAYOUT_PLATFORM_FEE_PERCENT);
  const platformFeeAmount = roundCurrency((grossAmount * safePercent) / 100);
  const netAmount = roundCurrency(Math.max(0, grossAmount - platformFeeAmount));

  return {
    grossAmount,
    platformFeePercent: safePercent,
    platformFeeAmount,
    netAmount,
  };
};

const summarizePayoutRows = (rows = []) => {
  let pendingAmount = 0;
  let approvedAmount = 0;
  let processingAmount = 0;
  let disbursedAmount = 0;
  let rejectedAmount = 0;
  let cancelledAmount = 0;
  let totalRequested = 0;
  let totalPlatformFee = 0;
  let totalNetAmount = 0;

  for (const row of rows) {
    const amount = toMoney(row?.amount);
    const status = String(row?.status || "").toLowerCase();
    const breakdown = getPayoutFeeBreakdown(
      amount,
      Number(row?.platformFeePercent || PAYOUT_PLATFORM_FEE_PERCENT),
    );
    const platformFeeAmount = roundCurrency(
      Number(row?.platformFeeAmount ?? breakdown.platformFeeAmount) || 0,
    );
    const netAmount = roundCurrency(
      Number(row?.netAmount ?? (amount - platformFeeAmount)) || 0,
    );

    totalRequested += amount;
    totalPlatformFee += platformFeeAmount;
    totalNetAmount += netAmount;

    if (status === "pending") pendingAmount += amount;
    if (status === "approved") approvedAmount += amount;
    if (status === "processing") processingAmount += amount;
    if (status === "disbursed") disbursedAmount += amount;
    if (status === "rejected") rejectedAmount += amount;
    if (status === "cancelled") cancelledAmount += amount;
  }

  const reservedAmount = roundCurrency(
    pendingAmount + approvedAmount + processingAmount,
  );

  return {
    totalRequested: roundCurrency(totalRequested),
    totalPlatformFee: roundCurrency(totalPlatformFee),
    totalNetAmount: roundCurrency(totalNetAmount),
    pendingAmount: roundCurrency(pendingAmount),
    approvedAmount: roundCurrency(approvedAmount),
    processingAmount: roundCurrency(processingAmount),
    reservedAmount,
    disbursedAmount: roundCurrency(disbursedAmount),
    rejectedAmount: roundCurrency(rejectedAmount),
    cancelledAmount: roundCurrency(cancelledAmount),
  };
};

const isValidPayoutStatus = (status) =>
  PAYOUT_STATUSES.includes(String(status || "").toLowerCase());

const isWeekendDay = (value = new Date()) => {
  const date = new Date(value);
  const day = date.getDay();
  return day === 0 || day === 6;
};

const nextBusinessDay = (value = new Date()) => {
  const date = new Date(value);
  do {
    date.setDate(date.getDate() + 1);
  } while (isWeekendDay(date));
  return date;
};

const toBusinessEtaText = (fromDate = new Date()) => {
  const start = new Date(fromDate);
  const first = nextBusinessDay(start);
  const second = nextBusinessDay(first);
  const formatter = new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
  });
  return `${formatter.format(first)} to ${formatter.format(second)} (1-2 business days)`;
};

module.exports = {
  PAYOUT_STATUSES,
  RESERVED_PAYOUT_STATUSES,
  MIN_PAYOUT_AMOUNT,
  MAX_PAYOUT_AMOUNT,
  PAYOUT_PLATFORM_FEE_PERCENT,
  getPayoutFeeBreakdown,
  sanitizeBankDetails,
  validateBankDetails,
  sanitizeBankDetailsForResponse,
  maskAccountNumber,
  summarizePayoutRows,
  isValidPayoutStatus,
  isWeekendDay,
  nextBusinessDay,
  toBusinessEtaText,
};
