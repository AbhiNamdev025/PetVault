const openWhatsapp = (req, res) => {
  const phone = "919812409496";

  const message =
    "Hello! I would like to enquire about your services. Could you please provide more details?";

  const whatsappURL = `https://wa.me/${phone}?text=${encodeURIComponent(
    message
  )}`;

  res.redirect(whatsappURL);
};

module.exports = { openWhatsapp };
