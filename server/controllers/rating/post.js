const User = require("../../models/User/user");
const Product = require("../../models/Product/product");

const rateDoctor = async (req, res) => {
  try {
    const doctorId = req.params.id;
    const userId = req.user._id;
    const { rating, review } = req.body;
    const { isValidObjectId } = require("mongoose");

    if (!isValidObjectId(doctorId)) {
      return res.status(400).json({ message: "Invalid Doctor ID" });
    }

    if (!rating || isNaN(rating) || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
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

    // Populate the userId name for the new rating
    await doctor.populate("ratings.userId", "name");
    const populatedRating = doctor.ratings[doctor.ratings.length - 1];

    const { sendNotification } = require("../../utils/pushNotification");
    await sendNotification(doctorId, {
      title: "New Review Received",
      body: `${req.user.name} gave you a ${rating}-star rating: "${review.substring(0, 50)}..."`,
      icon: "/pwa-192x192.png",
      type: "NEW_REVIEW",
      data: { url: "/profile" },
    });

    res.status(201).json({
      message: "Review added",
      newRating: populatedRating,
    });
  } catch (err) {
    console.error(
      "Error in server/controllers/rating/post.js (rateDoctor):",
      err,
    );
    res.status(500).json({ message: err.message });
  }
};

const rateNgo = async (req, res) => {
  try {
    const ngoId = req.params.id;
    const userId = req.user._id;
    const { rating, review } = req.body;
    const { isValidObjectId } = require("mongoose");

    if (!isValidObjectId(ngoId)) {
      return res.status(400).json({ message: "Invalid NGO ID" });
    }

    if (!rating || isNaN(rating) || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
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

    await ngo.populate("ratings.userId", "name");
    const populatedRating = ngo.ratings[ngo.ratings.length - 1];

    const { sendNotification } = require("../../utils/pushNotification");
    await sendNotification(ngoId, {
      title: "New NGO Review",
      body: `${req.user.name} reviewed your NGO with ${rating} stars.`,
      icon: "/pwa-192x192.png",
      type: "NEW_REVIEW",
      data: { url: "/profile" },
    });

    res.status(201).json({
      message: "Review added",
      newRating: populatedRating,
    });
  } catch (err) {
    console.error("Error in server/controllers/rating/post.js (rateNgo):", err);
    res.status(500).json({ message: err.message });
  }
};

const rateCaretaker = async (req, res) => {
  try {
    const caretakerId = req.params.id;
    const userId = req.user._id;
    const { rating, review } = req.body;
    const { isValidObjectId } = require("mongoose");

    if (!isValidObjectId(caretakerId)) {
      return res.status(400).json({ message: "Invalid Caretaker ID" });
    }

    if (!rating || isNaN(rating) || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
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

    await caretaker.populate("ratings.userId", "name");
    const populatedRating = caretaker.ratings[caretaker.ratings.length - 1];

    const { sendNotification } = require("../../utils/pushNotification");
    await sendNotification(caretakerId, {
      title: "New Caretaker Review",
      body: `${req.user.name} gave you a ${rating}-star rating.`,
      icon: "/pwa-192x192.png",
      type: "NEW_REVIEW",
      data: { url: "/profile" },
    });

    res.status(201).json({
      message: "Review added",
      newRating: populatedRating,
    });
  } catch (err) {
    console.error(
      "Error in server/controllers/rating/post.js (rateCaretaker):",
      err,
    );
    res.status(500).json({ message: err.message });
  }
};

const rateShop = async (req, res) => {
  try {
    const shopId = req.params.id;
    const userId = req.user._id;
    const { rating, review } = req.body;
    const { isValidObjectId } = require("mongoose");

    if (!isValidObjectId(shopId)) {
      return res.status(400).json({ message: "Invalid Shop ID" });
    }

    if (!rating || isNaN(rating) || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
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

    await shop.populate("ratings.userId", "name");
    const populatedRating = shop.ratings[shop.ratings.length - 1];

    const { sendNotification } = require("../../utils/pushNotification");
    await sendNotification(shopId, {
      title: "New Shop Review",
      body: `${req.user.name} reviewed your shop with ${rating} stars.`,
      icon: "/pwa-192x192.png",
      type: "NEW_REVIEW",
      data: { url: "/profile" },
    });

    res.status(201).json({
      message: "Review added",
      newRating: populatedRating,
    });
  } catch (err) {
    console.error(
      "Error in server/controllers/rating/post.js (rateShop):",
      err,
    );
    res.status(500).json({ message: err.message });
  }
};

const rateDaycare = async (req, res) => {
  try {
    const daycareId = req.params.id;
    const userId = req.user._id;
    const { rating, review } = req.body;
    const { isValidObjectId } = require("mongoose");

    if (!isValidObjectId(daycareId)) {
      return res.status(400).json({ message: "Invalid Daycare ID" });
    }

    if (!rating || isNaN(rating) || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
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

    await daycare.populate("ratings.userId", "name");
    const populatedRating = daycare.ratings[daycare.ratings.length - 1];

    const { sendNotification } = require("../../utils/pushNotification");
    await sendNotification(daycareId, {
      title: "New Daycare Review",
      body: `${req.user.name} reviewed your daycare with ${rating} stars.`,
      icon: "/pwa-192x192.png",
      type: "NEW_REVIEW",
      data: { url: "/profile" },
    });

    res.status(201).json({
      message: "Review added",
      newRating: populatedRating,
    });
  } catch (err) {
    console.error(
      "Error in server/controllers/rating/post.js (rateDaycare):",
      err,
    );
    res.status(500).json({ message: err.message });
  }
};

const rateHospital = async (req, res) => {
  try {
    const hospitalId = req.params.id;
    const userId = req.user._id;
    const { rating, review } = req.body;
    const { isValidObjectId } = require("mongoose");

    if (!isValidObjectId(hospitalId)) {
      return res.status(400).json({ message: "Invalid Hospital ID" });
    }

    if (!rating || isNaN(rating) || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
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

    await hospital.populate("ratings.userId", "name");
    const populatedRating = hospital.ratings[hospital.ratings.length - 1];

    const { sendNotification } = require("../../utils/pushNotification");
    await sendNotification(hospitalId, {
      title: "New Hospital Review",
      body: `${req.user.name} reviewed your hospital with ${rating} stars.`,
      icon: "/pwa-192x192.png",
      type: "NEW_REVIEW",
      data: { url: "/profile" },
    });

    res.status(201).json({
      message: "Review added",
      newRating: populatedRating,
    });
  } catch (err) {
    console.error(
      "Error in server/controllers/rating/post.js (rateHospital):",
      err,
    );
    res.status(500).json({ message: err.message });
  }
};

const rateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user._id;
    const { rating, review } = req.body;
    const { isValidObjectId } = require("mongoose");

    if (!isValidObjectId(productId)) {
      return res.status(400).json({ message: "Invalid Product ID" });
    }

    if (!rating || isNaN(rating) || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const newRating = {
      userId,
      rating,
      review,
      createdAt: new Date(),
    };

    product.ratings.push(newRating);
    await product.save();

    await product.populate("ratings.userId", "name");
    const populatedRating = product.ratings[product.ratings.length - 1];

    if (product.shopId) {
      const { sendNotification } = require("../../utils/pushNotification");
      await sendNotification(product.shopId, {
        title: "Product Review Received",
        body: `Your product "${product.name}" received a ${rating}-star rating from ${req.user.name}.`,
        icon: "/pwa-192x192.png",
        type: "NEW_PRODUCT_REVIEW",
        data: { url: "/profile" },
      });
    }

    res.status(201).json({
      message: "Review added",
      newRating: populatedRating,
    });
  } catch (err) {
    console.error(
      "Error in server/controllers/rating/post.js (rateProduct):",
      err,
    );
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  rateDoctor,
  rateNgo,
  rateCaretaker,
  rateShop,
  rateDaycare,
  rateHospital,
  rateProduct,
};
