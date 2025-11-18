const User = require("../models/user");

exports.rateDoctor = async (req, res) => {
  try {
    const doctorId = req.params.id;
    const userId = req.user._id;
    const { rating, review } = req.body;

    if (!rating) {
      return res.status(400).json({ message: "Rating is required" });
    }

    const doctor = await User.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    if (doctor.role !== "doctor") {
      return res.status(400).json({ message: "This user is not a doctor" });
    }

    const newRating = {
      userId,
      rating,
      review,
      createdAt: new Date(),
    };

    doctor.ratings.push(newRating);
    await doctor.save();

    res.status(201).json({
      message: "Review added",
      newRating,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.rateCaretaker = async (req, res) => {
  try {
    const caretakerId = req.params.id;
    const userId = req.user._id;
    const { rating, review } = req.body;

    if (!rating) {
      return res.status(400).json({ message: "Rating is required" });
    }

    const caretaker = await User.findById(caretakerId);

    if (!caretaker) {
      return res.status(404).json({ message: "Caretaker not found" });
    }

    if (caretaker.role !== "caretaker") {
      return res.status(400).json({ message: "This user is not a caretaker" });
    }

    const newRating = {
      userId,
      rating,
      review,
      createdAt: new Date(),
    };

    caretaker.ratings.push(newRating);
    await caretaker.save();

    res.status(201).json({
      message: "Review added",
      newRating,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
