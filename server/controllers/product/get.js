const Product = require("../../models/Product/product");

const getAllProducts = async (req, res) => {
  try {
    const { status } = req.query;
    const query =
      status === "archived"
        ? { isArchived: true }
        : { isArchived: { $ne: true } };

    const products = await Product.find(query)
      .populate({
        path: "shopId",
        match: { isVerified: true, isArchived: false },
        select: "name businessName",
      })
      .sort({ createdAt: -1 });

    // Filter out products where shop is missing or doesn't match criteria
    const filteredProducts = products.filter((p) => p.shopId);
    res.json({ products: filteredProducts });
  } catch (error) {
    console.error(
      "Error in server/controllers/product/get.js (getAllProducts):",
      error,
    );
    res.status(500).json({ message: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      isArchived: { $ne: true },
    })
      .populate({
        path: "shopId",
        match: { isVerified: true, isArchived: false },
        select: "name businessName avatar isVerified isArchived",
      })
      .populate("ratings.userId", "name");

    if (!product || !product.shopId) {
      return res
        .status(404)
        .json({ message: "Product not found or unavailable" });
    }
    res.json(product);
  } catch (error) {
    console.error(
      "Error in server/controllers/product/get.js (getProductById):",
      error,
    );
    res.status(500).json({ message: error.message });
  }
};

const getProductsByShop = async (req, res) => {
  try {
    const { shopId } = req.params;
    const products = await Product.find({
      shopId,
      isArchived: { $ne: true },
    })
      .populate({
        path: "shopId",
        match: { isVerified: true, isArchived: false },
        select: "name businessName email",
      })
      .sort({ createdAt: -1 });

    const filteredProducts = products.filter((p) => p.shopId);
    res.json({ products: filteredProducts });
  } catch (error) {
    console.error(
      "Error in server/controllers/product/get.js (getProductsByShop):",
      error,
    );
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  getProductsByShop,
};
