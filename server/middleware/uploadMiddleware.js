const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDirs = ["uploads/pets", "uploads/products", "uploads/avatars", "uploads/services"];
uploadDirs.forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = "uploads/";

    if (file.fieldname === "petImages") {
      uploadPath += "pets/";
    } else if (file.fieldname === "productImages") {
      uploadPath += "products/";
    } else if (file.fieldname === "avatar") {
      uploadPath += "avatars/";
    } else if (file.fieldname === "serviceImages") {
      uploadPath += "services/";
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(
      null,
      Date.now() +
        "-" +
        Math.round(Math.random() * 1e9) +
        path.extname(file.originalname)
    );
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Only image files are allowed"), false);
};

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5_000_000,
  },
  fileFilter,
});

const uploadPetImages = upload.fields([{ name: "petImages", maxCount: 5 }]);
const uploadProductImages = upload.fields([{ name: "productImages", maxCount: 5 }]);
const uploadAvatar = upload.single("avatar");
const uploadServiceImages = upload.fields([{ name: "serviceImages", maxCount: 5 }]); // ✅ added

module.exports = {
  uploadPetImages,
  uploadProductImages,
  uploadAvatar,
  uploadServiceImages, // ✅ export this
};
