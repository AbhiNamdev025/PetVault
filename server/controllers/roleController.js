const User = require("../models/user");
const bcrypt = require("bcryptjs");

exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const updates = {};

    if (req.body.name !== undefined) updates.name = req.body.name;
    if (req.body.email !== undefined) updates.email = req.body.email;
    if (req.body.phone !== undefined) updates.phone = req.body.phone;

    if (req.body.address) {
      try {
        updates.address =
          typeof req.body.address === "string"
            ? JSON.parse(req.body.address)
            : req.body.address;
      } catch {
        updates.address = {
          street: req.body["address.street"] || "",
          city: req.body["address.city"] || "",
          state: req.body["address.state"] || "",
          zipCode: req.body["address.zipCode"] || "",
        };
      }
    }

    if (req.body.roleData) {
      try {
        updates.roleData =
          typeof req.body.roleData === "string"
            ? JSON.parse(req.body.roleData)
            : req.body.roleData;
      } catch {
        updates.roleData = {};
        Object.keys(req.body).forEach((key) => {
          if (key.startsWith("roleData.")) {
            const field = key.replace("roleData.", "");
            updates.roleData[field] = req.body[key];
          }
        });
      }
    }

    if (req.body.availability) {
      try {
        updates.availability =
          typeof req.body.availability === "string"
            ? JSON.parse(req.body.availability)
            : req.body.availability;
      } catch {
        updates.availability = {
          available: req.body["availability.available"] === "true",
          days: req.body["availability.days"]
            ? JSON.parse(req.body["availability.days"])
            : [],
          startTime: req.body["availability.startTime"] || "",
          endTime: req.body["availability.endTime"] || "",
          serviceRadius: req.body["availability.serviceRadius"] || "",
          statusNote: req.body["availability.statusNote"] || "",
        };
      }
    }

    if (req.files) {
      if (req.files.avatar && req.files.avatar[0]) {
        updates.avatar = req.files.avatar[0].filename;
      }
      if (req.files.roleImages && req.files.roleImages.length > 0) {
        updates.roleData = updates.roleData || {};
        updates.roleData.images = req.files.roleImages.map((f) => f.filename);
      }
    }

    const updated = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updated) return res.status(404).json({ message: "User not found" });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createUserForRole = (role) => async (req, res) => {
  try {
    let data = req.body;
    data.role = role;

    if (!data.roleData || data.roleData.trim() === "") {
      data.roleData = {};
    } else if (typeof data.roleData === "string") {
      try {
        data.roleData = JSON.parse(data.roleData);
      } catch {
        data.roleData = {};
      }
    }

    if (req.file) {
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
        "roleData.daycareName"
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
    console.log("CREATE ROLE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.getUsersByRole = (role) => async (req, res) => {
  try {
    const users = await User.find({ role }).select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "Not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
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
    res.status(500).json({ message: err.message });
  }
};

exports.getCaretakersByDaycare = async (req, res) => {
  try {
    const { daycareId } = req.params;

    const caretakers = await User.find({
      role: "caretaker",
      "roleData.daycareId": daycareId,
    }).select("-password");

    res.json({ caretakers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
