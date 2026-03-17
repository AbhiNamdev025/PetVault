const express = require("express");
const passport = require("passport");
const { googleAuthRedirect } = require("../../controllers/googleAuth");

const router = express.Router();

router.get("/google", (req, res, next) => {
  const role = req.query.role || "user";
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
    state: role,
  })(req, res, next);
});

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.CLIENT_URL}/login?error=google_auth_failed`,
    session: false,
  }),
  googleAuthRedirect,
);

module.exports = router;
