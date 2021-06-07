const express = require("express");
const logger = require("morgan");
const cors = require("cors");
const upload = require("./utils/upload");
const { processingHandler } = require("./utils/compress");
const app = express();

app.use(logger("dev"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.post("/", upload, processingHandler, (req, res) => {
  res.send({ zipFile: req.zipFile });
});

module.exports = app;
