const {
  getDashboardStats,
  getAllUsers,
  getUserDetails,
  globalSearch,
} = require("./get");
const {
  updateUserRole,
  approveKYC,
  rejectKYC,
  toggleUserArchive,
} = require("./put");
const { deleteUser } = require("./delete");

// Shop Management
const {
  getAllShops,
  getShopDetails,
  getShopProducts,
  getShopPets,
} = require("./shopManagement");

// Hospital Management
const {
  getAllHospitals,
  getHospitalDetails,
  getHospitalDoctors,
} = require("./hospitalManagement");

// Daycare Management
const {
  getAllDaycares,
  getDaycareDetails,
  getDaycareCaretakers,
} = require("./daycareManagement");

// NGO Management
const { getNgoDetails } = require("./ngoManagement");

// Item Details
const { getAdminProductDetails, getAdminPetDetails } = require("./itemDetails");
const {
  getAdminPayoutRequests,
  getAdminPayoutRequestDetails,
  updatePayoutRequestStatus,
} = require("./payoutManagement");

module.exports = {
  // Existing
  getDashboardStats,
  getAllUsers,
  getUserDetails,
  updateUserRole,
  approveKYC,
  rejectKYC,
  toggleUserArchive,
  deleteUser,
  globalSearch,

  // Shop Management
  getAllShops,
  getShopDetails,
  getShopProducts,
  getShopPets,

  // Hospital Management
  getAllHospitals,
  getHospitalDetails,
  getHospitalDoctors,

  // Daycare Management
  getAllDaycares,
  getDaycareDetails,
  getDaycareCaretakers,

  // NGO Management
  getNgoDetails,

  // Item Details
  getAdminProductDetails,
  getAdminPetDetails,

  // Payout Management
  getAdminPayoutRequests,
  getAdminPayoutRequestDetails,
  updatePayoutRequestStatus,
};
