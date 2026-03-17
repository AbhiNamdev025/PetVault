const fs = require("fs");
const path = require("path");
const User = require("../../models/User/user");

// RESUBMIT KYC
const resubmitKYC = async (req, res) => {
  try {
    const userId = req.params.id;
    // Ensure the user is updating their own profile or is admin (though middleware handles auth)
    if (req.user._id.toString() !== userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (
      req.files &&
      req.files.kycDocuments &&
      req.files.kycDocuments.length > 0
    ) {
      // Append new documents or replace? Usually replacement is better for re-submission if rejected.
      // Let's replace the documents to keep it clean.

      // Optionally delete old files from disk here

      user.kycDocuments = req.files.kycDocuments.map((f) => f.filename);
      user.kycStatus = "pending"; // Reset status to pending
      user.isVerified = false;
      user.adminRemark = undefined; // Clear rejection remark

      await user.save();

      // Notify Admin via email (Optional)

      return res.json({
        message: "KYC documents resubmitted successfully",
        user,
      });
    } else {
      return res.status(400).json({ message: "No documents uploaded" });
    }
  } catch (err) {
    console.error("Error in resubmitKYC:", err);
    res.status(500).json({ message: err.message });
  }
};

// UPDATE PROFILE + ROLE DATA
const updateProfile = async (req, res) => {
  try {
    const id = req.user._id;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Handle Metadata parsing if sent via FormData
    let roleUpdate = req.body.roleData;
    let availabilityUpdate = req.body.availability;
    let addressUpdate = req.body.address;

    if (typeof roleUpdate === "string") {
      try {
        roleUpdate = JSON.parse(roleUpdate);
      } catch (e) {
        console.error("Error parsing roleData", e);
      }
    }

    if (typeof availabilityUpdate === "string") {
      try {
        availabilityUpdate = JSON.parse(availabilityUpdate);
      } catch (e) {
        console.error("Error parsing availability", e);
      }
    }

    if (typeof addressUpdate === "string") {
      try {
        addressUpdate = JSON.parse(addressUpdate);
      } catch (e) {
        console.error("Error parsing address", e);
      }
    }

    user.name = req.body.name || user.name;
    if (req.body.email) {
      if (!/^\S+@\S+\.\S+$/.test(req.body.email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }
      user.email = req.body.email;
    }
    user.phone = req.body.phone || user.phone;

    if (addressUpdate) {
      user.address = { ...user.address, ...addressUpdate };
    } else if (req.body["address.street"]) {
      user.address = {
        street: req.body["address.street"] || user.address.street,
        city: req.body["address.city"] || user.address.city,
        state: req.body["address.state"] || user.address.state,
        zipCode: req.body["address.zipCode"] || user.address.zipCode,
      };
    }

    // Avatar Upload
    if (req.files && req.files.avatar && req.files.avatar[0]) {
      if (user.avatar) {
        const oldPath = path.join(
          __dirname,
          "..",
          "..",
          "uploads",
          "avatars",
          user.avatar,
        );
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      user.avatar = req.files.avatar[0].filename;
    }

    // Remove Avatar if flag is set
    if (req.body.removeAvatar === "true" || req.body.removeAvatar === true) {
      if (user.avatar) {
        const oldPath = path.join(
          __dirname,
          "..",
          "..",
          "uploads",
          "avatars",
          user.avatar,
        );
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        user.avatar = undefined;
      }
    }

    // Role Data Update
    if (roleUpdate) {
      user.roleData = { ...user.roleData, ...roleUpdate };
    }

    // Role Images Upload
    if (req.files && req.files.roleImages && req.files.roleImages.length > 0) {
      const newImages = req.files.roleImages.map((f) => f.filename);
      const role = user.role;

      // Determine which array to push to based on role
      if (role === "shop") {
        user.roleData.shopImages = [
          ...(user.roleData.shopImages || []),
          ...newImages,
        ];
      } else if (role === "doctor") {
        user.roleData.doctorImages = [
          ...(user.roleData.doctorImages || []),
          ...newImages,
        ];
      } else if (role === "daycare") {
        user.roleData.daycareImages = [
          ...(user.roleData.daycareImages || []),
          ...newImages,
        ];
      } else if (role === "hospital") {
        user.roleData.hospitalImages = [
          ...(user.roleData.hospitalImages || []),
          ...newImages,
        ];
      } else if (["caretaker", "ngo"].includes(role)) {
        user.roleData.serviceImages = [
          ...(user.roleData.serviceImages || []),
          ...newImages,
        ];
      }
    }

    // Handle image deletion (passed as array of filenames to delete)
    if (req.body.deleteImages) {
      let imagesToDelete = req.body.deleteImages;
      if (typeof imagesToDelete === "string") {
        imagesToDelete = JSON.parse(imagesToDelete);
      }

      if (Array.isArray(imagesToDelete)) {
        // Helper to filter images
        const removeImages = (currentImages) =>
          (currentImages || []).filter((img) => {
            if (imagesToDelete.includes(img)) {
              // Optionally delete from disk here
              const p = path.join(
                __dirname,
                "..",
                "..",
                "uploads",
                "roleImages",
                img,
              );
              if (fs.existsSync(p)) fs.unlinkSync(p);
              return false;
            }
            return true;
          });

        if (user.role === "shop")
          user.roleData.shopImages = removeImages(user.roleData.shopImages);
        if (user.role === "doctor")
          user.roleData.doctorImages = removeImages(user.roleData.doctorImages);
        if (user.role === "daycare")
          user.roleData.daycareImages = removeImages(
            user.roleData.daycareImages,
          );
        if (user.role === "hospital")
          user.roleData.hospitalImages = removeImages(
            user.roleData.hospitalImages,
          );
        if (["caretaker", "ngo"].includes(user.role))
          user.roleData.serviceImages = removeImages(
            user.roleData.serviceImages,
          );
      }
    }

    // Availability Update
    if (availabilityUpdate) {
      user.availability = { ...user.availability, ...availabilityUpdate };
    }

    const updated = await user.save();

    res.json({
      _id: updated._id,
      name: updated.name,
      email: updated.email,
      phone: updated.phone,
      role: updated.role,
      address: updated.address,
      roleData: updated.roleData,
      avatar: updated.avatar,
      availability: updated.availability,
    });
  } catch (err) {
    console.error(
      "Error in server/controllers/user/put.js (updateProfile):",
      err,
    );
    res.status(500).json({ message: err.message });
  }
};

// UPDATE AVAILABILITY
const updateAvailability = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.availability = { ...user.availability, ...req.body };

    await user.save();
    res.json({
      message: "Availability updated",
      availability: user.availability,
    });
  } catch (err) {
    console.error(
      "Error in server/controllers/user/put.js (updateAvailability):",
      err,
    );
    res.status(500).json({ message: err.message });
  }
};

// ACCEPT TERMS
const acceptTerms = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.hasAcceptedTerms = true;
    await user.save();

    res.json({
      message: "Terms accepted successfully",
      hasAcceptedTerms: user.hasAcceptedTerms,
    });
  } catch (err) {
    console.error("Error in acceptTerms:", err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  updateProfile,
  updateAvailability,
  resubmitKYC,
  acceptTerms,
};
