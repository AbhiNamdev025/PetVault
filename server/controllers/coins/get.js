const User = require("../../models/User/user");
const CoinLedger = require("../../models/Coin/coinLedger");
const { COIN_RATE, toRupees } = require("../../utils/coins");

const getBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("coins");
    const coins = Math.max(0, Number(user?.coins) || 0);
    res.json({
      coins,
      rate: COIN_RATE,
      rupeeValue: toRupees(coins),
    });
  } catch (error) {
    console.error("Error in server/controllers/coins/get.js (getBalance):", error);
    res.status(500).json({ message: "Failed to fetch coin balance" });
  }
};

const getLedger = async (req, res) => {
  try {
    const limit = Math.min(100, Number(req.query.limit) || 30);
    const ledger = await CoinLedger.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit);
    res.json({ ledger });
  } catch (error) {
    console.error("Error in server/controllers/coins/get.js (getLedger):", error);
    res.status(500).json({ message: "Failed to fetch coin ledger" });
  }
};

module.exports = { getBalance, getLedger };
