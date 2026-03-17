const UserPet = require("../../models/UserPet/userPet");

// Delete a pet
const deleteUserPet = async (req, res) => {
  try {
    const { id } = req.params;
    const { isValidObjectId } = require("mongoose");
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid pet ID format" });
    }

    const deletedPet = await UserPet.findOneAndUpdate(
      { _id: id, owner: req.user._id },
      { status: "archived", deletedAt: new Date() },
      { new: true },
    );

    if (!deletedPet) {
      return res.status(404).json({ message: "Pet not found" });
    }

    res.json({ message: "Pet archived successfully" });
  } catch (error) {
    console.error(
      "Error in server/controllers/userPet/delete.js (deleteUserPet):",
      error,
    );
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  deleteUserPet,
};
