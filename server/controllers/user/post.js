const User = require("../../models/User/user");

// ADD STAFF TO DAYCARE
const addStaffToDaycare = async (req, res) => {
  try {
    const daycare = await User.findById(req.user._id);
    const { staffId } = req.body;

    if (daycare.role !== "daycare")
      return res.status(403).json({ message: "Not a daycare" });

    const { isValidObjectId } = require("mongoose");
    if (!isValidObjectId(staffId)) {
      return res.status(400).json({ message: "Invalid staff ID" });
    }

    daycare.roleData.daycareStaffIds.push(staffId);
    await daycare.save();

    res.json({ message: "Staff added" });
  } catch (err) {
    console.error(
      "Error in server/controllers/user/post.js (addStaffToDaycare):",
      err,
    );
    res.status(500).json({ message: err.message });
  }
};

// ADD DOCTOR TO HOSPITAL
const addDoctorToHospital = async (req, res) => {
  try {
    const hospital = await User.findById(req.user._id);
    const { doctorId } = req.body;

    if (hospital.role !== "hospital")
      return res.status(403).json({ message: "Not a hospital" });

    const { isValidObjectId } = require("mongoose");
    if (!isValidObjectId(doctorId)) {
      return res.status(400).json({ message: "Invalid doctor ID" });
    }

    hospital.roleData.hospitalDoctorIds.push(doctorId);
    await hospital.save();

    res.json({ message: "Doctor added" });
  } catch (err) {
    console.error(
      "Error in server/controllers/user/post.js (addDoctorToHospital):",
      err,
    );
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  addStaffToDaycare,
  addDoctorToHospital,
};
