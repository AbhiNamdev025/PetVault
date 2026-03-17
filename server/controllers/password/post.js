require("dotenv").config();
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../../models/User/user");
const Otp = require("../../models/OTP/otp");
const { sendNotification } = require("../../utils/pushNotification");

// Gmail transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send OTP
const sendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate OTP
    const code = Math.floor(1000 + Math.random() * 9000).toString();

    // Save to DB and expires in 15mins
    await Otp.create({
      email,
      code,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });

    // Send Email
    await transporter.sendMail({
      from: `"PetVault Team" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "PetVault Password Reset Code",
      html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #667eea;">PetVault</h2>
        <p>Hi,</p>
        <p>We received a request to reset your PetVault password.</p>
        <p><strong>Your OTP code is:</strong></p>
        <h3 style="background:#f3f4f6;padding:10px;display:inline-block;border-radius:8px;">${code}</h3>
        <p>This code will expire in 15 minutes.</p>
        <p>If you didn’t request a reset, ignore this message.</p>
        <hr style="border:none;border-top:1px solid #ddd;">
        <small style="color:#999;">© 2025 PetVault. All rights reserved.</small>
      </div>
      `,
    });

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error(
      "Error in server/controllers/password/post.js (sendVerificationCode):",
      err,
    );
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

//  Verify OTP
const verifyCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res
        .status(400)
        .json({ message: "Email and OTP code are required" });
    }
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const record = await Otp.findOne({ email, code });
    if (!record) return res.status(400).json({ message: "Invalid OTP" });

    if (record.expiresAt < new Date())
      return res.status(400).json({ message: "OTP expired" });

    await Otp.deleteMany({ email }); // clear old OTPs

    res.status(200).json({ message: "OTP verified" });
  } catch (err) {
    console.error(
      "Error in server/controllers/password/post.js (verifyCode):",
      err,
    );
    res.status(500).json({ message: "Verification failed" });
  }
};

//  Reset Password
const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res
        .status(400)
        .json({ message: "Email and new password are required" });
    }
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    console.log(newPassword);
    console.log(hashedPassword);
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    await sendNotification(user._id, {
      title: "Password Changed",
      body: "Your PetVault password was updated successfully.",
      type: "PASSWORD_CHANGED",
      data: { url: "/profile" },
    });

    res.status(200).json({
      message: "Password reset successfully",
      token,
      user: { name: user.name, email: user.email },
    });
  } catch (err) {
    console.error(
      "Error in server/controllers/password/post.js (resetPassword):",
      err,
    );
    res.status(500).json({ message: "Failed to reset password" });
  }
};

module.exports = {
  sendVerificationCode,
  verifyCode,
  resetPassword,
};
