const express = require("express");
const router = express.Router();
const { sendEnquiryEmail } = require("../../controllers/enquiry");

router.post("/enquiries", sendEnquiryEmail);

module.exports = router;
