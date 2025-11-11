const jwt = require("jsonwebtoken");

exports.googleAuthRedirect = (req, res) => {
  const FRONTEND_URL = process.env.CLIENT_URL || "http://localhost:5173";

  try {
    if (!req.user) {
      return res.redirect(`${FRONTEND_URL}/login?error=authentication_failed`);
    }

    const user = req.user;
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "3d",
    });

    const redirectUrl = `${FRONTEND_URL}/login/success?token=${token}&name=${encodeURIComponent(
      user.name
    )}&email=${encodeURIComponent(user.email)}&role=${user.role}&id=${
      user._id
    }`;

    res.redirect(redirectUrl);
  } catch (err) {
    console.error("Google redirect error:", err);
    res.redirect(`${FRONTEND_URL}/login?error=google_failed`);
  }
};
