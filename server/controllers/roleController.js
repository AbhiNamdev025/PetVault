const User = require("../models/user");

exports.updateUser = async (req, res) => {
  try {
    console.log("=== UPDATE USER REQUEST ===");
    console.log("Body:", req.body);
    console.log("Files:", req.files);
    console.log("Params:", req.params);

    const userId = req.params.id;
    const updates = {};

    // 1. BASIC FIELDS - Simple assignment
    if (req.body.name !== undefined) updates.name = req.body.name;
    if (req.body.email !== undefined) updates.email = req.body.email;
    if (req.body.phone !== undefined) updates.phone = req.body.phone;

    // 2. ADDRESS - Simple object assignment
    if (req.body.address) {
      try {
        // If address is sent as JSON string, parse it
        updates.address =
          typeof req.body.address === "string"
            ? JSON.parse(req.body.address)
            : req.body.address;
      } catch (error) {
        updates.address = {
          street: req.body["address.street"] || "",
          city: req.body["address.city"] || "",
          state: req.body["address.state"] || "",
          zipCode: req.body["address.zipCode"] || "",
        };
      }
    }

    // 3. ROLE DATA - Simple assignment
    if (req.body.roleData) {
      try {
        updates.roleData =
          typeof req.body.roleData === "string"
            ? JSON.parse(req.body.roleData)
            : req.body.roleData;
      } catch (error) {
        updates.roleData = {};
        Object.keys(req.body).forEach((key) => {
          if (key.startsWith("roleData.")) {
            const fieldName = key.replace("roleData.", "");
            updates.roleData[fieldName] = req.body[key];
          }
        });
      }
    }

    // 4. AVAILABILITY     //idk wt is this logic
    if (req.body.availability) {
      try {
        updates.availability =
          typeof req.body.availability === "string"
            ? JSON.parse(req.body.availability)
            : req.body.availability;
      } catch (error) {
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

    //  FILE UPLOADS
    if (req.files) {
      if (req.files.avatar && req.files.avatar[0]) {
        updates.avatar = req.files.avatar[0].filename;
      }

      if (req.files.roleImages && req.files.roleImages.length > 0) {
        updates.roleData = updates.roleData || {};
        updates.roleData.images = req.files.roleImages.map(
          (file) => file.filename
        );
      }
    }

    console.log("Final updates:", updates);

    // Update
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.createUserForRole = (role) => async (req, res) => {
  try {
    const data = req.body;
    data.role = role;

    if (req.file) {
      data.avatar = req.file.filename;
    }

    if (req.files && req.files.length > 0) {
      data.roleData = data.roleData ? JSON.parse(data.roleData) : {};
      data.roleData.images = req.files.map((file) => file.filename);
    }

    const newUser = await User.create(data);
    res.status(201).json(newUser);
  } catch (err) {
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
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
