const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = "uploads/";

    if (file.fieldname === "petImages") {
      uploadPath += "pets/";
    } else if (file.fieldname === "productImages") {
      uploadPath += "products/";
    } else if (file.fieldname === "avatar") {
      uploadPath += "avatars/";
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
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5000000,
  },
  fileFilter: fileFilter,
});

const uploadPetImages = upload.fields([{ name: "petImages", maxCount: 5 }]);
const uploadProductImages = upload.fields([
  { name: "productImages", maxCount: 5 },
]);
const uploadAvatar = upload.single("avatar");

module.exports = {
  uploadPetImages,
  uploadProductImages,
  uploadAvatar,
};
