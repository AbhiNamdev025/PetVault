const User = require("../../models/User/user");
const bcrypt = require("bcryptjs");

const createUserForRole = (role) => async (req, res) => {
  try {
    let data = req.body;
    data.role = role;

    // Validate required fields
    if (!data.name || !data.email || !data.password) {
      return res
        .status(400)
        .json({ message: "Name, email and password are required" });
    }

    // Email format validation
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(data.email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (!data.roleData || data.roleData.trim() === "") {
      data.roleData = {};
    } else if (typeof data.roleData === "string") {
      try {
        data.roleData = JSON.parse(data.roleData);
      } catch {
        return res
          .status(400)
          .json({ message: "Invalid roleData JSON format" }); // Better error than silent ignore?
      }
    }

    // Support both single-file and fields-based uploads (roleUpload.fields)
    if (req.files && req.files.avatar && req.files.avatar[0]) {
      data.avatar = req.files.avatar[0].filename;
    } else if (req.file) {
      data.avatar = req.file.filename;
    }

    if (req.files && req.files.roleImages) {
      const imgs = req.files.roleImages.map((f) => f.filename);

      if (role === "doctor") data.roleData.doctorImages = imgs;
      if (role === "caretaker") data.roleData.caretakerImages = imgs;
      if (role === "daycare") data.roleData.daycareImages = imgs;
      if (role === "hospital") data.roleData.hospitalImages = imgs;
      if (role === "shop") data.roleData.shopImages = imgs;
      if (role === "ngo") data.roleData.ngoImages = imgs;
    }

    if (data.password && data.password !== "") {
      data.password = await bcrypt.hash(data.password, 12);
    }

    if (role === "doctor" && !data.roleData.hospitalId) {
      return res.status(400).json({ message: "Hospital ID required" });
    }

    if (role === "caretaker") {
      const daycare = await User.findById(data.roleData.daycareId).select(
        "roleData.daycareName",
      );
      data.roleData.daycareName = daycare?.roleData?.daycareName || null;
    }

    const newUser = await User.create(data);

    if (role === "doctor") {
      await User.findByIdAndUpdate(data.roleData.hospitalId, {
        $push: { "roleData.hospitalDoctorIds": newUser._id },
      });
    }

    if (role === "caretaker") {
      await User.findByIdAndUpdate(data.roleData.daycareId, {
        $push: { "roleData.daycareStaffIds": newUser._id },
      });
    }

    res.status(201).json(newUser);
  } catch (err) {
    console.error(
      "Error in server/controllers/role/post.js (createUserForRole):",
      err,
    );
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createUserForRole,
};
