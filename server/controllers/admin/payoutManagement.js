const mongoose = require("mongoose");
const ProviderPayout = require("../../models/Payout/providerPayout");
const User = require("../../models/User/user");
const {
  getPeriodRange,
  roundCurrency,
  addWalletActivity,
} = require("../../utils/wallet");
const { getProviderEarningsSummary } = require("../../utils/providerEarnings");
const {
  PAYOUT_STATUSES,
  summarizePayoutRows,
  sanitizeBankDetailsForResponse,
  isWeekendDay,
  toBusinessEtaText,
} = require("../../utils/payout");
const { sendNotification } = require("../../utils/pushNotification");
const { sendPayoutStatusUpdateEmail } = require("../../utils/emailService");

const toSafeText = (value) => String(value || "").trim();

const ALLOWED_STATUS_TRANSITIONS = {
  pending: ["approved", "processing", "disbursed", "rejected", "cancelled"],
  approved: ["processing", "disbursed", "rejected"],
  processing: ["disbursed", "rejected"],
  disbursed: [],
  rejected: [],
  cancelled: [],
};

const buildDateFilter = (field, start, end) => {
  if (!start) return {};
  return {
    [field]: {
      $gte: start,
      ...(end ? { $lte: end } : {}),
    },
  };
};

const mapRequestForResponse = (row) => {
  const data = row.toObject();
  const grossAmount = Number(data.amount || 0);
  const platformFeePercent = Number(data.platformFeePercent || 3);
  const platformFeeAmount =
    Number(data.platformFeeAmount) ||
    roundCurrency((grossAmount * platformFeePercent) / 100);
  const netAmount = roundCurrency(
    Number(data.netAmount) || Math.max(0, grossAmount - platformFeeAmount),
  );

  data.platformFeePercent = platformFeePercent;
  data.platformFeeAmount = platformFeeAmount;
  data.netAmount = netAmount;
  data.bankDetailsMasked = sanitizeBankDetailsForResponse(
    data.bankDetails || {},
  ).bankDetails;
  return data;
};

const getAdminPayoutRequests = async (req, res) => {
  try {
    const status = String(req.query.status || "all").toLowerCase();
    const role = String(req.query.role || "all").toLowerCase();
    const period = String(req.query.period || "all").toLowerCase();
    const search = toSafeText(req.query.search).toLowerCase();
    const limit = Math.min(250, Math.max(1, Number(req.query.limit) || 80));

    const { start, end } = getPeriodRange(period);
    const filter = {
      ...buildDateFilter("createdAt", start, end),
    };

    if (status !== "all") {
      if (!PAYOUT_STATUSES.includes(status)) {
        return res.status(400).json({ message: "Invalid status filter" });
      }
      filter.status = status;
    }

    if (role !== "all") {
      filter.providerRole = role;
    }

    if (search) {
      const providers = await User.find({
        $or: [
          { name: new RegExp(search, "i") },
          { email: new RegExp(search, "i") },
          { phone: new RegExp(search, "i") },
          { role: new RegExp(search, "i") },
          { "roleData.shopName": new RegExp(search, "i") },
          { "roleData.hospitalName": new RegExp(search, "i") },
          { "roleData.daycareName": new RegExp(search, "i") },
        ],
      }).select("_id");

      const providerIds = providers.map((provider) => provider._id);
      if (mongoose.isValidObjectId(search)) {
        providerIds.push(new mongoose.Types.ObjectId(search));
      }

      filter.provider = { $in: providerIds };
    }

    const rows = await ProviderPayout.find(filter)
      .populate("provider", "name email phone role roleData")
      .populate("reviewedBy", "name email")
      .populate(
        "bankAccount",
        "nickname bankName accountNumber ifscCode accountHolderName",
      )
      .sort({ createdAt: -1 })
      .limit(limit);

    const summary = summarizePayoutRows(rows);
    const roleSummary = rows.reduce((acc, row) => {
      const key = row.providerRole || "unknown";
      if (!acc[key]) {
        acc[key] = { count: 0, amount: 0 };
      }
      acc[key].count += 1;
      acc[key].amount = roundCurrency(
        Number(acc[key].amount || 0) + Number(row.amount || 0),
      );
      return acc;
    }, {});

    res.json({
      filters: {
        status,
        role,
        period,
        search,
      },
      summary: {
        ...summary,
        totalCount: rows.length,
        byRole: roleSummary,
      },
      requests: rows.map(mapRequestForResponse),
    });
  } catch (error) {
    console.error(
      "Error in server/controllers/admin/payoutManagement.js (getAdminPayoutRequests):",
      error,
    );
    res.status(500).json({ message: "Failed to fetch payout requests" });
  }
};

const getAdminPayoutRequestDetails = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid payout request ID" });
    }

    const payout = await ProviderPayout.findById(id)
      .populate("provider", "name email phone role roleData")
      .populate("reviewedBy", "name email")
      .populate(
        "bankAccount",
        "nickname bankName accountNumber ifscCode accountHolderName branchName upiId",
      );

    if (!payout) {
      return res.status(404).json({ message: "Payout request not found" });
    }

    const provider = payout.provider;
    let providerEarnings = {
      summary: {
        totalEarnings: 0,
        orderEarnings: 0,
        appointmentsEarnings: 0,
        onlineEarnings: 0,
        offlineEarnings: 0,
      },
    };
    let providerPayoutRows = [];

    if (provider?._id) {
      providerEarnings = await getProviderEarningsSummary({
        user: provider,
        period: "all",
      });
      providerPayoutRows = await ProviderPayout.find({
        provider: provider._id,
      }).select("amount status");
    }
    const payoutTotals = summarizePayoutRows(providerPayoutRows);
    const availableToRequest = roundCurrency(
      Math.max(
        0,
        Number(providerEarnings?.summary?.totalEarnings || 0) -
          Number(payoutTotals.disbursedAmount || 0) -
          Number(payoutTotals.reservedAmount || 0),
      ),
    );

    res.json({
      request: mapRequestForResponse(payout),
      providerSummary: {
        earnings: providerEarnings.summary,
        payouts: {
          ...payoutTotals,
          availableToRequest,
        },
      },
      businessDayNotice:
        "Payout disbursement runs only on business days (Monday to Friday).",
    });
  } catch (error) {
    console.error(
      "Error in server/controllers/admin/payoutManagement.js (getAdminPayoutRequestDetails):",
      error,
    );
    res.status(500).json({ message: "Failed to fetch payout details" });
  }
};

const updatePayoutRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const nextStatus = String(req.body?.status || "").toLowerCase();
    const adminNote = toSafeText(req.body?.adminNote);
    const disbursementReference = toSafeText(req.body?.disbursementReference);
    const paymentMode = String(req.body?.paymentMode || "")
      .trim()
      .toLowerCase();
    const utrNumber = toSafeText(req.body?.utrNumber);
    const transactionId = toSafeText(req.body?.transactionId);
    const payoutProofImage = req.file?.filename || "";
    const allowedPaymentModes = [
      "",
      "bank_transfer",
      "upi",
      "imps",
      "neft",
      "rtgs",
      "manual",
    ];

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid payout request ID" });
    }

    if (!PAYOUT_STATUSES.includes(nextStatus)) {
      return res.status(400).json({ message: "Invalid payout status" });
    }

    if (
      ["processing", "disbursed"].includes(nextStatus) &&
      isWeekendDay(new Date())
    ) {
      return res.status(400).json({
        message:
          "Payout processing/disbursement is not allowed on Saturday and Sunday due to bank holidays",
      });
    }

    const payout = await ProviderPayout.findById(id).populate(
      "provider",
      "name role email",
    );
    if (!payout) {
      return res.status(404).json({ message: "Payout request not found" });
    }

    const currentStatus = String(payout.status || "").toLowerCase();
    const allowedTransitions = ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];
    if (!allowedTransitions.includes(nextStatus)) {
      return res.status(400).json({
        message: `Cannot change payout status from ${currentStatus} to ${nextStatus}`,
      });
    }

    if (adminNote.length > 500) {
      return res
        .status(400)
        .json({ message: "Admin note cannot exceed 500 characters" });
    }

    if (nextStatus === "disbursed" && !disbursementReference) {
      return res.status(400).json({
        message:
          "Disbursement reference is required when marking payout as disbursed",
      });
    }

    if (!allowedPaymentModes.includes(paymentMode)) {
      return res.status(400).json({
        message: "Invalid payment mode",
      });
    }

    if (utrNumber.length > 120 || transactionId.length > 120) {
      return res.status(400).json({
        message: "UTR/transaction ID cannot exceed 120 characters",
      });
    }

    payout.status = nextStatus;
    payout.adminNote = adminNote;
    payout.disbursementReference = disbursementReference;
    payout.paymentMode = paymentMode || payout.paymentMode || "";
    payout.utrNumber = utrNumber || payout.utrNumber || "";
    payout.transactionId = transactionId || payout.transactionId || "";
    if (payoutProofImage) {
      payout.payoutProofImage = payoutProofImage;
    }

    if (nextStatus === "disbursed") {
      if (!payout.paymentMode) {
        return res.status(400).json({
          message: "Payment mode is required when marking payout as disbursed",
        });
      }
      if (!payout.utrNumber) {
        return res.status(400).json({
          message: "UTR number is required when marking payout as disbursed",
        });
      }
    }

    payout.reviewedBy = req.user._id;
    payout.reviewedAt = new Date();
    if (nextStatus === "disbursed") {
      payout.disbursedAt = new Date();
    }
    await payout.save();

    if (["rejected", "cancelled"].includes(nextStatus)) {
      await addWalletActivity({
        userId: payout.provider?._id,
        type: "credit",
        amount: Number(payout.amount || 0),
        sourceType: "payout_release",
        sourceId: payout._id,
        note: `Withdrawal request ${nextStatus}. Reserved amount released (${Number(
          payout.amount || 0,
        ).toFixed(2)})`,
        dedupe: true,
      });
    }

    const statusMessages = {
      approved: "approved and queued for disbursement",
      processing: "in processing for disbursement",
      disbursed: "disbursed successfully",
      rejected: "rejected",
      cancelled: "cancelled",
    };
    const providerName = payout.provider?.name || "Provider";
    await sendNotification(payout.provider?._id, {
      title: "Payout Request Updated",
      body: `Your payout request for ₹${Number(payout.amount || 0).toFixed(2)} (net ₹${Number(payout.netAmount || payout.amount || 0).toFixed(2)}) has been ${statusMessages[nextStatus] || nextStatus}.`,
      icon: "/pwa-192x192.png",
      type: "PAYOUT_STATUS_UPDATED",
      data: { url: "/profile?tab=wallet", payoutId: payout._id },
    });

    await sendPayoutStatusUpdateEmail({
      providerEmail: payout.provider?.email,
      providerName: providerName,
      amount: payout.amount,
      netAmount: payout.netAmount,
      platformFeePercent: payout.platformFeePercent,
      platformFeeAmount: payout.platformFeeAmount,
      status: nextStatus,
      reference: disbursementReference || payout.disbursementReference,
      paymentMode: payout.paymentMode,
      utrNumber: payout.utrNumber,
      transactionId: payout.transactionId,
      adminNote,
      etaText: toBusinessEtaText(new Date()),
    });

    const response = mapRequestForResponse(payout);
    res.json({
      message: `Payout request for ${providerName} updated to ${nextStatus}`,
      request: response,
    });
  } catch (error) {
    console.error(
      "Error in server/controllers/admin/payoutManagement.js (updatePayoutRequestStatus):",
      error,
    );
    res.status(500).json({ message: "Failed to update payout request" });
  }
};

module.exports = {
  getAdminPayoutRequests,
  getAdminPayoutRequestDetails,
  updatePayoutRequestStatus,
};
