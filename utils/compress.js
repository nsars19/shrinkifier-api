const fs = require("fs");
const sharp = require("sharp");
const AdmZip = require("adm-zip");
const zip = new AdmZip();
const { resolve } = require("path");

const [start, finish] = ["./tmp/unprocessed/", "./tmp/processed/"];

async function shrinkifier(images, startPath, endPath) {
  if (!fs.existsSync(endPath)) {
    fs.mkdirSync(endPath, { recursive: true });
  }

  for (const image of images) {
    await sharp(startPath + image)
      .jpeg({ mozjpeg: true, quality: 60 })
      .toFile(`${endPath}${image.split(".")[0]}.jpeg`);
  }
}

const compressImages = async (req, res, next) => {
  const files = fs.readdirSync(start, (err, data) => {
    if (err) console.error(err);
    else return data;
  });

  await shrinkifier(files, start, finish);

  next();
};

const compressDirectory = async (req, res, next) => {
  const path = resolve(finish);

  zip.addLocalFolder(path);
  req.zipFile = zip.toBuffer();

  next();
};

const unlinkFiles = async (req, res, next) => {
  const dirs = [
    { path: resolve(start), files: fs.readdirSync(start) },
    { path: resolve(finish), files: fs.readdirSync(finish) },
  ];

  for (const { path, files } of dirs) {
    for (const file of files) {
      fs.unlink(`${path}/${file}`, (err) => {
        if (err) console.error(err);
      });
    }
  }

  next();
};

exports.processingHandler = [compressImages, compressDirectory, unlinkFiles];
