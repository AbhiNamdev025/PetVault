const express = require("express");
const {
  createAppointment,
  getUserAppointments,
  getAllAppointments,
  updateAppointmentStatus,
  deleteAppointment,
  getProviderAppointments,
  getProviderBookedSlots,
  getPetHistoryForProvider,
  ensureAppointmentPetProfile,
} = require("../../controllers/appointment");
const { protect, admin } = require("../../middleware/Auth/authMiddleware");
const {
  uploadPetImages,
  uploadReport,
} = require("../../middleware/Multer/upload");

const router = express.Router();

router.post("/", protect, uploadPetImages, createAppointment);
router.get("/booked-slots", protect, getProviderBookedSlots);
router.get("/my-appointments", protect, getUserAppointments);
router.get("/provider-appointments", protect, getProviderAppointments);
router.get("/pet-history/:petId", protect, getPetHistoryForProvider);
router.post("/:id/ensure-pet-profile", protect, ensureAppointmentPetProfile);
router.get("/", protect, admin, getAllAppointments);
router.put("/:id/status", protect, uploadReport, updateAppointmentStatus);
router.delete("/:id", protect, admin, deleteAppointment);

module.exports = router;
