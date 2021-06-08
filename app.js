const express = require("express");
const logger = require("morgan");
const cors = require("cors");
const upload = require("./utils/upload");
const { processingHandler, unlinkZip } = require("./utils/compress");
const app = express();

app.use(logger("dev"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.post("/", upload, processingHandler, async (req, res) => {
  res.on("finish", () => unlinkZip(req));
  res.sendFile(req.zipFilePath);
});

module.exports = app;
