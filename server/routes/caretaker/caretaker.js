const express = require("express");
const router = express.Router();

const {
  createUserForRole,
  getUsersByRole,
  getUserById,
  updateUser,
  deleteUser,
} = require("../../controllers/role");

const { rateCaretaker } = require("../../controllers/rating");
const { protect } = require("../../middleware/Auth/authMiddleware");
const { roleUpload } = require("../../middleware/Multer/upload");

router.post("/", roleUpload, createUserForRole("caretaker"));
router.get("/", getUsersByRole("caretaker"));

router.post("/:id/rate", protect, rateCaretaker);

router.get("/:id", getUserById);
router.put("/:id", protect, roleUpload, updateUser);
router.delete("/:id", protect, deleteUser);

module.exports = router;
