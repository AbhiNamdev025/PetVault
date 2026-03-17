const mongoose = require("mongoose");
const User = require("../../models/User/user");
const ProviderPayout = require("../../models/Payout/providerPayout");
const ProviderBankAccount = require("../../models/Payout/providerBankAccount");
const { roundCurrency, addWalletActivity } = require("../../utils/wallet");
const { getProviderEarningsSummary } = require("../../utils/providerEarnings");
const {
  sanitizeBankDetails,
  validateBankDetails,
  sanitizeBankDetailsForResponse,
  summarizePayoutRows,
  RESERVED_PAYOUT_STATUSES,
  isWeekendDay,
  toBusinessEtaText,
  MIN_PAYOUT_AMOUNT,
  MAX_PAYOUT_AMOUNT,
  PAYOUT_PLATFORM_FEE_PERCENT,
  getPayoutFeeBreakdown,
} = require("../../utils/payout");
const {
  sendNotification,
  sendAdminNotification,
} = require("../../utils/pushNotification");
const {
  sendPayoutRequestSubmittedEmail,
} = require("../../utils/emailService");

const MAX_ACTIVE_ACCOUNTS = 5;
const toMoney = (value) => roundCurrency(Math.max(0, Number(value) || 0));

const EMPTY_LEGACY_BANK_DETAILS = {
  accountHolderName: "",
  bankName: "",
  accountNumber: "",
  ifscCode: "",
  branchName: "",
  upiId: "",
};

const toAccountResponse = (account) => {
  if (!account) return null;
  const details = sanitizeBankDetailsForResponse(account).bankDetails;
  return {
    _id: account._id,
    nickname: account.nickname || "",
    accountHolderName: account.accountHolderName || "",
    bankName: account.bankName || "",
    accountNumberMasked: details.accountNumberMasked || "",
    ifscCode: account.ifscCode || "",
    branchName: account.branchName || "",
    upiId: account.upiId || "",
    isDefault: Boolean(account.isDefault),
    isActive: Boolean(account.isActive),
    createdAt: account.createdAt,
    updatedAt: account.updatedAt,
  };
};

const syncLegacyBankDetails = async (providerId, bankDetails) => {
  const normalized = sanitizeBankDetails(bankDetails || {});
  await User.findByIdAndUpdate(providerId, {
    bankDetails: {
      ...normalized,
      updatedAt: new Date(),
    },
  });
};

const clearLegacyBankDetails = async (providerId) => {
  await User.findByIdAndUpdate(providerId, {
    bankDetails: {
      ...EMPTY_LEGACY_BANK_DETAILS,
      updatedAt: new Date(),
    },
  });
};

const ensureLegacyBankAccount = async (providerId) => {
  const activeCount = await ProviderBankAccount.countDocuments({
    provider: providerId,
    isActive: true,
  });
  if (activeCount > 0) return;

  const user = await User.findById(providerId).select("bankDetails");
  if (!user?.bankDetails) return;

  const validation = validateBankDetails(user.bankDetails || {});
  if (!validation.isValid) return;

  await ProviderBankAccount.create({
    provider: providerId,
    nickname: "Primary Account",
    ...validation.bankDetails,
    isDefault: true,
    isActive: true,
  });
};

const getActiveAccounts = async (providerId) => {
  await ensureLegacyBankAccount(providerId);
  return ProviderBankAccount.find({
    provider: providerId,
    isActive: true,
  }).sort({ isDefault: -1, createdAt: -1 });
};

const getDefaultAccount = async (providerId) =>
  ProviderBankAccount.findOne({
    provider: providerId,
    isActive: true,
    isDefault: true,
  });

const getProviderPayoutStats = async (providerId) => {
  const rows = await ProviderPayout.find({ provider: providerId }).select(
    "amount status platformFeePercent platformFeeAmount netAmount",
  );
  const summary = summarizePayoutRows(rows);
  return {
    ...summary,
    reservedAmount: roundCurrency(summary.reservedAmount || 0),
    disbursedAmount: roundCurrency(summary.disbursedAmount || 0),
  };
};

const buildPayoutSummaryResponse = async (user) => {
  const earnings = await getProviderEarningsSummary({
    user,
    period: "all",
  });
  const payoutStats = await getProviderPayoutStats(user._id);
  const accounts = await getActiveAccounts(user._id);
  const defaultAccount = accounts.find((account) => account.isDefault) || null;

  const totalEarnings = toMoney(earnings?.summary?.totalEarnings || 0);
  const availableToRequest = roundCurrency(
    Math.max(
      0,
      totalEarnings -
        Number(payoutStats.disbursedAmount || 0) -
        Number(payoutStats.reservedAmount || 0),
    ),
  );

  return {
    earnings: earnings.summary,
    payouts: {
      totalRequested: payoutStats.totalRequested || 0,
      reservedAmount: payoutStats.reservedAmount || 0,
      disbursedAmount: payoutStats.disbursedAmount || 0,
      pendingAmount: payoutStats.pendingAmount || 0,
      approvedAmount: payoutStats.approvedAmount || 0,
      processingAmount: payoutStats.processingAmount || 0,
      rejectedAmount: payoutStats.rejectedAmount || 0,
      cancelledAmount: payoutStats.cancelledAmount || 0,
      totalPlatformFee: payoutStats.totalPlatformFee || 0,
      totalNetAmount: payoutStats.totalNetAmount || 0,
      platformFeePercent: PAYOUT_PLATFORM_FEE_PERCENT,
      availableToRequest,
      minPayoutAmount: MIN_PAYOUT_AMOUNT,
      maxPayoutAmount: MAX_PAYOUT_AMOUNT,
    },
    hasBankDetails: accounts.length > 0,
    bankAccounts: accounts.map(toAccountResponse),
    defaultBankAccountId: defaultAccount?._id || null,
  };
};

const getBankDetails = async (req, res) => {
  try {
    const accounts = await getActiveAccounts(req.user._id);
    const defaultAccount =
      accounts.find((account) => account.isDefault) || accounts[0] || null;

    res.json({
      hasBankDetails: Boolean(defaultAccount),
      bankDetails: defaultAccount ? toAccountResponse(defaultAccount) : null,
      bankAccounts: accounts.map(toAccountResponse),
      defaultBankAccountId: defaultAccount?._id || null,
    });
  } catch (error) {
    console.error(
      "Error in server/controllers/wallet/payout.js (getBankDetails):",
      error,
    );
    res.status(500).json({ message: "Failed to fetch bank details" });
  }
};

const getBankAccounts = async (req, res) => {
  try {
    const accounts = await getActiveAccounts(req.user._id);
    const defaultAccount =
      accounts.find((account) => account.isDefault) || accounts[0] || null;

    res.json({
      bankAccounts: accounts.map(toAccountResponse),
      defaultBankAccountId: defaultAccount?._id || null,
    });
  } catch (error) {
    console.error(
      "Error in server/controllers/wallet/payout.js (getBankAccounts):",
      error,
    );
    res.status(500).json({ message: "Failed to fetch bank accounts" });
  }
};

const createBankAccount = async (req, res) => {
  try {
    const confirmAccountNumber = String(
      req.body?.confirmAccountNumber || "",
    ).trim();
    if (!confirmAccountNumber) {
      return res.status(400).json({
        message: "Confirm account number is required",
      });
    }

    const nickname = String(req.body?.nickname || "").trim();
    const validation = validateBankDetails(req.body || {});
    if (!validation.isValid) {
      return res.status(400).json({
        message: "Invalid bank details",
        errors: validation.errors,
      });
    }

    const activeAccounts = await getActiveAccounts(req.user._id);
    if (activeAccounts.length >= MAX_ACTIVE_ACCOUNTS) {
      return res.status(400).json({
        message: `You can add up to ${MAX_ACTIVE_ACCOUNTS} active payout accounts`,
      });
    }

    const shouldSetDefault =
      req.body?.isDefault === true ||
      req.body?.isDefault === "true" ||
      activeAccounts.length === 0;

    if (shouldSetDefault) {
      await ProviderBankAccount.updateMany(
        { provider: req.user._id, isActive: true },
        { $set: { isDefault: false } },
      );
    }

    const account = await ProviderBankAccount.create({
      provider: req.user._id,
      nickname: nickname.slice(0, 40),
      ...validation.bankDetails,
      isDefault: shouldSetDefault,
      isActive: true,
    });

    if (shouldSetDefault) {
      await syncLegacyBankDetails(req.user._id, validation.bankDetails);
    }

    res.status(201).json({
      message: "Bank account added successfully",
      account: toAccountResponse(account),
    });
  } catch (error) {
    console.error(
      "Error in server/controllers/wallet/payout.js (createBankAccount):",
      error,
    );
    res.status(500).json({ message: "Failed to add bank account" });
  }
};

const updateBankAccount = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid bank account ID" });
    }

    const account = await ProviderBankAccount.findOne({
      _id: id,
      provider: req.user._id,
      isActive: true,
    });
    if (!account) {
      return res.status(404).json({ message: "Bank account not found" });
    }

    const hasAccountNumberUpdate =
      req.body && Object.prototype.hasOwnProperty.call(req.body, "accountNumber");
    if (hasAccountNumberUpdate) {
      const confirmAccountNumber = String(
        req.body?.confirmAccountNumber || "",
      ).trim();
      if (!confirmAccountNumber) {
        return res.status(400).json({
          message:
            "Confirm account number is required when updating account number",
        });
      }
    }

    const mergedPayload = {
      ...account.toObject(),
      ...(req.body || {}),
    };
    const validation = validateBankDetails(mergedPayload);
    if (!validation.isValid) {
      return res.status(400).json({
        message: "Invalid bank details",
        errors: validation.errors,
      });
    }

    const shouldSetDefault =
      req.body?.isDefault === true ||
      req.body?.isDefault === "true" ||
      account.isDefault;

    if (shouldSetDefault) {
      await ProviderBankAccount.updateMany(
        { provider: req.user._id, isActive: true, _id: { $ne: id } },
        { $set: { isDefault: false } },
      );
    }

    account.nickname = String(req.body?.nickname || account.nickname || "")
      .trim()
      .slice(0, 40);
    account.accountHolderName = validation.bankDetails.accountHolderName;
    account.bankName = validation.bankDetails.bankName;
    account.accountNumber = validation.bankDetails.accountNumber;
    account.ifscCode = validation.bankDetails.ifscCode;
    account.branchName = validation.bankDetails.branchName;
    account.upiId = validation.bankDetails.upiId;
    account.isDefault = shouldSetDefault;
    await account.save();

    if (account.isDefault) {
      await syncLegacyBankDetails(req.user._id, validation.bankDetails);
    }

    res.json({
      message: "Bank account updated successfully",
      account: toAccountResponse(account),
    });
  } catch (error) {
    console.error(
      "Error in server/controllers/wallet/payout.js (updateBankAccount):",
      error,
    );
    res.status(500).json({ message: "Failed to update bank account" });
  }
};

const setDefaultBankAccount = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid bank account ID" });
    }

    const account = await ProviderBankAccount.findOne({
      _id: id,
      provider: req.user._id,
      isActive: true,
    });
    if (!account) {
      return res.status(404).json({ message: "Bank account not found" });
    }

    await ProviderBankAccount.updateMany(
      { provider: req.user._id, isActive: true },
      { $set: { isDefault: false } },
    );
    account.isDefault = true;
    await account.save();
    await syncLegacyBankDetails(req.user._id, account.toObject());

    res.json({
      message: "Default payout account updated",
      account: toAccountResponse(account),
    });
  } catch (error) {
    console.error(
      "Error in server/controllers/wallet/payout.js (setDefaultBankAccount):",
      error,
    );
    res.status(500).json({ message: "Failed to set default account" });
  }
};

const deleteBankAccount = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid bank account ID" });
    }

    const account = await ProviderBankAccount.findOne({
      _id: id,
      provider: req.user._id,
      isActive: true,
    });
    if (!account) {
      return res.status(404).json({ message: "Bank account not found" });
    }

    const hasReservedPayout = await ProviderPayout.exists({
      provider: req.user._id,
      bankAccount: account._id,
      status: { $in: RESERVED_PAYOUT_STATUSES },
    });
    if (hasReservedPayout) {
      return res.status(400).json({
        message:
          "This account has active payout requests. Update/cancel those requests before deleting.",
      });
    }

    account.isActive = false;
    account.isDefault = false;
    await account.save();

    const remainingAccounts = await ProviderBankAccount.find({
      provider: req.user._id,
      isActive: true,
    }).sort({ isDefault: -1, createdAt: -1 });
    let defaultAccount =
      remainingAccounts.find((entry) => entry.isDefault) ||
      remainingAccounts[0] ||
      null;

    if (defaultAccount && !defaultAccount.isDefault) {
      defaultAccount.isDefault = true;
      await defaultAccount.save();
    }

    if (defaultAccount) {
      await syncLegacyBankDetails(req.user._id, defaultAccount.toObject());
    } else {
      await clearLegacyBankDetails(req.user._id);
    }

    res.json({
      message: "Payout account deleted successfully",
      defaultBankAccountId: defaultAccount?._id || null,
      bankAccounts: remainingAccounts.map(toAccountResponse),
    });
  } catch (error) {
    console.error(
      "Error in server/controllers/wallet/payout.js (deleteBankAccount):",
      error,
    );
    res.status(500).json({ message: "Failed to delete bank account" });
  }
};

const upsertBankDetails = async (req, res) => {
  try {
    const existingDefault = await getDefaultAccount(req.user._id);
    if (existingDefault) {
      req.params.id = existingDefault._id.toString();
      return updateBankAccount(req, res);
    }
    return createBankAccount(req, res);
  } catch (error) {
    console.error(
      "Error in server/controllers/wallet/payout.js (upsertBankDetails):",
      error,
    );
    res.status(500).json({ message: "Failed to save bank details" });
  }
};

const getPayoutSummary = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("name email role roleData");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const summary = await buildPayoutSummaryResponse(user);
    res.json(summary);
  } catch (error) {
    console.error(
      "Error in server/controllers/wallet/payout.js (getPayoutSummary):",
      error,
    );
    res.status(500).json({ message: "Failed to fetch payout summary" });
  }
};

const createPayoutRequest = async (req, res) => {
  try {
    if (isWeekendDay(new Date())) {
      return res.status(400).json({
        message:
          "Payout withdrawals are not available on Saturday and Sunday due to bank holidays",
      });
    }

    const amount = toMoney(req.body?.amount);
    const providerNote = String(req.body?.providerNote || "").trim();
    const bankAccountId = String(req.body?.bankAccountId || "").trim();
    const hasValidAmount = amount > 0 && Number.isFinite(amount);

    if (!hasValidAmount) {
      return res.status(400).json({ message: "Please enter a valid amount" });
    }

    if (amount < MIN_PAYOUT_AMOUNT) {
      return res.status(400).json({
        message: `Minimum payout amount is ₹${MIN_PAYOUT_AMOUNT.toFixed(2)}`,
      });
    }

    if (MAX_PAYOUT_AMOUNT && amount > MAX_PAYOUT_AMOUNT) {
      return res.status(400).json({
        message: `Maximum payout amount per request is ₹${MAX_PAYOUT_AMOUNT.toFixed(2)}`,
      });
    }

    if (providerNote.length > 300) {
      return res
        .status(400)
        .json({ message: "Payout note cannot exceed 300 characters" });
    }

    const user = await User.findById(req.user._id).select("name email role roleData");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await ensureLegacyBankAccount(req.user._id);
    let selectedAccount = null;
    if (bankAccountId) {
      if (!mongoose.isValidObjectId(bankAccountId)) {
        return res.status(400).json({ message: "Invalid payout account selected" });
      }
      selectedAccount = await ProviderBankAccount.findOne({
        _id: bankAccountId,
        provider: req.user._id,
        isActive: true,
      });
    } else {
      selectedAccount = await getDefaultAccount(req.user._id);
    }

    if (!selectedAccount) {
      return res.status(400).json({
        message: "Please add and select a valid payout account first",
      });
    }

    const summary = await buildPayoutSummaryResponse(user);
    const availableToRequest = Number(summary.payouts.availableToRequest || 0);

    if (availableToRequest <= 0) {
      return res.status(400).json({
        message: "No payout balance available right now",
      });
    }

    if (amount > availableToRequest) {
      return res.status(400).json({
        message: `Amount exceeds available payout balance (₹${availableToRequest.toFixed(2)})`,
      });
    }

    const payoutBreakdown = getPayoutFeeBreakdown(
      amount,
      PAYOUT_PLATFORM_FEE_PERCENT,
    );
    if (payoutBreakdown.netAmount <= 0) {
      return res.status(400).json({
        message: "Net payout amount must be greater than zero",
      });
    }

    const payout = await ProviderPayout.create({
      provider: req.user._id,
      providerRole: req.user.role,
      bankAccount: selectedAccount._id,
      amount: payoutBreakdown.grossAmount,
      platformFeePercent: payoutBreakdown.platformFeePercent,
      platformFeeAmount: payoutBreakdown.platformFeeAmount,
      netAmount: payoutBreakdown.netAmount,
      status: "pending",
      providerNote,
      bankDetails: sanitizeBankDetails(selectedAccount),
      requestedAt: new Date(),
      totalEarningsAtRequest: summary.earnings.totalEarnings || 0,
      availableAtRequest: availableToRequest,
    });
    await addWalletActivity({
      userId: req.user._id,
      type: "debit",
      amount: payoutBreakdown.grossAmount,
      sourceType: "payout_request",
      sourceId: payout._id,
      note: `Withdrawal request submitted (gross ${payoutBreakdown.grossAmount.toFixed(2)}, net ${payoutBreakdown.netAmount.toFixed(2)})`,
      dedupe: true,
    });

    const etaText = toBusinessEtaText(new Date());

    await sendNotification(req.user._id, {
      title: "Payout Request Submitted",
      body: `Your payout request of ₹${payoutBreakdown.grossAmount.toFixed(2)} is pending admin review. Net disbursement: ₹${payoutBreakdown.netAmount.toFixed(2)} after ${payoutBreakdown.platformFeePercent}% platform fee.`,
      icon: "/pwa-192x192.png",
      type: "PAYOUT_REQUEST_SUBMITTED",
      data: { url: "/profile?tab=wallet", payoutId: payout._id },
    });

    await sendAdminNotification({
      title: "New Provider Payout Request",
      body: `${user.name || "Provider"} requested ₹${payoutBreakdown.grossAmount.toFixed(2)} payout (net ₹${payoutBreakdown.netAmount.toFixed(2)}).`,
      icon: "/pwa-192x192.png",
      type: "PAYOUT_REQUEST_SUBMITTED",
      data: { url: "/admin/payouts", payoutId: payout._id },
    });

    await sendPayoutRequestSubmittedEmail({
      providerEmail: user.email,
      providerName: user.name,
      amount: payoutBreakdown.grossAmount,
      netAmount: payoutBreakdown.netAmount,
      platformFeePercent: payoutBreakdown.platformFeePercent,
      platformFeeAmount: payoutBreakdown.platformFeeAmount,
      bankName: selectedAccount.bankName,
      accountNumberMasked: toAccountResponse(selectedAccount)?.accountNumberMasked,
      etaText,
    });

    res.status(201).json({
      message: "Payout request submitted successfully",
      request: {
        ...payout.toObject(),
        bankAccountSelected: toAccountResponse(selectedAccount),
      },
      summary: await buildPayoutSummaryResponse(user),
    });
  } catch (error) {
    console.error(
      "Error in server/controllers/wallet/payout.js (createPayoutRequest):",
      error,
    );
    res.status(500).json({ message: "Failed to create payout request" });
  }
};

const getProviderPayoutRequests = async (req, res) => {
  try {
    const status = String(req.query.status || "all").toLowerCase();
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 25));
    const filter = { provider: req.user._id };

    if (status !== "all") {
      filter.status = status;
    }

    const rows = await ProviderPayout.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("reviewedBy", "name email")
      .populate(
        "bankAccount",
        "nickname bankName accountNumber ifscCode accountHolderName isDefault",
      );

    const requests = rows.map((row) => {
      const entry = row.toObject();
      const grossAmount = Number(entry.amount || 0);
      const platformFeePercent = Number(
        entry.platformFeePercent || PAYOUT_PLATFORM_FEE_PERCENT,
      );
      const platformFeeAmount = roundCurrency(
        Number(entry.platformFeeAmount) ||
          (grossAmount * platformFeePercent) / 100,
      );
      const netAmount = roundCurrency(
        Number(entry.netAmount) || Math.max(0, grossAmount - platformFeeAmount),
      );
      entry.platformFeePercent = platformFeePercent;
      entry.platformFeeAmount = platformFeeAmount;
      entry.netAmount = netAmount;
      entry.bankDetailsMasked = sanitizeBankDetailsForResponse(
        entry.bankDetails || {},
      ).bankDetails;
      entry.bankAccountSelected = entry.bankAccount
        ? toAccountResponse(entry.bankAccount)
        : null;
      return entry;
    });

    res.json({ requests });
  } catch (error) {
    console.error(
      "Error in server/controllers/wallet/payout.js (getProviderPayoutRequests):",
      error,
    );
    res.status(500).json({ message: "Failed to fetch payout requests" });
  }
};

const cancelPayoutRequest = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid payout request ID" });
    }

    const payout = await ProviderPayout.findOne({
      _id: id,
      provider: req.user._id,
    });
    if (!payout) {
      return res.status(404).json({ message: "Payout request not found" });
    }

    if (payout.status !== "pending") {
      return res.status(400).json({
        message: "Only pending payout requests can be cancelled",
      });
    }

    payout.status = "cancelled";
    payout.adminNote = payout.adminNote || "Cancelled by provider";
    payout.reviewedAt = new Date();
    await payout.save();
    await addWalletActivity({
      userId: req.user._id,
      type: "credit",
      amount: Number(payout.amount || 0),
      sourceType: "payout_release",
      sourceId: payout._id,
      note: `Withdrawal request cancelled. Reserved amount released (${Number(payout.amount || 0).toFixed(2)})`,
      dedupe: true,
    });

    res.json({
      message: "Payout request cancelled",
      request: payout,
    });
  } catch (error) {
    console.error(
      "Error in server/controllers/wallet/payout.js (cancelPayoutRequest):",
      error,
    );
    res.status(500).json({ message: "Failed to cancel payout request" });
  }
};

module.exports = {
  getBankDetails,
  upsertBankDetails,
  getBankAccounts,
  createBankAccount,
  updateBankAccount,
  setDefaultBankAccount,
  deleteBankAccount,
  getPayoutSummary,
  createPayoutRequest,
  getProviderPayoutRequests,
  cancelPayoutRequest,
};
