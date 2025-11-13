import express from "express";
import { openWhatsapp } from "../controllers/whatsappController.js";

const router = express.Router();

router.get("/open", openWhatsapp);

export default router;
