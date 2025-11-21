const express = require("express");
const router = express.Router();
const User = require("../models/user");

const {
  createUserForRole,
  getUsersByRole,
  getUserById,
  updateUser,
  deleteUser,
} = require("../controllers/roleController");

const { rateDaycare } = require("../controllers/ratingController");
const { protect } = require("../middleware/authMiddleware");
const { roleUpload } = require("../middleware/upload");

router.post("/", roleUpload, createUserForRole("daycare"));
router.get("/", getUsersByRole("daycare"));
router.get("/:id", getUserById);
router.put("/:id", roleUpload, updateUser);
router.delete("/:id", deleteUser);

router.post("/:id/rate", protect, rateDaycare);

router.get("/staff/:daycareId", async (req, res) => {
  const { daycareId } = req.params;

  const daycare = await User.findById(daycareId)
    .populate("roleData.daycareStaffIds")
    .select("-password");

  if (!daycare) return res.status(404).json({ message: "Not found" });

  res.json({ caretakers: daycare.roleData.daycareStaffIds || [] });
});

module.exports = router;
