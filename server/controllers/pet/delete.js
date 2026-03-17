const fs = require("fs");
const path = require("path");
const Pet = require("../../models/Pet/pet");

// DELETE PET
const deletePet = async (req, res) => {
  try {
    const { isValidObjectId } = require("mongoose");
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid pet ID" });
    }

    // Validate deletion reason (mandatory)
    const { deletion_reason } = req.body;
    if (!deletion_reason || deletion_reason.trim().length < 10) {
      return res.status(400).json({
        message: "Deletion reason is required (minimum 10 characters)",
      });
    }

    const pet = await Pet.findById(req.params.id).populate(
      "shopId",
      "name email",
    );
    if (!pet) return res.status(404).json({ message: "Pet not found" });

    // Get admin user from request (set by protect middleware)
    const adminId = req.user._id;

    // Create deletion log
    const DeletionLog = require("../../models/DeletionLog/deletionLog");
    const User = require("../../models/User/user");

    const ownerId =
      pet.shopId?._id || pet.shopId || pet.ngoId?._id || pet.ngoId;
    const owner = await User.findById(ownerId);
    if (!owner) {
      return res.status(404).json({ message: "Pet owner not found" });
    }

    const deletionLog = await DeletionLog.create({
      listing_id: pet._id,
      listing_type: "pet",
      listing_details: {
        name: pet.name,
        type: pet.type,
        breed: pet.breed,
        age: pet.age,
        price: pet.price,
        description: pet.description,
      },
      listing_image: pet.images?.[0] || null, // Capture primary image
      owner_id: owner._id,
      owner_email: owner.email,
      admin_id: adminId,
      deletion_reason: deletion_reason.trim(),
    });

    // Original deletion logic (unchanged)
    // Archive instead of permanent delete
    // pet.images.forEach((img) => {
    //   const file = path.join(__dirname, "..", "..", "uploads", "pets", img);
    //   if (fs.existsSync(file)) fs.unlinkSync(file);
    // });

    pet.isArchived = true;
    await pet.save();

    // Queue email notification (async, non-blocking)
    const { processDeletionEmailQueue } = require("../../utils/emailService");
    setImmediate(() => {
      processDeletionEmailQueue(deletionLog._id);
    });

    res.json({
      message: "Pet deleted successfully",
      deletion_log_id: deletionLog._id,
      email_queued: true,
    });
  } catch (e) {
    console.error("Error in server/controllers/pet/delete.js (deletePet):", e);
    res.status(500).json({ message: e.message });
  }
};

// DELETE SINGLE PET IMAGE
const deletePetImage = async (req, res) => {
  try {
    const { isValidObjectId } = require("mongoose");
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid pet ID" });
    }

    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ message: "Pet not found" });

    const imageName = req.params.imageName;

    const filePath = path.join(
      __dirname,
      "..",
      "..",
      "uploads",
      "pets",
      imageName,
    );
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    pet.images = pet.images.filter((img) => img !== imageName);
    await pet.save();

    res.json({ message: "Image deleted successfully", images: pet.images });
  } catch (e) {
    console.error(
      "Error in server/controllers/pet/delete.js (deletePetImage):",
      e,
    );
    res.status(500).json({ message: e.message });
  }
};

module.exports = {
  deletePet,
  deletePetImage,
};
