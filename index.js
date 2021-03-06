const translate = require("google-translate-cn-api");
const stdio = require("stdio");
const express = require("express");
const bodyParser = require('body-parser');
const date = require("date-and-time");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))

const ops = stdio.getopt({
  port: { key: "p", args: 1, description: "running port", default: 30031 },
  domain: {
    key: "d",
    args: 1,
    description: "google translate port",
    default: "com",
  },
});
const port = parseInt(ops.port);
const domain = ops.domain;

// log functionalities
const timeFormat = date.compile("YYYY/MM/DD HH:mm:ss");
const prettyJson = (object) =>
  JSON.stringify(object)
    .replace(/"/g, "")
    .replace(/([,:])/g, "$1 ");
function log(req, text, status) {
  const now = date.format(new Date(), timeFormat);
  let ip = req.connection.remoteAddress;
  const params = prettyJson(req.query);
  console.log(`${now} [${ip}] ${status}  "${text}"  ${params}`);
}

app.get("/hello", function (req, res) {
  res.send('hello');
});

// express server
app.all("/", function (req, res) {
  const text = req.body.text;
  console.log("body text=" + text);
  delete req.query.text;

  translate(text, { ...{ domain: domain }, ...req.query })
    .then((resp) => res.json(resp) && log(req, text, 200))
    .catch((resp) => res.status(400).json(resp) && log(req, text, 400));
});

app.listen(port, function () {
  console.log(
    "\n   ___ _____   ___\n" +
    "  / __|_   _| / __| ___ _ ___ _____ _ _\n" +
    " | (_ | | |   \\__ \\/ -_) '_\\ V / -_) '_|\n" +
    "  \\___| |_|   |___/\\___|_|  \\_/\\___|_|\n\n"
  );
  console.log(`App listening on port ${port}!`);
  console.log(
    `Default Google Translate domain: https://translate.google.${domain}/`
  );
  console.log("Incoming requests will be listed below:\n");
});
