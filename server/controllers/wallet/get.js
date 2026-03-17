const User = require("../../models/User/user");
const WalletLedger = require("../../models/Wallet/walletLedger");
const ProviderPayout = require("../../models/Payout/providerPayout");
const {
  getPeriodRange,
  roundCurrency,
  addWalletActivity,
} = require("../../utils/wallet");
const {
  PROVIDER_ROLES,
  getProviderEarningsSummary,
} = require("../../utils/providerEarnings");

const buildDateRangeFilter = (field, start, end) => {
  if (!start) return {};
  return {
    [field]: {
      $gte: start,
      ...(end ? { $lte: end } : {}),
    },
  };
};

const RELEASE_PAYOUT_STATUSES = new Set(["rejected", "cancelled"]);

const syncProviderPayoutActivities = async (user) => {
  if (!user?._id) return;
  if (!PROVIDER_ROLES.includes(user.role)) return;

  const payouts = await ProviderPayout.find({ provider: user._id }).select(
    "_id amount status",
  );

  await Promise.all(
    payouts.map(async (payout) => {
      const grossAmount = roundCurrency(Number(payout?.amount || 0));
      if (grossAmount <= 0) return;

      await addWalletActivity({
        userId: user._id,
        type: "debit",
        amount: grossAmount,
        sourceType: "payout_request",
        sourceId: payout._id,
        note: `Withdrawal request submitted (gross ${grossAmount.toFixed(2)})`,
        dedupe: true,
      });

      const payoutStatus = String(payout?.status || "").toLowerCase();
      if (RELEASE_PAYOUT_STATUSES.has(payoutStatus)) {
        await addWalletActivity({
          userId: user._id,
          type: "credit",
          amount: grossAmount,
          sourceType: "payout_release",
          sourceId: payout._id,
          note: `Withdrawal request ${payoutStatus}. Reserved amount released (${grossAmount.toFixed(2)})`,
          dedupe: true,
        });
      }
    }),
  );
};

const getBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("walletBalance");
    const balance = roundCurrency(user?.walletBalance || 0);
    res.json({
      balance,
      currency: "INR",
    });
  } catch (error) {
    console.error("Error in server/controllers/wallet/get.js (getBalance):", error);
    res.status(500).json({ message: "Failed to fetch wallet balance" });
  }
};

const getLedger = async (req, res) => {
  try {
    await syncProviderPayoutActivities(req.user);

    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 30));
    const type = String(req.query.type || "all").toLowerCase();
    const { start, end, period } = getPeriodRange(req.query.period);

    const baseFilter = {
      user: req.user._id,
      ...buildDateRangeFilter("createdAt", start, end),
    };

    const ledgerFilter = { ...baseFilter };
    if (type === "credit") {
      ledgerFilter.amount = { $gt: 0 };
    } else if (type === "debit") {
      ledgerFilter.amount = { $lt: 0 };
    }

    const [ledger, summaryRows] = await Promise.all([
      WalletLedger.find(ledgerFilter).sort({ createdAt: -1 }).limit(limit),
      WalletLedger.aggregate([
        { $match: baseFilter },
        {
          $group: {
            _id: null,
            credits: {
              $sum: {
                $cond: [{ $gt: ["$amount", 0] }, "$amount", 0],
              },
            },
            debits: {
              $sum: {
                $cond: [{ $lt: ["$amount", 0] }, { $abs: "$amount" }, 0],
              },
            },
            net: { $sum: "$amount" },
          },
        },
      ]),
    ]);

    const summary = summaryRows[0] || {
      credits: 0,
      debits: 0,
      net: 0,
    };

    res.json({
      period,
      from: start,
      to: end,
      summary: {
        credits: roundCurrency(summary.credits || 0),
        debits: roundCurrency(summary.debits || 0),
        net: roundCurrency(summary.net || 0),
      },
      ledger,
    });
  } catch (error) {
    console.error("Error in server/controllers/wallet/get.js (getLedger):", error);
    res.status(500).json({ message: "Failed to fetch wallet activity" });
  }
};

const getProviderEarnings = async (req, res) => {
  try {
    const role = req.user?.role;
    if (!PROVIDER_ROLES.includes(role)) {
      return res
        .status(403)
        .json({ message: "Provider earnings are not available for this role" });
    }

    const earningsData = await getProviderEarningsSummary({
      user: req.user,
      period: req.query.period,
    });

    res.json({
      period: earningsData.period,
      from: earningsData.from,
      to: earningsData.to,
      providerRole: earningsData.providerRole,
      providerScopeCount: earningsData.providerScopeCount,
      summary: earningsData.summary,
    });
  } catch (error) {
    console.error(
      "Error in server/controllers/wallet/get.js (getProviderEarnings):",
      error,
    );
    res.status(500).json({ message: "Failed to fetch provider earnings" });
  }
};

module.exports = {
  getBalance,
  getLedger,
  getProviderEarnings,
};
