const multer = require("multer");
const fs = require("fs");

// Setup Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const path = "tmp/unprocessed/";
    makeDir(path);
    return cb(null, path);
  },
  filename: (req, file, cb) => {
    return cb(null, file.originalname);
  },
  fileFilter: (req, file, cb) => {
    const isGoodType = checkFileType(file);
    isGoodType ? cb(null, true) : cb(null, false);
  },
  limits: {
    fileSize: 10000000,
  },
});

function makeDir(path) {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true });
  }
}

function checkFileType(file) {
  const types = /jpg|jpeg|png|gif|webp/;
  return types.test(file.mimetype);
}

module.exports = multer({ storage: storage }).array("files", 50);
