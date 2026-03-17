const { getUserPets, getUserPetById } = require("./get");
const { addUserPet } = require("./post");
const { updateUserPet, restoreUserPet } = require("./put");
const { deleteUserPet } = require("./delete");

module.exports = {
  getUserPets,
  getUserPetById,
  addUserPet,
  updateUserPet,
  deleteUserPet,
  restoreUserPet
};
