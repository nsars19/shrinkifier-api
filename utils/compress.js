const fs = require("fs");
const sharp = require("sharp");
const AdmZip = require("adm-zip");
const { resolve, join } = require("path");
const [start, finish] = ["./tmp/unprocessed/", "./tmp/processed/"];

async function shrinkifier(images, startPath, endPath) {
  if (!fs.existsSync(endPath)) {
    fs.mkdirSync(endPath, { recursive: true });
  }

  for (const image of images) {
    await sharp(startPath + image)
      .resize(1080)
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

const compressDirectory = (req, res, next) => {
  const zip = new AdmZip();
  const path = resolve(finish);
  const files = fs.readdirSync(path);
  files.forEach((file) => zip.addLocalFile(join(path, file)));
  zip.writeZip("tmp/tinified.zip");
  req.zipFilePath = resolve("./tmp/tinified.zip");

  next();
};

const unlinkFiles = (req, res, next) => {
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

const setupZipUnlink = (req, res, next) => {
  res.on("finish", () =>
    fs.unlink(req.zipFilePath, (err) => (err ? err : null))
  );

  next();
};

exports.processingHandler = [
  compressImages,
  compressDirectory,
  unlinkFiles,
  setupZipUnlink,
];
