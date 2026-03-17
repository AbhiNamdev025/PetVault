const openWhatsapp = (req, res) => {
  try {
    const phone = "919812409496";

    const message =
      "Hello! I would like to enquire about your services. Could you please provide more details?";

    const whatsappURL = `https://wa.me/${phone}?text=${encodeURIComponent(
      message,
    )}`;

    res.redirect(whatsappURL);
  } catch (error) {
    console.error(
      "Error in server/controllers/whatsapp/get.js (openWhatsapp):",
      error,
    );
    res.status(500).json({ message: error.message });
  }
};

module.exports = { openWhatsapp };
