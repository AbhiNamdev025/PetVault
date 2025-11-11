require("dotenv").config();
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Otp = require("../models/otp");

// Gmail transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send OTP
exports.sendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;

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
    console.error("Error sending OTP:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

//  Verify OTP
exports.verifyCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    const record = await Otp.findOne({ email, code });
    if (!record) return res.status(400).json({ message: "Invalid OTP" });

    if (record.expiresAt < new Date())
      return res.status(400).json({ message: "OTP expired" });

    await Otp.deleteMany({ email }); // clear old OTPs

    res.status(200).json({ message: "OTP verified" });
  } catch (err) {
    console.error("OTP verification error:", err);
    res.status(500).json({ message: "Verification failed" });
  }
};

//  Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

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

    res.status(200).json({
      message: "Password reset successfully",
      token,
      user: { name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Error resetting password:", err);
    res.status(500).json({ message: "Failed to reset password" });
  }
};
