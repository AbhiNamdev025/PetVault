const express = require("express");
const {
  getDashboardStats,
  getAllUsers,
  getUserDetails,
  updateUserRole,
  approveKYC,
  rejectKYC,
  deleteUser,
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
  getDaycareCaretakers, // Keeping this as it was in the original and not explicitly removed by the instruction's snippet
  // NGO
  getNgoDetails,
  toggleUserArchive, // Keeping this as it was in the original and not explicitly removed by the instruction's snippet

  // Item Details
  getAdminProductDetails,
  getAdminPetDetails,
  globalSearch,
  getAdminPayoutRequests,
  getAdminPayoutRequestDetails,
  updatePayoutRequestStatus,
} = require("../../controllers/admin");
const { protect, admin } = require("../../middleware/Auth/authMiddleware");
const { uploadPayoutProof } = require("../../middleware/Multer/upload");

const router = express.Router();

// ===== EXISTING ROUTES =====
router.get("/dashboard", protect, admin, getDashboardStats);
router.get("/users", protect, admin, getAllUsers);
router.get("/users/:id", protect, admin, getUserDetails);
router.put("/users/:id/role", protect, admin, updateUserRole);
router.put("/users/:id/approve", protect, admin, approveKYC);
router.put("/users/:id/reject", protect, admin, rejectKYC);
router.delete("/users/:id", protect, admin, deleteUser);
router.put("/users/:id/archive", protect, admin, toggleUserArchive);

// ===== SHOP MANAGEMENT ROUTES =====
router.get("/shops", protect, admin, getAllShops);
router.get("/shops/:id", protect, admin, getShopDetails);
router.get("/shops/:id/products", protect, admin, getShopProducts);
router.get("/shops/:id/pets", protect, admin, getShopPets);

// ===== HOSPITAL MANAGEMENT ROUTES =====
router.get("/hospitals", protect, admin, getAllHospitals);
router.get("/hospitals/:id", protect, admin, getHospitalDetails);
router.get("/hospitals/:id/doctors", protect, admin, getHospitalDoctors);

// ===== DAYCARE MANAGEMENT ROUTES =====
router.get("/daycares", protect, admin, getAllDaycares);
router.get("/daycares/:id", protect, admin, getDaycareDetails);
router.get("/daycares/:id/caretakers", protect, admin, getDaycareCaretakers);

// ===== NGO MANAGEMENT ROUTES =====
router.get("/ngos/:id", protect, admin, getNgoDetails);

// ===== ITEM DETAIL ROUTES =====
router.get("/products/:id", protect, admin, getAdminProductDetails);
router.get("/pets/:id", protect, admin, getAdminPetDetails);
router.get("/search", protect, admin, globalSearch);
router.get("/payouts", protect, admin, getAdminPayoutRequests);
router.get("/payouts/:id", protect, admin, getAdminPayoutRequestDetails);
router.put(
  "/payouts/:id/status",
  protect,
  admin,
  uploadPayoutProof,
  updatePayoutRequestStatus,
);

module.exports = router;
