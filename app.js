const express = require("express");
const logger = require("morgan");
const cors = require("cors");
const upload = require("./utils/upload");
const { compress, attachNewFiles, rmdirs } = require("./utils/compress");

const app = express();

app.use(logger("dev"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.post("/", upload, compress, attachNewFiles, rmdirs, (req, res) => {
  res.send({ data: req.files });
});

module.exports = app;
