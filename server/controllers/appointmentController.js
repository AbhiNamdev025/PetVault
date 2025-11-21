const Appointment = require("../models/appointment");

const createAppointment = async (req, res) => {
  try {
    const petImages = req.files?.petImages?.map((f) => f.filename) || [];

    const appointment = await Appointment.create({
      ...req.body,
      user: req.user._id,
      petImages,
    });

    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ user: req.user._id })
      .populate("providerId", "name avatar role roleData")
      .sort({ createdAt: -1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("user", "name email phone")
      .populate("providerId", "name avatar role roleData")
      .sort({ createdAt: -1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateAppointmentStatus = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    )
      .populate("user", "name email phone")
      .populate("providerId", "name avatar role roleData");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.json({ message: "Appointment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProviderAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ providerId: req.user._id })
      .populate("user", "name email phone")
      .populate("providerId", "name avatar role roleData")
      .sort({ createdAt: -1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createAppointment,
  getUserAppointments,
  getAllAppointments,
  updateAppointmentStatus,
  deleteAppointment,
  getProviderAppointments,
};
