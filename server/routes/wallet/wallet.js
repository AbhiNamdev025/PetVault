const router = require("express").Router();
const { protect } = require("../../middleware/Auth/authMiddleware");
const { requireProvider } = require("../../middleware/roleCheck");
const {
  getBalance,
  getLedger,
  getProviderEarnings,
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
} = require("../../controllers/wallet");

router.get("/balance", protect, getBalance);
router.get("/ledger", protect, getLedger);
router.get("/provider-earnings", protect, requireProvider, getProviderEarnings);
router.get("/bank-details", protect, requireProvider, getBankDetails);
router.put("/bank-details", protect, requireProvider, upsertBankDetails);
router.get("/bank-accounts", protect, requireProvider, getBankAccounts);
router.post("/bank-accounts", protect, requireProvider, createBankAccount);
router.put("/bank-accounts/:id", protect, requireProvider, updateBankAccount);
router.delete("/bank-accounts/:id", protect, requireProvider, deleteBankAccount);
router.put(
  "/bank-accounts/:id/default",
  protect,
  requireProvider,
  setDefaultBankAccount,
);
router.get("/payout-summary", protect, requireProvider, getPayoutSummary);
router.post("/payout-requests", protect, requireProvider, createPayoutRequest);
router.get(
  "/payout-requests",
  protect,
  requireProvider,
  getProviderPayoutRequests,
);
router.put(
  "/payout-requests/:id/cancel",
  protect,
  requireProvider,
  cancelPayoutRequest,
);

module.exports = router;
