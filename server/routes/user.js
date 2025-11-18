const express = require("express");
const router = express.Router();

const {
  createUserForRole,
  getUsersByRole,
  getUserById,
  updateUser,
  deleteUser,
} = require("../controllers/roleController");

const { roleUpload } = require("../middleware/upload");

router.post("/", roleUpload, createUserForRole("user"));
router.get("/", getUsersByRole("user"));
router.get("/:id", getUserById);
router.put("/:id", roleUpload, updateUser);
router.delete("/:id", deleteUser);

module.exports = router;
