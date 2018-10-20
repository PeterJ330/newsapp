var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");

var db = require("./models");
// var db = require("./models/index.js")
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

// connects to Mongo DB (database name is "newsapp")
mongoose.connect("mongodb://localhost/newsapp", { useNewUrlParser: true });

// ROUTES
// **************** GET route scrapes from https://www.nytimes.com/ ****************
app.get("/scrape", function (req, res) {
    // uses axios to grab the body of the html
    axios.get("https://www.nytimes.com/").then(function (response) {
        // loads the response into cheerio, sets it to var "$" to use as shorthand
        var $ = cheerio.load(response.data);

        // grabs all h2's within each article tag
        $("article h2").each(function (i, element) {
            var result = {};

            // adds the text of each link, stores them in results object
            result.title = $(this)
                .children("a")
                .text();
            result.link = $(this)
                .children("a")
                .attr("href");

            // uses result object to create a new Article
            db.Article.create(result)
                .then(function (dbArticle) {
                    console.log(dbArticle);
                })
                .catch(function (err) {
                    return res.json(err);
                });
        });
        // sends message if Article has been scraped & saved successfully
        res.send("Scrape Complete");
    });
});

// **************** GET all Articles from database
app.get("/articles", function (req, res) {
    db.Article.find({})
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

// **************** GET Article by id, populate w/ associated comments
app.get("/articles/:id", function (req, res) {
    db.Article.findOne({ _id: req.params.id })
        // .populate("comment")
        .populate("Comments")
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

// **************** POST for storing & updating an Article's associated comment(s)
app.post("/articles/:id", function (req, res) {
    // creates a new comment and passes req.body to entry
    // db.Comment.create(req.body)
    db.Comments.create(req.body)
        // .then(function (dbComment) {
        .then(function (dbComments) {
            // if creation of comment is successful, find one Article where "_id " = "req.params.id" & updates
            // Article so it is associated with the new Comment
            // return db.Article.findOneAndUpdate({ _id: req.params.id }, { comment: dbComment._id }, { new: true });
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { comments: dbComments._id }, { new: true });
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