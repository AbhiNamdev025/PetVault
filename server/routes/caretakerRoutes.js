const express = require("express");
const router = express.Router();

const {
  createUserForRole,
  getUsersByRole,
  getUserById,
  updateUser,
  deleteUser,
} = require("../controllers/roleController");

const { rateCaretaker } = require("../controllers/ratingController");
const { protect } = require("../middleware/authMiddleware");
const { roleUpload } = require("../middleware/upload");

router.post("/", roleUpload, createUserForRole("caretaker"));
router.get("/", getUsersByRole("caretaker"));

router.post("/:id/rate", protect, rateCaretaker);

router.get("/:id", getUserById);
router.put("/:id", roleUpload, updateUser);
router.delete("/:id", deleteUser);

module.exports = router;
