const {
  getAllPets,
  getPetById,
  getPetsByShop,
  getPetsByNgo,
  getMyProviderPets,
  getEligibleBuyersForPet,
} = require("./get");
const { createPet } = require("./post");
const { updatePet, restorePet, markPetAsSoldToUser } = require("./put");
const { deletePet, deletePetImage } = require("./delete");

module.exports = {
  getAllPets,
  getPetById,
  createPet,
  updatePet,
  deletePet,
  deletePetImage,
  getPetsByShop,
  getPetsByNgo,
  getMyProviderPets,
  getEligibleBuyersForPet,
  restorePet,
  markPetAsSoldToUser,
};
