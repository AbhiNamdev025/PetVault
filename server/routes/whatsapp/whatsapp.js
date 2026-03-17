const express = require("express");
const { openWhatsapp } = require("../../controllers/whatsapp");

const router = express.Router();

router.get("/open", openWhatsapp);

module.exports = router;
