const User = require("../../models/User/user");

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { isValidObjectId } = require("mongoose");
    if (!isValidObjectId(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    await User.findByIdAndDelete(userId);

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(
      "Error in server/controllers/admin/delete.js (deleteUser):",
      error,
    );
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  deleteUser,
};
