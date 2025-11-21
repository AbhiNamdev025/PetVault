const express = require("express");
const router = express.Router();

const {
  createUserForRole,
  getUsersByRole,
  getUserById,
  updateUser,
  deleteUser,
} = require("../controllers/roleController");
const { rateHospital } = require("../controllers/ratingController");
const { roleUpload } = require("../middleware/upload");
const { protect } = require("../middleware/authMiddleware");

const User = require("../models/user");

router.get("/doctors/:hospitalId", async (req, res) => {
  try {
    const hospitalId = req.params.hospitalId;

    const hospital = await User.findById(hospitalId);

    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    const doctorIds = hospital?.roleData?.hospitalDoctorIds || [];

    const doctors = await User.find({
      _id: { $in: doctorIds },
    }).select("-password");

    return res.json({ doctors });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get("/", getUsersByRole("hospital"));

router.get("/:id", getUserById);

router.put("/:id", protect, roleUpload, updateUser);

router.delete("/:id", protect, deleteUser);
router.post("/:id/rate", protect, rateHospital);

module.exports = router;
