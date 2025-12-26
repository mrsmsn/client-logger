const express = require("express");
const rfs = require("rotating-file-stream");
const logger = require("morgan");
const path = require("path");
const fs = require("fs-extra");
const cors = require("cors");
const addRequestId = require("express-request-id")();
const morganBody = require("morgan-body");
const bodyParser = require("body-parser");

let app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(addRequestId);

const log = fs.createWriteStream(
  path.join(__dirname, "log", "express.log"), { flags: "a" }
);
morganBody(app, {
  noColors: true,
  stream: log,
});

let logDirectory = path.join(__dirname, "./log");
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

let accessLogStream = rfs.createStream("access.log", {
  size: "100MB",
  interval: "1d",
  path: logDirectory,
});

logger.token('id', function getId (req) { return req.id })
logger.token("custom_token", (req, res) => JSON.stringify(req.body));
logger.token(
  "custom_date",
  () => new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString()
);

var preFormat = ":id :custom_date :custom_token";
app.use(logger(preFormat, { stream: accessLogStream }));

app.post("/", function (req, res) {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end("{\"message\": \"Hello, world!\"}");
});

var server = app.listen(process.env.PORT || 3000, function () {
  console.log("PORT: %d", server.address().port);
});
