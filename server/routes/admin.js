const express = require("express");
const {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
} = require("../controllers/adminController");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);
router.use(admin);

router.get("/dashboard", getDashboardStats);
router.get("/users", getAllUsers);
router.put("/users/:id/role", updateUserRole);

module.exports = router;
