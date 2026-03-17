const express = require("express");
const router = express.Router();

const {
  createUserForRole,
  getUsersByRole,
  getUserById,
  updateUser,
  deleteUser,
  getCaretakersByDaycare,
} = require("../../controllers/role");

const { rateDaycare } = require("../../controllers/rating");
const { protect } = require("../../middleware/Auth/authMiddleware");
const { roleUpload } = require("../../middleware/Multer/upload");

router.post("/", roleUpload, createUserForRole("daycare"));
router.get("/", getUsersByRole("daycare"));
router.get("/:id", getUserById);
router.put("/:id", protect, roleUpload, updateUser);
router.delete("/:id", protect, deleteUser);

router.post("/:id/rate", protect, rateDaycare);

router.get("/staff/:daycareId", getCaretakersByDaycare);

module.exports = router;
