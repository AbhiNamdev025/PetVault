const express = require("express");
const passport = require("passport");
const { googleAuthRedirect } = require("../controllers/googleAuthController");

const router = express.Router();

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.CLIENT_URL}/login?error=google_auth_failed`,
    session: false,
  }),
  googleAuthRedirect
);

module.exports = router;
