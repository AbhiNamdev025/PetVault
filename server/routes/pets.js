// const express = require("express");
// const {
//   getAllPets,
//   getPetById,
//   createPet,
//   updatePet,
//   deletePet,
//   deletePetImage,
//   getPetsByShop,
//   getPetsByNgo,
// } = require("../controllers/petController");
// const { protect } = require("../middleware/authMiddleware");
// const { uploadPetImages } = require("../middleware/upload");

// const router = express.Router();

// router.get("/", getAllPets);
// router.get("/shop/:shopId", getPetsByShop);
// router.get("/ngo/:ngoId", getPetsByNgo);
// router.get("/:id", getPetById);
// router.post("/create", protect, uploadPetImages, createPet);
// router.put("/:id", protect, uploadPetImages, updatePet);
// router.delete("/:id", protect, deletePet);
// router.delete("/:id/image/:imageName", protect, deletePetImage);

// module.exports = router;

const express = require("express");
const {
  getAllPets,
  getPetById,
  createPet,
  updatePet,
  deletePet,
  getPetsByShop,
  getPetsByNgo,
} = require("../controllers/petController");

const { protect } = require("../middleware/authMiddleware");
const { uploadPetImages } = require("../middleware/upload");

const router = express.Router();

router.get("/", getAllPets);
router.get("/shop/:shopId", getPetsByShop);
router.get("/ngo/:ngoId", getPetsByNgo);
router.get("/:id", getPetById);

router.post("/create", protect, uploadPetImages, createPet);
router.put("/:id", protect, uploadPetImages, updatePet);
router.delete("/:id", protect, deletePet);

module.exports = router;
