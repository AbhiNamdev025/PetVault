const User = require("../../models/User/user");
const Product = require("../../models/Product/product");
const Pet = require("../../models/Pet/pet");

/**
 * Get all shops with listing counts
 */
const getAllShops = async (req, res) => {
  try {
    const shops = await User.find({ role: "shop" }).select(
      "name email phone roleData.shopName roleData.shopDescription createdAt",
    );

    const shopsWithCounts = await Promise.all(
      shops.map(async (shop) => {
        const productCount = await Product.countDocuments({ shopId: shop._id });
        const petCount = await Pet.countDocuments({ shopId: shop._id });

        return {
          _id: shop._id,
          owner_name: shop.name,
          owner_email: shop.email,
          owner_phone: shop.phone,
          shop_name: shop.roleData?.shopName || "N/A",
          shop_description: shop.roleData?.shopDescription || "",
          product_count: productCount,
          pet_count: petCount,
          total_listings: productCount + petCount,
          registered_date: shop.createdAt,
        };
      }),
    );

    res.json({
      success: true,
      count: shopsWithCounts.length,
      shops: shopsWithCounts,
    });
  } catch (error) {
    console.error(
      "Error in server/controllers/admin/shopManagement.js (getAllShops):",
      error,
    );
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get shop details with all products and pets
 */
const getShopDetails = async (req, res) => {
  try {
    const { isValidObjectId } = require("mongoose");
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid shop ID" });
    }

    const shop = await User.findOne({
      _id: req.params.id,
      role: "shop",
    }).select("name email phone roleData createdAt");

    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    const products = await Product.find({ shopId: shop._id }).select(
      "name category price stock brand images isArchived createdAt",
    );

    const pets = await Pet.find({ shopId: shop._id }).select(
      "name type breed age price images isArchived available createdAt",
    );

    // Add owner info and upload date to each listing
    const productsWithOwner = products.map((product) => ({
      ...product.toObject(),
      owner_id: shop._id,
      owner_name: shop.name,
      owner_contact: shop.email,
      upload_date: product.createdAt,
    }));

    const petsWithOwner = pets.map((pet) => ({
      ...pet.toObject(),
      owner_id: shop._id,
      owner_name: shop.name,
      owner_contact: shop.email,
      upload_date: pet.createdAt,
    }));

    const Order = require("../../models/Order/order");
    const shopOrders = await Order.find({
      "items.shopId": shop._id,
      status: "delivered",
    });

    const lifetimeEarning = shopOrders.reduce((total, order) => {
      const shopItems = order.items.filter(
        (item) => item.shopId.toString() === shop._id.toString(),
      );
      const orderTotal = shopItems.reduce(
        (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
        0,
      );
      return total + orderTotal;
    }, 0);

    res.json({
      success: true,
      shop: {
        _id: shop._id,
        owner_name: shop.name,
        owner_email: shop.email,
        owner_phone: shop.phone,
        shop_name: shop.roleData?.shopName || "N/A",
        shop_description: shop.roleData?.shopDescription || "",
        shop_images: shop.roleData?.shopImages || [],
        open_time: shop.roleData?.openTime || "",
        close_time: shop.roleData?.closeTime || "",
        days_open: shop.roleData?.daysOpen || [],
        registered_date: shop.createdAt,
        lifetime_earning: lifetimeEarning,
      },
      products: {
        count: products.length,
        items: productsWithOwner,
      },
      pets: {
        count: pets.length,
        items: petsWithOwner,
      },
      total_listings: products.length + pets.length,
      lifetime_earning: lifetimeEarning,
    });
  } catch (error) {
    console.error(
      "Error in server/controllers/admin/shopManagement.js (getShopDetails):",
      error,
    );
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get shop products (view-only)
 */
const getShopProducts = async (req, res) => {
  try {
    const { isValidObjectId } = require("mongoose");
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid shop ID" });
    }

    const shop = await User.findOne({
      _id: req.params.id,
      role: "shop",
    }).select("name email");

    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    const products = await Product.find({ shopId: shop._id }).select(
      "name category price stock brand images ratings createdAt",
    );

    const productsWithOwner = products.map((product) => ({
      ...product.toObject(),
      owner_id: shop._id,
      owner_name: shop.name,
      owner_contact: shop.email,
      upload_date: product.createdAt,
    }));

    res.json({
      success: true,
      shop_id: shop._id,
      shop_name: shop.name,
      count: products.length,
      products: productsWithOwner,
    });
  } catch (error) {
    console.error(
      "Error in server/controllers/admin/shopManagement.js (getShopProducts):",
      error,
    );
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get shop pets (view-only)
 */
const getShopPets = async (req, res) => {
  try {
    const { isValidObjectId } = require("mongoose");
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid shop ID" });
    }

    const shop = await User.findOne({
      _id: req.params.id,
      role: "shop",
    }).select("name email");

    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    const pets = await Pet.find({ shopId: shop._id }).select(
      "name type breed age gender price images available vaccinated dewormed createdAt",
    );

    const petsWithOwner = pets.map((pet) => ({
      ...pet.toObject(),
      owner_id: shop._id,
      owner_name: shop.name,
      owner_contact: shop.email,
      upload_date: pet.createdAt,
    }));

    res.json({
      success: true,
      shop_id: shop._id,
      shop_name: shop.name,
      count: pets.length,
      pets: petsWithOwner,
    });
  } catch (error) {
    console.error(
      "Error in server/controllers/admin/shopManagement.js (getShopPets):",
      error,
    );
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllShops,
  getShopDetails,
  getShopProducts,
  getShopPets,
};
