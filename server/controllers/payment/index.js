const {
  createPaymentOrder,
  createAppointmentPaymentOrder,
  verifyPayment,
  verifyAppointmentPayment,
  handleWebhook,
} = require("./post");

module.exports = {
  createPaymentOrder,
  createAppointmentPaymentOrder,
  verifyPayment,
  verifyAppointmentPayment,
  handleWebhook,
};
