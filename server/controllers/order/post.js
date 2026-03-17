const Order = require("../../models/Order/order");
const Product = require("../../models/Product/product");
const Pet = require("../../models/Pet/pet");
const User = require("../../models/User/user");
const {
  getPlatformFeeConfig,
  getPlatformFeePercent,
  roundCurrency,
} = require("../../utils/platformFee");
const {
  clampCoinsForAmount,
  spendCoins,
  toRupees,
  MAX_SPEND_PERCENT,
  MAX_SPEND_COINS,
  COIN_RATE,
} = require("../../utils/coins");
const { debitWallet } = require("../../utils/wallet");

const createOrder = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const {
      customerName,
      mobileNumber,
      items,
      paymentMethod,
      shippingAddress,
      coinsToUse,
      walletToUse,
    } = req.body;

    if (
      !customerName ||
      !mobileNumber ||
      !items ||
      !paymentMethod ||
      !shippingAddress
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ message: "Order must have at least one item" });
    }

    // Validate mobile number
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(mobileNumber)) {
      return res
        .status(400)
        .json({ message: "Please enter a valid 10-digit mobile number" });
    }

    const productIds = items
      .map((item) => item.product || item.productId)
      .filter(Boolean);
    const petIds = items.map((item) => item.pet || item.petId).filter(Boolean);

    const [products, pets] = await Promise.all([
      Product.find({ _id: { $in: productIds } }),
      Pet.find({ _id: { $in: petIds } }),
    ]);

    const productMap = new Map(
      products.map((product) => [product._id.toString(), product]),
    );
    const petMap = new Map(pets.map((pet) => [pet._id.toString(), pet]));

    const normalizedItems = [];
    for (const item of items) {
      const productRef = item.product || item.productId;
      const petRef = item.pet || item.petId;

      if (productRef) {
        const product = productMap.get(productRef.toString());
        if (!product || product.isArchived) {
          return res
            .status(400)
            .json({ message: "Invalid or archived product in order" });
        }
        const quantity = Math.max(1, Number(item.quantity) || 1);
        if (product.stock < quantity) {
          return res
            .status(400)
            .json({ message: `Insufficient stock for ${product.name}` });
        }
        if (!product.shopId) {
          return res
            .status(400)
            .json({ message: "Product shop information missing" });
        }

        normalizedItems.push({
          product: product._id,
          shopId: product.shopId,
          name: product.name,
          price: product.price,
          quantity,
          image: product.images?.[0] || item.image,
          brand: product.brand,
        });
      } else if (petRef) {
        const pet = petMap.get(petRef.toString());
        if (!pet || pet.isArchived) {
          return res
            .status(400)
            .json({ message: "Invalid or archived pet in order" });
        }
        const shopId = pet.shopId || pet.ngoId;
        if (!shopId) {
          return res
            .status(400)
            .json({ message: "Pet owner information missing" });
        }

        normalizedItems.push({
          pet: pet._id,
          shopId,
          name: pet.name,
          price: pet.price || 0,
          quantity: 1,
          image: pet.images?.[0] || item.image,
        });
      } else {
        return res
          .status(400)
          .json({ message: "Each order item must have a product or pet" });
      }
    }

    if (normalizedItems.length === 0) {
      return res.status(400).json({ message: "Order has no valid items" });
    }

    const uniqueShopIds = [
      ...new Set(normalizedItems.map((i) => i.shopId.toString())),
    ];
    const shopUsers = await User.find({ _id: { $in: uniqueShopIds } }).select(
      "role",
    );
    const roleMap = new Map(
      shopUsers.map((shopUser) => [shopUser._id.toString(), shopUser.role]),
    );

    const platformConfig = await getPlatformFeeConfig();
    const subtotal = normalizedItems.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
      0,
    );

    let platformFeeRaw = 0;
    for (const item of normalizedItems) {
      const role = roleMap.get(item.shopId.toString());
      const percent = getPlatformFeePercent(role, platformConfig);
      platformFeeRaw +=
        ((item.price || 0) * (item.quantity || 1) * percent) / 100;
    }

    const platformFee = roundCurrency(platformFeeRaw);
    const originalAmount = roundCurrency(subtotal + platformFee);

    const requestedCoins = Math.max(0, Number(coinsToUse) || 0);
    const maxCoinsByAmount = clampCoinsForAmount(
      requestedCoins,
      originalAmount,
    );
    const maxCoinsByPercent = Math.floor(
      Math.max(0, originalAmount) * (MAX_SPEND_PERCENT / 100) * COIN_RATE,
    );
    const userForCoins = await User.findById(req.user._id).select(
      "coins walletBalance",
    );
    const availableCoins = Math.max(0, Number(userForCoins?.coins) || 0);
    const availableWallet = roundCurrency(
      Math.max(0, Number(userForCoins?.walletBalance) || 0),
    );
    const coinsUsed = Math.min(
      availableCoins,
      maxCoinsByAmount,
      maxCoinsByPercent,
      MAX_SPEND_COINS,
    );
    const coinsValue = toRupees(coinsUsed);
    const requestedWallet = roundCurrency(Math.max(0, Number(walletToUse) || 0));
    const walletUsableCap = roundCurrency(
      Math.max(0, originalAmount - (coinsValue || 0)),
    );
    const walletUsedAmount = roundCurrency(
      Math.min(availableWallet, requestedWallet, walletUsableCap),
    );

    const totalAmount = roundCurrency(
      Math.max(0, originalAmount - (coinsValue || 0) - (walletUsedAmount || 0)),
    );

    let finalPaymentMethod = paymentMethod;
    let paymentStatus = "pending";
    let orderStatus = "pending";
    let paidAt = null;

    if (totalAmount <= 0) {
      finalPaymentMethod = walletUsedAmount > 0 ? "Wallet" : "Coins";
      paymentStatus = "paid";
      orderStatus = "confirmed";
      paidAt = new Date();
    }

    const order = await Order.create({
      customerName,
      mobileNumber,
      items: normalizedItems,
      totalAmount,
      originalAmount,
      coinsUsed: coinsUsed || 0,
      coinsValue: coinsValue || 0,
      walletUsedAmount: walletUsedAmount || 0,
      platformFee,
      paymentMethod: finalPaymentMethod,
      paymentStatus,
      status: orderStatus,
      paidAt,
      shippingAddress,
      user: req.user._id,
      invoiceNumber: `INV-${Date.now()}`,
    });

    if (coinsUsed > 0) {
      await spendCoins({
        userId: req.user._id,
        coins: coinsUsed,
        sourceType: "order",
        sourceId: order._id,
        note: `Coins used on order ${order.invoiceNumber}`,
      });
    }

    if (walletUsedAmount > 0) {
      await debitWallet({
        userId: req.user._id,
        amount: walletUsedAmount,
        sourceType: "order_wallet_use",
        sourceId: order._id,
        note: `Wallet used on order ${order.invoiceNumber}`,
      });
    }

    const { sendNotification } = require("../../utils/pushNotification");

    // Notify User
    await sendNotification(req.user._id, {
      title: "Order Placed Successfully",
      body: `Your order ${order.invoiceNumber} has been placed.`,
      icon: "/pwa-192x192.png",
      type: "ORDER_PLACED",
      data: { url: `/my-orders` },
    });

    // Notify Shop Owners (Providers)
    const shopIds = [
      ...new Set(order.items.map((item) => item.shopId.toString())),
    ];

    // Use Promise.all to send notifications concurrently
    await Promise.all(
      shopIds.map((shopId) =>
        sendNotification(shopId, {
          title: "New Order Received",
          body: `You have a new order ${order.invoiceNumber} from ${customerName}.`,
          icon: "/pwa-192x192.png",
          type: "NEW_ORDER_RECEIVED",
          data: { url: `/profile` }, // Dashboard link for shop owner
        }),
      ),
    );

    res.status(201).json(order);
  } catch (error) {
    console.error(
      "Error in server/controllers/order/post.js (createOrder):",
      error,
    );
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
};
