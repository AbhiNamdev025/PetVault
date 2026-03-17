const router = require("express").Router();
const { protect } = require("../../middleware/Auth/authMiddleware");
const { getBalance, getLedger } = require("../../controllers/coins/get");

router.get("/balance", protect, getBalance);
router.get("/ledger", protect, getLedger);

module.exports = router;
