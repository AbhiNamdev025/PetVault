const User = require("../../models/User/user");
const Otp = require("../../models/OTP/otp");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const {
  sendAdminNotification,
  sendNotification,
} = require("../../utils/pushNotification");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER.trim(),
    pass: process.env.EMAIL_PASS.trim(),
  },
});

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "3d",
  });
};

const sendOTP = async (req, res) => {
  try {
    const { email, phone } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    // Email format validation
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Check for existing user (correctly handling empty phone)
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        ...(phone && phone.trim() ? [{ phone: phone.trim() }] : []),
      ],
    });

    if (existingUser) {
      if (existingUser.kycStatus === "pending") {
        return res.status(400).json({
          message:
            "Verification already in progress for this email/phone. Please wait for admin approval.",
        });
      }
      if (existingUser.kycStatus === "approved" || existingUser.isVerified) {
        return res.status(400).json({
          message: "Account already exists and is verified. Please login.",
        });
      }
      return res
        .status(400)
        .json({ message: "This email or phone is already registered." });
    }

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`DEV MODE - OTP for ${email}: ${code}`);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await Otp.findOneAndUpdate(
      { email },
      { code, expiresAt },
      { upsert: true, new: true },
    );

    // Send email
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "PetVault Verification Code",
        text: `Your verification code is: ${code}. It expires in 5 minutes.`,
        html: `<div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #7c3aed;">PetVault Verification</h2>
                <p>Your verification code is:</p>
                <h1 style="font-size: 32px; letter-spacing: 5px; color: #333;">${code}</h1>
                <p>This code expires in 5 minutes.</p>
              </div>`,
      });
      res.status(200).json({ message: "Verification code sent to your email" });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      res.status(500).json({ message: "Failed to send verification email" });
    }
  } catch (err) {
    console.error("Error in server/controllers/auth/post.js (sendOTP):", err);
    res.status(500).json({ message: "Failed to generate OTP" });
  }
};

const signup = async (req, res) => {
  try {
    let { name, email, password, phone, role, roleData, otp } = req.body;

    // Parse roleData if it's sent as a string (FormData)
    if (typeof roleData === "string") {
      try {
        roleData = JSON.parse(roleData);
      } catch (e) {
        console.error("Failed to parse roleData:", e);
        roleData = {};
      }
    }

    // Handle files
    let avatarPath = null;
    let roleImages = [];
    let kycDocs = [];

    if (req.files) {
      if (req.files.avatar) avatarPath = req.files.avatar[0].filename;

      if (req.files.roleImages) {
        roleImages = req.files.roleImages.map((f) => f.filename);
      }

      if (req.files.kycDocuments) {
        kycDocs = req.files.kycDocuments.map((f) => f.filename);
      }
    }

    // Merge image data into roleData if applicable
    if (roleImages.length > 0) {
      // Map roleImages to specific fields based on role if needed, or put them in generic array
      if (role === "doctor") roleData.doctorImages = roleImages;
      else if (role === "hospital") roleData.hospitalImages = roleImages;
      else if (role === "shop") roleData.shopImages = roleImages;
      else if (role === "daycare") roleData.daycareImages = roleImages;
      else if (role === "service") roleData.serviceImages = roleImages;
    }

    if (!name || !email || !password || !otp)
      return res
        .status(400)
        .json({ message: "All fields including OTP are required" });

    // Email format validation
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    // Verify OTP
    const validOtp = await Otp.findOne({ email, code: otp });
    if (!validOtp) return res.status(400).json({ message: "Invalid OTP" });

    if (validOtp.expiresAt < Date.now()) {
      await Otp.deleteOne({ _id: validOtp._id });
      return res.status(400).json({ message: "OTP expired" });
    }

    // Check if user exists (email or phone) with correct clashing logic
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        ...(phone && phone.trim() ? [{ phone: phone.trim() }] : []),
      ],
    });

    if (existingUser) {
      if (existingUser.kycStatus === "pending") {
        return res.status(400).json({
          message:
            "Verification already in progress for this email/phone. Please wait for admin approval.",
        });
      }
      if (existingUser.kycStatus === "approved" || existingUser.isVerified) {
        return res.status(400).json({
          message: "Account already exists and is verified. Please login.",
        });
      }
      return res.status(400).json({
        message: "This email or phone is already associated with an account.",
      });
    }

    const hashed = await bcrypt.hash(password, 12);

    // Allow role selection but default to 'user'
    // Verification logic handled by User model pre-save hook
    const userRole = role || "user";

    const user = await User.create({
      name,
      email,
      password: hashed,
      phone,
      role: userRole,
      roleData: roleData || {},
      avatar: avatarPath,
      kycDocuments: kycDocs,
      kycStatus: userRole === "user" ? "approved" : "pending",
      isVerified: userRole === "user" ? true : false,
    });

    // Delete OTP after successful registration
    await Otp.deleteOne({ _id: validOtp._id });

    // Notify user about account creation
    await sendNotification(user._id, {
      title: "Account Created",
      body:
        userRole === "user"
          ? "Welcome to PetVault! Your account is ready to use."
          : "Your account has been created and is pending admin approval.",
      type: "ACCOUNT_CREATED",
      data: { url: "/profile" },
    });

    // Send confirmation email for tenants
    if (userRole !== "user") {
      const {
        sendRegistrationConfirmation,
      } = require("../../utils/emailService");
      sendRegistrationConfirmation(user.email, user.name, userRole);

      // Send Push Notification to Admin
      await sendAdminNotification({
        title: "New Provider Signup",
        body: `${user.name} has signed up as a ${userRole}. Review their details.`,
        type: "NEW_PROVIDER_SIGNUP",
        data: { url: "/admin/requests" },
      });
    }

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error("Error in server/controllers/auth/post.js (signup):", err);
    res.status(500).json({ message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const { email: emailVal } = req.body;
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(emailVal)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "Invalid email/password" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ message: "Invalid email/password" });

    if (user.isArchived) {
      return res.status(403).json({
        message:
          "Your account has been flagged and deactivated. Please contact support for assistance.",
        status: "archived",
      });
    }

    // Strict Verification Check
    if (!user.isVerified || user.kycStatus !== "approved") {
      if (user.kycStatus === "pending") {
        return res.status(403).json({
          status: "pending",
          message:
            "Your verification is in progress. Please wait for admin approval.",
          userId: user._id,
        });
      }
      if (user.kycStatus === "rejected") {
        return res.status(403).json({
          status: "rejected",
          message:
            user.adminRemark || "Your verification was rejected by the admin.",
          adminRemark: user.adminRemark,
          userId: user._id,
          token: generateToken(user._id),
        });
      }
      return res.status(403).json({
        message: "Account verification required.",
        status: user.kycStatus,
        userId: user._id,
      });
    }

    // Notify user about login
    sendNotification(user._id, {
      title: "New Login Detected",
      body: `A login to your PetVault account was detected from a device.`,
      type: "NEW_DEVICE_LOGIN",
      data: { url: "/profile" },
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error("Error in server/controllers/auth/post.js (login):", err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  sendOTP,
  signup,
  login,
  generateToken,
};
