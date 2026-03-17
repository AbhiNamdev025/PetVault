const express = require("express");
const router = express.Router();
const newsletterController = require("../../controllers/newsletter/newsletterController");
const { protect, admin } = require("../../middleware/Auth/authMiddleware");

router.post("/subscribe", newsletterController.subscribe);
router.get(
  "/admin/subscribers",
  protect,
  admin,
  newsletterController.getSubscribers,
);
router.post(
  "/admin/send",
  protect,
  admin,
  newsletterController.sendManualEmail,
);

module.exports = router;
