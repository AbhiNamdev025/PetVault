const Appointment = require("../../models/Appointment/appointment");

const deleteAppointment = async (req, res) => {
  try {
    const { isValidObjectId } = require("mongoose");
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid appointment ID" });
    }

    const appointment = await Appointment.findByIdAndDelete(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.json({ message: "Appointment deleted successfully" });
  } catch (error) {
    console.error(
      "Error in server/controllers/appointment/delete.js (deleteAppointment):",
      error,
    );
    res.status(500).json({ message: error.message });
  }
};

module.exports = { deleteAppointment };
