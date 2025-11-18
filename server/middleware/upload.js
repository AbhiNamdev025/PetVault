const multer = require("multer");
const path = require("path");
const fs = require("fs");

// CREATE DIRECTORIES
const dirs = [
  "uploads/avatars",
  "uploads/roleImages",
  "uploads/pets",
  "uploads/products",
  "uploads/services",
];

dirs.forEach((d) => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

// STORAGE ENGINE
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = "uploads/";

    if (file.fieldname === "avatar") folder += "avatars/";
    else if (file.fieldname === "roleImages") folder += "roleImages/";
    else if (file.fieldname === "petImages") folder += "pets/";
    else if (file.fieldname === "productImages") folder += "products/";
    else if (file.fieldname === "serviceImages") folder += "services/";

    cb(null, folder);
  },

  filename: (req, file, cb) => {
    cb(
      null,
      Date.now() +
        "-" +
        Math.round(Math.random() * 1e9) +
        path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage });

// UNIVERSAL UPLOAD FOR ANY ROLE
const roleUpload = upload.fields([
  { name: "avatar", maxCount: 1 },
  { name: "roleImages", maxCount: 10 },
]);

module.exports = {
  roleUpload,
  uploadAvatar: upload.single("avatar"),
  uploadRoleImages: upload.array("roleImages", 10),
  uploadPetImages: upload.fields([{ name: "petImages", maxCount: 5 }]),
  uploadProductImages: upload.fields([{ name: "productImages", maxCount: 5 }]),
  uploadServiceImages: upload.fields([{ name: "serviceImages", maxCount: 5 }]),
};
