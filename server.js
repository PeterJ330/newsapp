var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");

var db = require("./models");
var PORT = process.env.PORT || 3000;

// initializes Express
var app = express();

// uses morgan to log requests
app.use(logger("dev"));

// parses request body as a JSON
app.use(express.urlencoded({extended: true}));
app.use(express.json());
// makes the public folder static
app.use(express.static("public"));

// connects to Mongo DB
mongoose.connect("mongodb://localhost/unit18Populater", { useNewUrlParser: true });

// ROUTES
// *** need to set up routes ***


// starts the server listening
app.listen(PORT, function() {
    console.log(`The App is running on port ${PORT}!!!`);
});