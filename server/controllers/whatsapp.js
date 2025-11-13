export const openWhatsapp = (req, res) => {
  const phone = "919876543210";
  const message = "Hello from my MERN app!";

  const whatsappURL = `https://wa.me/${phone}?text=${encodeURIComponent(
    message
  )}`;

  res.redirect(whatsappURL);
};
