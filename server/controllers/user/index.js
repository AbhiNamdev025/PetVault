const { getProfile } = require("./get");
const { addStaffToDaycare, addDoctorToHospital } = require("./post");
const {
  updateProfile,
  updateAvailability,
  resubmitKYC,
  acceptTerms,
} = require("./put");

module.exports = {
  getProfile,
  updateProfile,
  updateAvailability,
  addStaffToDaycare,
  addDoctorToHospital,
  resubmitKYC,
  acceptTerms,
};
