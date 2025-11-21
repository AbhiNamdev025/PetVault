const express = require("express");
const router = express.Router();

const {
  createUserForRole,
  getUsersByRole,
  getUserById,
  updateUser,
  deleteUser,
} = require("../controllers/roleController");

const { getPetsByNgo } = require("../controllers/petController");
const { rateNgo } = require("../controllers/ratingController");
const { protect } = require("../middleware/authMiddleware");
const { roleUpload } = require("../middleware/upload");

router.post("/", roleUpload, createUserForRole("ngo"));
router.get("/", getUsersByRole("ngo"));
router.get("/:id", getUserById);

router.get("/:id/pets", getPetsByNgo);

router.put("/:id", roleUpload, updateUser);
router.delete("/:id", deleteUser);

router.post("/:id/rate", protect, rateNgo);

module.exports = router;
