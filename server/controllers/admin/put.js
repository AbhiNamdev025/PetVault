const User = require("../../models/User/user");
const bcrypt = require("bcryptjs");
const { sendNotification } = require("../../utils/pushNotification");

const updateUserRole = async (req, res) => {
  try {
    const { isValidObjectId } = require("mongoose");
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: req.body.role },
      { new: true },
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Notify User
    await sendNotification(user._id, {
      title: "Role Updated",
      body: `Your account role has been updated to: ${req.body.role.toUpperCase()}`,
      icon: "/pwa-192x192.png",
      type: "ROLE_UPDATE",
      data: { url: "/profile" },
    });

    res.json(user);
  } catch (error) {
    console.error(
      "Error in server/controllers/admin/put.js (updateUserRole):",
      error,
    );
    res.status(500).json({ message: error.message });
  }
};

const approveKYC = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        isVerified: true,
        kycStatus: "approved",
        verifiedBy: req.user._id,
        verifiedAt: new Date(),
      },
      { new: true, runValidators: false },
    );

    // Send Approval Email
    const { sendApprovalEmail } = require("../../utils/emailService");
    await sendApprovalEmail(user.email, user.name);

    // Notify User
    await sendNotification(user._id, {
      title: "Account Approved",
      body: "Your PetVault account has been approved! You can now access all features.",
      type: "ACCOUNT_APPROVED",
      data: { url: "/dashboard" },
    });

    res.json(user);
  } catch (error) {
    console.error("Error in approveKYC:", error);
    res.status(500).json({ message: error.message });
  }
};

const rejectKYC = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        isVerified: false,
        kycStatus: "rejected",
        adminRemark: req.body.remark,
        verifiedBy: req.user._id,
      },
      { new: true, runValidators: false },
    );

    // Send Rejection Email
    const { sendRejectionEmail } = require("../../utils/emailService");
    sendRejectionEmail(user.email, user.name, req.body.remark);

    // Notify User
    await sendNotification(user._id, {
      title: "Account Rejected",
      body: `Your verification was rejected: ${req.body.remark}`,
      type: "ACCOUNT_REJECTED",
      data: { url: "/profile" },
    });

    res.json(user);
  } catch (error) {
    console.error("Error in rejectKYC:", error);
    res.status(500).json({ message: error.message });
  }
};

const toggleUserArchive = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isArchived = !user.isArchived;
    await user.save();

    // Send Archive/Unarchive Email
    const {
      sendArchiveEmail,
      sendUnarchiveEmail,
    } = require("../../utils/emailService");

    if (user.isArchived) {
      sendArchiveEmail(user.email, user.name);
      await sendNotification(user._id, {
        title: "Account Suspended",
        body: "Your account has been suspended by the admin.",
        type: "ACCOUNT_SUSPENDED",
        data: { url: "/contact-support" },
      });
    } else {
      sendUnarchiveEmail(user.email, user.name);
      await sendNotification(user._id, {
        title: "Account Reactivated",
        body: "Your account has been reactivated.",
        type: "ACCOUNT_APPROVED",
        data: { url: "/" },
      });
    }

    res.json({
      message: user.isArchived
        ? "User archived successfully and notification sent"
        : "User unarchived successfully and notification sent",
      user,
    });
  } catch (error) {
    console.error("Error in toggleUserArchive:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  updateUserRole,
  approveKYC,
  rejectKYC,
  toggleUserArchive,
};
