const jwt = require("jsonwebtoken");

const googleAuthRedirect = (req, res) => {
  const FRONTEND_URL = process.env.CLIENT_URL || "http://localhost:5173";

  try {
    if (!req.user) {
      return res.redirect(`${FRONTEND_URL}/login?error=authentication_failed`);
    }

    const user = req.user;
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "3d",
    });

    const redirectUrl = `${FRONTEND_URL}/auth/google/callback?token=${token}&name=${encodeURIComponent(
      user.name,
    )}&email=${encodeURIComponent(user.email)}&role=${user.role}&id=${
      user._id
    }&kycStatus=${user.kycStatus || "pending"}`;

    res.redirect(redirectUrl);
  } catch (err) {
    console.error(
      "Error in server/controllers/googleAuth/get.js (googleAuthRedirect):",
      err,
    );
    res.redirect(`${FRONTEND_URL}/login?error=google_failed`);
  }
};

module.exports = {
  googleAuthRedirect,
};
