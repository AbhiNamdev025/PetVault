const express = require("express");
const {
  getAllPets,
  getPetById,
  createPet,
  updatePet,
  deletePet,
  getPetsByShop,
  getPetsByNgo,
  getMyProviderPets,
  getEligibleBuyersForPet,
  deletePetImage,
  restorePet,
  markPetAsSoldToUser,
} = require("../../controllers/pet");

const { protect, admin } = require("../../middleware/Auth/authMiddleware");
const { uploadPetImages } = require("../../middleware/Multer/upload");

const router = express.Router();

router.get("/", getAllPets);
router.get("/provider/my-pets", protect, getMyProviderPets);
router.get("/shop/:shopId", getPetsByShop);
router.get("/ngo/:ngoId", getPetsByNgo);
router.get("/:id/eligible-buyers", protect, getEligibleBuyersForPet);
router.get("/:id", getPetById);

router.post("/create", protect, uploadPetImages, createPet);
router.put("/:id", protect, uploadPetImages, updatePet);
router.put("/:id/sell", protect, markPetAsSoldToUser);
router.put("/:id/restore", protect, admin, restorePet);
router.delete("/:id", protect, deletePet);
router.delete("/:id/image/:imageName", protect, deletePetImage);

module.exports = router;
