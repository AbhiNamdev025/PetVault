const express = require("express");
const {
  createAppointment,
  getUserAppointments,
  getAllAppointments,
  updateAppointmentStatus,
  deleteAppointment,
} = require("../controllers/appointmentController");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createAppointment);
router.get("/my-appointments", protect, getUserAppointments);
router.get("/", protect, admin, getAllAppointments);
router.put("/:id/status", protect, admin, updateAppointmentStatus);
router.delete("/:id", protect, admin, deleteAppointment);

module.exports = router;
