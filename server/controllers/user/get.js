const User = require("../../models/User/user");

// GET PROFILE (WITH STAFF/DOCTOR POPULATE)
const getProfile = async (req, res) => {
  try {
    const id = req.user._id;
    let user = await User.findById(id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role === "daycare") {
      user = await User.findById(id)
        .select("-password")
        .populate(
          "roleData.daycareStaffIds",
          "name phone availability roleData",
        );
    }

    if (user.role === "hospital") {
      user = await User.findById(id)
        .select("-password")
        .populate(
          "roleData.hospitalDoctorIds",
          "name phone availability roleData",
        );
    }

    res.json(user);
  } catch (err) {
    console.error("Error in server/controllers/user/get.js (getProfile):", err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getProfile,
};
