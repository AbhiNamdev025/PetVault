const express = require("express");
const router = express.Router();
const sendEnquiryEmail = require("../controllers/enquiryController");

router.post("/enquiries", sendEnquiryEmail);

module.exports = router;
