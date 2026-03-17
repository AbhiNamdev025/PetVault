const { createAppointment } = require("./post");
const {
  getUserAppointments,
  getAllAppointments,
  getProviderAppointments,
  getProviderBookedSlots,
  getPetHistoryForProvider,
  ensureAppointmentPetProfile,
} = require("./get");
const { updateAppointmentStatus } = require("./put");
const { deleteAppointment } = require("./delete");

module.exports = {
  createAppointment,
  getUserAppointments,
  getAllAppointments,
  getProviderAppointments,
  getProviderBookedSlots,
  getPetHistoryForProvider,
  ensureAppointmentPetProfile,
  updateAppointmentStatus,
  deleteAppointment,
};
