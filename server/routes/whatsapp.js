const express = require("express");
const { openWhatsapp } = require("../controllers/whatsappController");

const router = express.Router();

router.get("/open", openWhatsapp);

module.exports = router;
