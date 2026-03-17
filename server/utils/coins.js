const User = require("../models/User/user");
const CoinLedger = require("../models/Coin/coinLedger");

const COIN_RATE = 10; // 10 coins = ₹1
const COIN_REWARD_PERCENT = 2;
const MAX_REWARD_COINS = 100;
const MAX_SPEND_PERCENT = 5;
const MAX_SPEND_COINS = 100;

const FIRST_REWARD_COINS = 10;
const ORDER_MAX_COINS = MAX_SPEND_COINS;
const APPOINTMENT_MAX_COIN_PERCENT = MAX_SPEND_PERCENT;
const MIN_REWARD_COINS = 0;

const roundCurrency = (value) => Math.round((Number(value) || 0) * 100) / 100;

const toRupees = (coins) => roundCurrency((Number(coins) || 0) / COIN_RATE);

const clampCoinsForAmount = (coins, amount) => {
  const maxCoins = Math.floor((Number(amount) || 0) * COIN_RATE);
  const requested = Math.floor(Math.max(0, Number(coins) || 0));
  return Math.max(0, Math.min(requested, maxCoins));
};

const spendCoins = async ({ userId, coins, sourceType, sourceId, note }) => {
  const requested = Math.floor(Math.max(0, Number(coins) || 0));
  if (!requested) return { coinsUsed: 0, coinsValue: 0 };

  const user = await User.findById(userId).select("coins");
  if (!user) return { coinsUsed: 0, coinsValue: 0 };

  const available = Math.max(0, Number(user.coins) || 0);
  const coinsUsed = Math.min(requested, available);
  if (!coinsUsed) return { coinsUsed: 0, coinsValue: 0 };

  user.coins = available - coinsUsed;
  await user.save();

  await CoinLedger.create({
    user: userId,
    type: "spend",
    amount: -coinsUsed,
    balanceAfter: user.coins,
    sourceType,
    sourceId,
    note,
  });

  return { coinsUsed, coinsValue: toRupees(coinsUsed) };
};

const refundSpentCoins = async ({
  userId,
  coins,
  sourceType,
  sourceId,
  spendSourceType,
  note,
}) => {
  const requested = Math.floor(Math.max(0, Number(coins) || 0));
  if (!requested) return { coinsRefunded: 0, coinsValue: 0 };

  if (spendSourceType) {
    const spendEntry = await CoinLedger.findOne({
      user: userId,
      type: "spend",
      sourceType: spendSourceType,
      sourceId,
    }).select("_id");

    if (!spendEntry) return { coinsRefunded: 0, coinsValue: 0 };
  }

  const existingRefund = await CoinLedger.findOne({
    user: userId,
    type: "adjust",
    sourceType,
    sourceId,
    amount: { $gt: 0 },
  }).select("_id");

  if (existingRefund) return { coinsRefunded: 0, coinsValue: 0 };

  const user = await User.findById(userId).select("coins");
  if (!user) return { coinsRefunded: 0, coinsValue: 0 };

  const currentBalance = Math.max(0, Number(user.coins) || 0);
  const coinsRefunded = requested;
  user.coins = currentBalance + coinsRefunded;
  await user.save();

  await CoinLedger.create({
    user: userId,
    type: "adjust",
    amount: coinsRefunded,
    balanceAfter: user.coins,
    sourceType,
    sourceId,
    note,
  });

  return { coinsRefunded, coinsValue: toRupees(coinsRefunded) };
};

const maybeAwardCoins = async ({
  userId: rawUserId,
  sourceType,
  sourceId,
  baseAmount,
  note,
}) => {
  const userId = rawUserId?._id || rawUserId;
  if (!userId) return 0;

  const existing = await CoinLedger.findOne({
    user: userId,
    type: "earn",
    sourceType,
    sourceId,
  });
  if (existing) return 0;

  const base = Math.max(0, Number(baseAmount) || 0);
  let coins = Math.floor((base * COIN_REWARD_PERCENT) / 100);
  coins = Math.max(1, Math.min(MAX_REWARD_COINS, coins));

  if (coins < 1) return 0;

  const user = await User.findByIdAndUpdate(
    userId,
    { $inc: { coins } },
    { new: true },
  ).select("coins");

  await CoinLedger.create({
    user: userId,
    type: "earn",
    amount: coins,
    balanceAfter: user?.coins || 0,
    sourceType,
    sourceId,
    note,
  });

  return coins;
};

const awardFirstCoins = async ({
  userId: rawUserId,
  category,
  sourceId,
  note,
}) => {
  const userId = rawUserId?._id || rawUserId;
  if (!userId || !category) return 0;

  const sourceType = `first_${category}`;
  const existing = await CoinLedger.findOne({
    user: userId,
    type: "earn",
    sourceType,
  });
  if (existing) return 0;

  const coins = Math.max(0, Math.floor(FIRST_REWARD_COINS));
  if (!coins) return 0;

  const user = await User.findByIdAndUpdate(
    userId,
    { $inc: { coins } },
    { new: true },
  ).select("coins");

  await CoinLedger.create({
    user: userId,
    type: "earn",
    amount: coins,
    balanceAfter: user?.coins || 0,
    sourceType,
    sourceId,
    note: note || `First ${category} bonus`,
  });

  return coins;
};

module.exports = {
  COIN_RATE,
  COIN_REWARD_PERCENT,
  FIRST_REWARD_COINS,
  ORDER_MAX_COINS,
  MAX_REWARD_COINS,
  MAX_SPEND_PERCENT,
  MAX_SPEND_COINS,
  toRupees,
  clampCoinsForAmount,
  spendCoins,
  refundSpentCoins,
  maybeAwardCoins,
  awardFirstCoins,
};
