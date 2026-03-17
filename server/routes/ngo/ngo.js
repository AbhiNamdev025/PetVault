const express = require("express");
const router = express.Router();

const {
  createUserForRole,
  getUsersByRole,
  getUserById,
  updateUser,
  deleteUser,
} = require("../../controllers/role");

const { getPetsByNgo } = require("../../controllers/pet");
const { rateNgo } = require("../../controllers/rating");
const { protect } = require("../../middleware/Auth/authMiddleware");
const { roleUpload } = require("../../middleware/Multer/upload");

router.post("/", roleUpload, createUserForRole("ngo"));
router.get("/", getUsersByRole("ngo"));
router.get("/:id", getUserById);

router.get("/:id/pets", getPetsByNgo);

router.put("/:id", protect, roleUpload, updateUser);
router.delete("/:id", protect, deleteUser);

router.post("/:id/rate", protect, rateNgo);

module.exports = router;
