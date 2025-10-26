const express = require("express");
const {
  getAllPets,
  getPetById,
  createPet,
  updatePet,
  deletePet,
} = require("../controllers/petController");
const { protect, admin } = require("../middleware/authMiddleware");
const { uploadPetImages } = require("../middleware/uploadMiddleware");

const router = express.Router();

router.get("/", getAllPets);
router.get("/:id", getPetById);
router.post("/", protect, admin, uploadPetImages, createPet);
router.put("/:id", protect, admin, updatePet);
router.delete("/:id", protect, admin, deletePet);

module.exports = router;
