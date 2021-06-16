const fs = require("fs");
const sharp = require("sharp");
const AdmZip = require("adm-zip");
const { resolve, join } = require("path");
const [start, finish] = ["./tmp/unprocessed/", "./tmp/processed/"];

async function shrinkifier(images, startPath, endPath, opts) {
  if (!fs.existsSync(endPath)) {
    fs.mkdirSync(endPath, { recursive: true });
  }

  // Defaults are:
  //   format: jpeg,
  //   quality: 60,
  //   width: 1080,
  //   height: undefined to maintain aspect ratio

  const { quality, width, height } = opts;
  const format = opts.format || "jpeg";
  const imgOptions = { quality: parseInt(quality) || 60 };

  for (const image of images) {
    const img = await sharp(startPath + image).resize(
      parseInt(width) || 1080,
      parseInt(height) || null
    );

    // Dynamically calls formatting method based on user-supplied option, else use default
    await img[format](imgOptions).toFile(
      `${endPath}${image.split(".")[0]}.${format}`
    );
  }
}

const compressImages = async (req, res, next) => {
  const files = fs.readdirSync(start, (err, data) => {
    if (err) console.error(err);
    else return data;
  });

  const options = JSON.parse(req.body.options);
  await shrinkifier(files, start, finish, options);

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
