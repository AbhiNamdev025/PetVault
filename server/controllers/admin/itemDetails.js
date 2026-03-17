const Product = require("../../models/Product/product");
const Pet = require("../../models/Pet/pet");

// Get a single product (Admin view - includes archived)
const getAdminProductDetails = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "shopId",
      "name email",
    );
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single pet (Admin view - includes archived)
const getAdminPetDetails = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id)
      .populate("shopId", "name email")
      .populate("ngoId", "name email");
    if (!pet) {
      return res.status(404).json({ message: "Pet not found" });
    }
    res.json(pet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAdminProductDetails,
  getAdminPetDetails,
};
