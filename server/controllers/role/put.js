const User = require("../../models/User/user");

const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { isValidObjectId } = require("mongoose");
    if (!isValidObjectId(userId)) {
      return res.status(400).json({ message: "Invalid User ID format" });
    }

    const updates = {};

    if (req.body.name !== undefined) updates.name = req.body.name;
    if (req.body.email !== undefined) {
      if (!/^\S+@\S+\.\S+$/.test(req.body.email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }
      updates.email = req.body.email;
    }
    if (req.body.phone !== undefined) updates.phone = req.body.phone;

    if (req.body.address) {
      try {
        updates.address =
          typeof req.body.address === "string"
            ? JSON.parse(req.body.address)
            : req.body.address;
      } catch {
        updates.address = {
          street: req.body["address.street"] || "",
          city: req.body["address.city"] || "",
          state: req.body["address.state"] || "",
          zipCode: req.body["address.zipCode"] || "",
        };
      }
    }

    if (req.body.roleData) {
      try {
        const roleData =
          typeof req.body.roleData === "string"
            ? JSON.parse(req.body.roleData)
            : req.body.roleData;

        // Merge roleData instead of replacing
        updates.roleData = {
          ...(await User.findById(userId)).roleData?.toObject(),
          ...roleData,
        };
      } catch {
        updates.roleData = {};
        Object.keys(req.body).forEach((key) => {
          if (key.startsWith("roleData.")) {
            const field = key.replace("roleData.", "");
            updates.roleData[field] = req.body[key];
          }
        });
      }
    }

    if (req.body.availability) {
      try {
        updates.availability =
          typeof req.body.availability === "string"
            ? JSON.parse(req.body.availability)
            : req.body.availability;
      } catch {
        updates.availability = {
          available: req.body["availability.available"] === "true",
          days: req.body["availability.days"]
            ? JSON.parse(req.body["availability.days"])
            : [],
          startTime: req.body["availability.startTime"] || "",
          endTime: req.body["availability.endTime"] || "",
          serviceRadius: req.body["availability.serviceRadius"] || "",
          statusNote: req.body["availability.statusNote"] || "",
        };
      }
    }

    if (req.files) {
      if (req.files.avatar && req.files.avatar[0]) {
        updates.avatar = req.files.avatar[0].filename;
      }
      if (req.files.roleImages && req.files.roleImages.length > 0) {
        updates.roleData = updates.roleData || {};
        updates.roleData.images = req.files.roleImages.map((f) => f.filename);
      }
    }

    const updated = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true },
    ).select("-password");

    if (!updated) return res.status(404).json({ message: "User not found" });

    res.json(updated);
  } catch (err) {
    console.error("Error in server/controllers/role/put.js (updateUser):", err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  updateUser,
};
