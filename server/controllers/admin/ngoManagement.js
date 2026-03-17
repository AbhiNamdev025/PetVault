const User = require("../../models/User/user");
const Pet = require("../../models/Pet/pet");

/**
 * Get NGO details with all pets for adoption
 */
const getNgoDetails = async (req, res) => {
  try {
    const { isValidObjectId } = require("mongoose");
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid NGO ID" });
    }

    const ngo = await User.findOne({
      _id: req.params.id,
      role: "ngo",
    }).select("name email phone roleData createdAt");

    if (!ngo) {
      return res.status(404).json({ message: "NGO not found" });
    }

    const pets = await Pet.find({ ngoId: ngo._id }).select(
      "name type breed age gender price images available vaccinated dewormed isArchived createdAt",
    );

    // Add owner info and upload date to each listing
    const petsWithOwner = pets.map((pet) => ({
      ...pet.toObject(),
      owner_id: ngo._id,
      owner_name: ngo.name,
      owner_contact: ngo.email,
      upload_date: pet.createdAt,
    }));

    // Calculate Lifetime Earnings (from adoptions/orders)
    const Order = require("../../models/Order/order");
    const ngoOrders = await Order.find({
      "items.shopId": ngo._id, // NGOs might also use shopId for tracking adoptions
      status: "delivered",
    });

    const lifetimeEarning = ngoOrders.reduce((total, order) => {
      const ngoItems = order.items.filter(
        (item) => item.shopId.toString() === ngo._id.toString(),
      );
      const orderTotal = ngoItems.reduce(
        (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
        0,
      );
      return total + orderTotal;
    }, 0);

    res.json({
      success: true,
      ngo: {
        _id: ngo._id,
        owner_name: ngo.name,
        owner_email: ngo.email,
        owner_phone: ngo.phone,
        ngo_name: ngo.roleData?.ngoName || "N/A",
        ngo_description: ngo.roleData?.ngoDescription || "",
        ngo_address: ngo.roleData?.address || "",
        ngo_capacity: ngo.roleData?.maxPetsAllowed || "N/A",
        registered_date: ngo.createdAt,
        lifetime_earning: lifetimeEarning,
      },
      pets: {
        count: pets.length,
        items: petsWithOwner,
      },
      total_listings: pets.length,
      lifetime_earning: lifetimeEarning,
    });
  } catch (error) {
    console.error(
      "Error in server/controllers/admin/ngoManagement.js (getNgoDetails):",
      error,
    );
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getNgoDetails,
};
