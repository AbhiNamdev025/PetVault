const express = require("express");
const {
  createAppointment,
  getUserAppointments,
  getAllAppointments,
  updateAppointmentStatus,
  deleteAppointment,
  getProviderAppointments 
} = require("../controllers/appointmentController");
const { protect, admin } = require("../middleware/authMiddleware");
const { uploadPetImages } = require("../middleware/upload");

const router = express.Router();

router.post("/", protect, uploadPetImages, createAppointment);
router.get("/my-appointments", protect, getUserAppointments);
router.get("/provider-appointments", protect, getProviderAppointments); 
router.get("/", protect, admin, getAllAppointments);
router.put("/:id/status", protect, updateAppointmentStatus); 
router.delete("/:id", protect, admin, deleteAppointment);

module.exports = router;