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
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// makes the public folder static
app.use(express.static("public"));

// connects to Mongo DB -- If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/newWebScraper";
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

// *********************************************************************************************************
//                                         ROUTES
// *********************************************************************************************************

// GET route for scraping https://www.theonion.com/
app.get("/scrape", function (req, res) {
    // uses axios to get body of the html
    axios.get("https://www.theonion.com/").then(function (response) {
        // loads response in to cheerio & sets it equal to var $ to aid in shorthand
        var $ = cheerio.load(response.data);
        // grabs every tag with a class of "h1.headline.entry-title.js_entry-title"
        $("h1.headline.entry-title.js_entry-title").each(function (i, element) {
            var result = {};
            // stores text & href of the tags we just grabbed
            result.title = $(this)
                .children("a")
                .text();
            result.link = $(this)
                .children("a")
                .attr("href");

            // uses the result object created above to create a new Article
            db.Article.create(result)
                .then(function (dbArticle) {
                    console.log(dbArticle);
                })
                .catch(function (err) {
                    //   if error occurs, sends to client
                    return res.json(err);
                });
        });
        // if scrape & creation of Article is successful, sends to client
        res.send("Scrape Complete");
    });
});

// GET all articles from database
app.get("/articles", function (req, res) {
    db.Article.find({})
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

// GET article by id
app.get("/articles/:id", function (req, res) {
    db.Article.findOne({ _id: req.params.id })
        .populate("note")
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

// POST for saving/updating an Article's associated Note
app.post("/articles/:id", function (req, res) {
    // creates a new note and passes the req.body to entry
    db.Note.create(req.body)
        .then(function (dbNote) {
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
        })
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});
// starts the server listening
app.listen(PORT, function () {
    console.log(`NewsApp is running on port ${PORT}!!!`);
});