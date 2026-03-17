const express = require("express");
const router = express.Router();
const userPetController = require("../../controllers/userPet");
const { protect } = require("../../middleware/Auth/authMiddleware");
const { upload } = require("../../middleware/Multer/upload");

// Add a pet
router.post(
  "/",
  protect,
  upload.single("profileImage"),
  userPetController.addUserPet,
);

// Get all pets for a user
router.get("/", protect, userPetController.getUserPets);

// Get single pet by ID
router.get("/:id", protect, userPetController.getUserPetById);

// Update a pet
router.put(
  "/:id",
  protect,
  upload.single("profileImage"),
  userPetController.updateUserPet,
);

// Restore an archived pet
router.put("/:id/restore", protect, userPetController.restoreUserPet);

// Delete a pet
router.delete("/:id", protect, userPetController.deleteUserPet);

module.exports = router;
