const express = require("express");
const router = express.Router();

const {
  createUserForRole,
  getUsersByRole,
  getUserById,
  updateUser,
  deleteUser,
} = require("../controllers/roleController");

const { rateDoctor } = require("../controllers/ratingController");
const { protect } = require("../middleware/authMiddleware");
const { roleUpload } = require("../middleware/upload");

router.post("/", roleUpload, createUserForRole("doctor"));
router.get("/", getUsersByRole("doctor"));
router.get("/:id", getUserById);
router.put("/:id", roleUpload, updateUser);
router.delete("/:id", deleteUser);

router.post("/:id/rate", protect, rateDoctor);

module.exports = router;
