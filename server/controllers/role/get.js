const User = require("../../models/User/user");

const getUsersByRole = (role) => async (req, res) => {
  try {
    const query = { role };

    // Strict filtering for providers (exclude unverified/archived)
    if (role !== "admin" && role !== "user") {
      query.isVerified = true;
      query.isArchived = { $ne: true };
    }

    const users = await User.find(query)
      .select("-password")
      .populate("ratings.userId", "name");

    // Enrich users and filter by parent organization status for sub-roles
    const enrichedUsers = (
      await Promise.all(
        users.map(async (u) => {
          let userObj = u.toObject();

          // Check Parent Hospital for Doctors
          if (role === "doctor") {
            const hospitalId = userObj.roleData?.hospitalId;
            if (hospitalId) {
              const hospital = await User.findById(hospitalId).select(
                "isVerified isArchived name roleData.hospitalName",
              );
              // Only hide if hospital explicitly exists but is unverified/archived
              if (hospital && (!hospital.isVerified || hospital.isArchived)) {
                return null; // Parent inactive, hide doctor
              }
              if (hospital) {
                userObj.roleData.hospitalName =
                  hospital.roleData?.hospitalName || hospital.name;
              }
            }
          }

          // Check Parent Daycare for Caretakers
          if (role === "caretaker") {
            const daycareId = userObj.roleData?.daycareId;
            if (daycareId) {
              const daycare = await User.findById(daycareId).select(
                "isVerified isArchived name roleData.daycareName",
              );
              if (daycare && (!daycare.isVerified || daycare.isArchived)) {
                return null; // Parent inactive, hide caretaker
              }
              if (daycare) {
                userObj.roleData.daycareName =
                  daycare.roleData?.daycareName || daycare.name;
              }
            }
          }

          // Handle reverse lookups if parent IDs are missing but linkage exists
          if (role === "caretaker" && !userObj.roleData?.daycareId) {
            const daycare = await User.findOne({
              "roleData.daycareStaffIds": u._id,
              isVerified: true,
              isArchived: { $ne: true },
            }).select("name roleData.daycareName");
            if (daycare) {
              if (!userObj.roleData) userObj.roleData = {};
              userObj.roleData.daycareId = daycare._id;
              userObj.roleData.daycareName =
                daycare.roleData?.daycareName || daycare.name;
            }
          }

          if (role === "doctor" && !userObj.roleData?.hospitalId) {
            const hospital = await User.findOne({
              "roleData.hospitalDoctorIds": u._id,
              isVerified: true,
              isArchived: { $ne: true },
            }).select("name roleData.hospitalName");
            if (hospital) {
              if (!userObj.roleData) userObj.roleData = {};
              userObj.roleData.hospitalId = hospital._id;
              userObj.roleData.hospitalName =
                hospital.roleData?.hospitalName || hospital.name;
            }
          }

          return userObj;
        }),
      )
    ).filter((u) => u !== null); // Remove hidden sub-providers

    res.json(enrichedUsers);
  } catch (err) {
    console.error(
      "Error in server/controllers/role/get.js (getUsersByRole):",
      err,
    );
    res.status(500).json({ message: err.message });
  }
};

const { isValidObjectId } = require("mongoose");

const getUserById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid User ID format" });
    }

    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("roleData.daycareStaffIds", "name email phone")
      .populate("roleData.hospitalDoctorIds", "name email phone")
      .populate("ratings.userId", "name");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hide unverified or archived providers from public view
    if (
      user.role !== "admin" &&
      user.role !== "user" &&
      (!user.isVerified || user.isArchived)
    ) {
      return res
        .status(404)
        .json({ message: "Provider unavailable or archived" });
    }

    let userObj = user.toObject();

    // Fix for missing parent linkage (Reverse Lookup)
    if (user.role === "caretaker" && !userObj.roleData?.daycareId) {
      const daycare = await User.findOne({
        "roleData.daycareStaffIds": user._id,
      }).select("name roleData.daycareName");

      if (daycare) {
        if (!userObj.roleData) userObj.roleData = {};
        userObj.roleData.daycareId = daycare._id;
        userObj.roleData.daycareName =
          daycare.roleData?.daycareName || daycare.name;
      }
    }

    if (user.role === "doctor" && !userObj.roleData?.hospitalId) {
      const hospital = await User.findOne({
        "roleData.hospitalDoctorIds": user._id,
      }).select("name roleData.hospitalName");

      if (hospital) {
        if (!userObj.roleData) userObj.roleData = {};
        userObj.roleData.hospitalId = hospital._id;
        userObj.roleData.hospitalName =
          hospital.roleData?.hospitalName || hospital.name;
      }
    }

    res.json(userObj);
  } catch (err) {
    console.error(
      "Error in server/controllers/role/get.js (getUserById):",
      err,
    );
    res.status(500).json({ message: err.message });
  }
};

const getCaretakersByDaycare = async (req, res) => {
  try {
    const { daycareId } = req.params;
    if (!isValidObjectId(daycareId)) {
      return res.status(400).json({ message: "Invalid Daycare ID format" });
    }

    // Find daycare to get explicit staff list
    const daycare = await User.findById(daycareId).select(
      "roleData.daycareStaffIds",
    );
    const explicitStaffIds = daycare?.roleData?.daycareStaffIds || [];

    const caretakers = await User.find({
      $or: [
        { role: "caretaker", "roleData.daycareId": daycareId },
        { _id: { $in: explicitStaffIds } },
      ],
    }).select("-password");

    res.json({ caretakers });
  } catch (err) {
    console.error(
      "Error in server/controllers/role/get.js (getCaretakersByDaycare):",
      err,
    );
    res.status(500).json({ message: err.message });
  }
};

const getDoctorsByHospital = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    if (!isValidObjectId(hospitalId)) {
      return res.status(400).json({ message: "Invalid Hospital ID format" });
    }

    // Find hospital to get explicit doctor list
    const hospital = await User.findById(hospitalId).select(
      "roleData.hospitalDoctorIds",
    );
    const explicitDoctorIds = hospital?.roleData?.hospitalDoctorIds || [];

    const doctors = await User.find({
      $or: [
        { role: "doctor", "roleData.hospitalId": hospitalId },
        { _id: { $in: explicitDoctorIds } },
      ],
    }).select("-password");

    res.json({ doctors });
  } catch (err) {
    console.error(
      "Error in server/controllers/role/get.js (getDoctorsByHospital):",
      err,
    );
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getUsersByRole,
  getUserById,
  getCaretakersByDaycare,
  getDoctorsByHospital,
};
