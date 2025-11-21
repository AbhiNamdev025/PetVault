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
exports.rateNgo = async (req, res) => {
  try {
    const ngoId = req.params.id;
    const userId = req.user._id;
    const { rating, review } = req.body;

    if (!rating) {
      return res.status(400).json({ message: "Rating is required" });
    }

    const ngo = await User.findById(ngoId);
    if (!ngo) {
      return res.status(404).json({ message: "NGO not found" });
    }

    if (ngo.role !== "ngo") {
      return res.status(400).json({ message: "This user is not an NGO" });
    }

    const newRating = {
      userId,
      rating,
      review,
      createdAt: new Date(),
    };

    ngo.ratings.push(newRating);
    await ngo.save();

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

exports.rateShop = async (req, res) => {
  try {
    const shopId = req.params.id;
    const userId = req.user._id;
    const { rating, review } = req.body;

    if (!rating) {
      return res.status(400).json({ message: "Rating is required" });
    }

    const shop = await User.findById(shopId);
    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    if (shop.role !== "shop") {
      return res.status(400).json({ message: "This user is not a shop" });
    }

    const newRating = {
      userId,
      rating,
      review,
      createdAt: new Date(),
    };

    shop.ratings.push(newRating);
    await shop.save();

    res.status(201).json({
      message: "Review added",
      newRating,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.rateDaycare = async (req, res) => {
  try {
    const daycareId = req.params.id;
    const userId = req.user._id;
    const { rating, review } = req.body;

    if (!rating) {
      return res.status(400).json({ message: "Rating is required" });
    }

    const daycare = await User.findById(daycareId);
    if (!daycare) {
      return res.status(404).json({ message: "Daycare not found" });
    }

    if (daycare.role !== "daycare") {
      return res.status(400).json({ message: "This user is not a daycare" });
    }

    const newRating = {
      userId,
      rating,
      review,
      createdAt: new Date(),
    };

    daycare.ratings.push(newRating);
    await daycare.save();

    res.status(201).json({
      message: "Review added",
      newRating,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.rateHospital = async (req, res) => {
  try {
    const hospitalId = req.params.id;
    const userId = req.user._id;
    const { rating, review } = req.body;

    if (!rating) {
      return res.status(400).json({ message: "Rating is required" });
    }

    const hospital = await User.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    if (hospital.role !== "hospital") {
      return res.status(400).json({ message: "This user is not a hospital" });
    }

    const newRating = {
      userId,
      rating,
      review,
      createdAt: new Date(),
    };

    hospital.ratings.push(newRating);
    await hospital.save();

    res.status(201).json({
      message: "Review added",
      newRating,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
