const express = require("express");
const bodyparser = require("body-parser");
const path = require("path");
const exphand = require("express-handlebars");
const control = require("./controller/control");
require("./models/db");

var PORT = process.env.PORT || 3002;
var app = express();

app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());

app.set("views", path.join(__dirname + "/views/"));
app.engine(
  "hbs",
  exphand({
    extname: "hbs",
    layoutsDir: __dirname + "/views/layouts/",
    defaultLayout: "mainlayout",
  })
);
app.set("view engine", "hbs");

app.use(express.static("public"));
app.use("/", express.static(__dirname + "/views"));

app.listen(PORT, () => {
  console.log("express server started at " + PORT);
});

app.use("/", control);
