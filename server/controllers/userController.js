const User = require("../models/user");
const fs = require("fs");
const path = require("path");

// GET PROFILE (WITH STAFF/DOCTOR POPULATE)
exports.getProfile = async (req, res) => {
  try {
    const id = req.user._id;

    let user = await User.findById(id).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role === "daycare") {
      user = await User.findById(id)
        .select("-password")
        .populate(
          "roleData.daycareStaffIds",
          "name phone availability roleData"
        );
    }

    if (user.role === "hospital") {
      user = await User.findById(id)
        .select("-password")
        .populate(
          "roleData.hospitalDoctorIds",
          "name phone availability roleData"
        );
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE PROFILE + ROLE DATA
exports.updateProfile = async (req, res) => {
  try {
    const id = req.user._id;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;

    user.address = {
      street: req.body["address.street"] || user.address.street,
      city: req.body["address.city"] || user.address.city,
      state: req.body["address.state"] || user.address.state,
      zipCode: req.body["address.zipCode"] || user.address.zipCode,
    };

    if (req.file) {
      if (user.avatar) {
        const oldPath = path.join(
          __dirname,
          "..",
          "uploads",
          "avatars",
          user.avatar
        );
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      user.avatar = req.file.filename;
    }

    if (req.body.roleData) {
      user.roleData = { ...user.roleData, ...req.body.roleData };
    }

    const updated = await user.save();

    res.json({
      _id: updated._id,
      name: updated.name,
      email: updated.email,
      phone: updated.phone,
      role: updated.role,
      address: updated.address,
      roleData: updated.roleData,
      avatar: updated.avatar,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE AVAILABILITY
exports.updateAvailability = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.availability = { ...user.availability, ...req.body };

    await user.save();
    res.json({
      message: "Availability updated",
      availability: user.availability,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ADD STAFF TO DAYCARE
exports.addStaffToDaycare = async (req, res) => {
  try {
    const daycare = await User.findById(req.user._id);
    const { staffId } = req.body;

    if (daycare.role !== "daycare")
      return res.status(403).json({ message: "Not a daycare" });

    daycare.roleData.daycareStaffIds.push(staffId);
    await daycare.save();

    res.json({ message: "Staff added" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ADD DOCTOR TO HOSPITAL
exports.addDoctorToHospital = async (req, res) => {
  try {
    const hospital = await User.findById(req.user._id);
    const { doctorId } = req.body;

    if (hospital.role !== "hospital")
      return res.status(403).json({ message: "Not a hospital" });

    hospital.roleData.hospitalDoctorIds.push(doctorId);
    await hospital.save();

    res.json({ message: "Doctor added" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
