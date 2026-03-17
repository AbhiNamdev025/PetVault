const express = require("express");
const router = express.Router();

const {
  createUserForRole,
  getUsersByRole,
  getUserById,
  updateUser,
  deleteUser,
} = require("../../controllers/role");

const { rateShop } = require("../../controllers/rating");
const { protect } = require("../../middleware/Auth/authMiddleware");
const { roleUpload } = require("../../middleware/Multer/upload");

router.post("/", roleUpload, createUserForRole("shop"));
router.get("/", getUsersByRole("shop"));
router.put("/:id", protect, roleUpload, updateUser);
router.delete("/:id", protect, deleteUser);
router.get("/:id", getUserById);

router.post("/:id/rate", protect, rateShop);

module.exports = router;
