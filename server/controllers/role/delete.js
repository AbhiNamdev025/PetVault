const User = require("../../models/User/user");

const deleteUser = async (req, res) => {
  try {
    const { isValidObjectId } = require("mongoose");
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid User ID format" });
    }

    const u = await User.findById(req.params.id);
    if (!u) return res.status(404).json({ message: "Not found" });

    if (u.role === "doctor") {
      await User.findByIdAndUpdate(u.roleData.hospitalId, {
        $pull: { "roleData.hospitalDoctorIds": u._id },
      });
    }

    if (u.role === "caretaker") {
      await User.findByIdAndUpdate(u.roleData.daycareId, {
        $pull: { "roleData.daycareStaffIds": u._id },
      });
    }

    await u.deleteOne();

    res.json({ message: "Deleted" });
  } catch (err) {
    console.error(
      "Error in server/controllers/role/delete.js (deleteUser):",
      err,
    );
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  deleteUser,
};
