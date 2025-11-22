const express = require("express");
const router = express.Router();

const {
  createUserForRole,
  getUsersByRole,
  getUserById,
  updateUser,
  deleteUser,
} = require("../controllers/roleController");

const { rateShop } = require("../controllers/ratingController");
const { protect } = require("../middleware/authMiddleware");
const { roleUpload } = require("../middleware/upload");

router.post("/", roleUpload, createUserForRole("shop"));
router.get("/", getUsersByRole("shop"));
router.put("/:id", roleUpload, updateUser);
router.delete("/:id", deleteUser);
router.get("/:id", getUserById);

router.post("/:id/rate", protect, rateShop);

module.exports = router;
