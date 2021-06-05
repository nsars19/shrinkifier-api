const { processFromDir, rmdir } = require("shrinkifier");
const fs = require("fs");

exports.compress = (req, res, next) => {
  processFromDir({
    start: "./tmp/unprocessed/",
    finish: "./tmp/processed/",
  });

  next();
};

exports.attachNewFiles = (req, res, next) => {
  fs.readdir("./tmp/processed/", (err, data) => {
    req.newFiles = data;
  });

  next();
};

exports.rmdirs = () => {
  ["processed", "unprocessed"].forEach((path) => {
    if (fs.existsSync("./tmp/" + path)) {
      fs.readdir("./tmp/" + path, (err, files) => {
        if (err) {
          console.error(err);
        } else {
          files.forEach((file) => {
            fs.unlink(`./tmp/${path}/${file}`, (err, data) => {
              if (err) console.error(err);
            });
          });
        }
      });
    }
  });
};
