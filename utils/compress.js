const fs = require("fs");
const sharp = require("sharp");
const AdmZip = require("adm-zip");
const { resolve, join } = require("path");
const [start, finish] = ["./tmp/unprocessed/", "./tmp/processed/"];

async function shrinkifier(images, opts) {
  if (!fs.existsSync(finish)) {
    fs.mkdirSync(finish, { recursive: true });
  }

  // Defaults are:
  //   format: jpeg,
  //   quality: 60,
  //   width: 1080,
  //   height: null to maintain aspect ratio

  const { quality, width, height } = opts;
  const format = opts.format || "jpeg";
  const imgOptions = { quality: parseInt(quality) || 60 };

  for (const image of images) {
    const img = await sharp(start + image).resize(
      parseInt(width) || 1080,
      parseInt(height) || null
    );

    // Use computed property to determine which formatting function to call on sharp object
    // eg. typeof img["jpeg"] === "function"
    await img[format](imgOptions).toFile(
      `${finish}${image.split(".")[0]}.${format}`
    );
  }
}

const compressImages = async (req, res, next) => {
  const files = fs.readdirSync(start, (err, data) => {
    if (err) console.error(err);
    else return data;
  });

  const options = JSON.parse(req.body.options);
  try {
    await shrinkifier(files, options);
    next();
  } catch (err) {
    console.error(err);
    unlinkFiles(req, res);
    res.sendStatus(500);
  }
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

const unlinkFiles = (req, res, next = null) => {
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

  if (next) next();
};

const setupZipUnlink = (req, res, next) => {
  res.on("finish", () =>
    fs.unlink(req.zipFilePath, (err) => {
      if (err) console.error(err);
    })
  );

  next();
};

exports.processingHandler = [
  compressImages,
  compressDirectory,
  unlinkFiles,
  setupZipUnlink,
];
