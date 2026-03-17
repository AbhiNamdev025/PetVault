const {
  getUsersByRole,
  getUserById,
  getCaretakersByDaycare,
  getDoctorsByHospital,
} = require("./get");
const { createUserForRole } = require("./post");
const { updateUser } = require("./put");
const { deleteUser } = require("./delete");

module.exports = {
  getUsersByRole,
  getUserById,
  getCaretakersByDaycare,
  getDoctorsByHospital,
  createUserForRole,
  updateUser,
  deleteUser,
};
