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

// connects to Mongo DB
// mongoose.connect("mongodb://localhost/unit18Populater", { useNewUrlParser: true });
mongoose.connect("mongodb://localhost/newWebScraper", { useNewUrlParser: true });

// ROUTES
// **************** GET route scrapes from https://www.nytimes.com/ ****************
// A GET route for scraping the https://www.theonion.com/ website
app.get("/scrape", function(req, res) {
    // gets the body of the html with axios
    axios.get("https://www.theonion.com/").then(function(response) {
      // Then, we load that into cheerio and save it to $ for a shorthand selector
      var $ = cheerio.load(response.data);
  
      // grabs every h2 tag within "h1.headline.entry-title.js_entry-title" tag
      $("h1.headline.entry-title.js_entry-title").each(function(i, element) {
        // Save an empty result object
        var result = {};
  
        // Add the text and href of every link, and save them as properties of the result object
        result.title = $(this)
          .children("a")
          .text();
        result.link = $(this)
          .children("a")
          .attr("href");
  
        // Create a new Article using the `result` object built from scraping
        db.Article.create(result)
          .then(function(dbArticle) {
            // View the added result in the console
            console.log(dbArticle);
          })
          .catch(function(err) {
            // If an error occurred, send it to the client
            return res.json(err);
          });
      });
      // If we were able to successfully scrape and save an Article, send a message to the client
      res.send("Scrape Complete");
    });
  });
  
  // Route for getting all Articles from the db
  app.get("/articles", function(req, res) {
    // Grab every document in the Articles collection
    db.Article.find({})
      .then(function(dbArticle) {        
        res.json(dbArticle);
      })
      .catch(function(err) {        
        res.json(err);
      });
  });
  
  // Route for grabbing a specific Article by id, populate it with it's note
  app.get("/articles/:id", function(req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.Article.findOne({ _id: req.params.id })
      // ..and populate all of the notes associated with it
      .populate("note")
      .then(function(dbArticle) {        
        res.json(dbArticle);
      })
      .catch(function(err) {        
        res.json(err);
      });
  });
  
  // Route for saving/updating an Article's associated Note
  app.post("/articles/:id", function(req, res) {
    // Create a new note and pass the req.body to the entry
    db.Note.create(req.body)
      .then(function(dbNote) {
        return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
      })
      .then(function(dbArticle) {
        res.json(dbArticle);
      })
      .catch(function(err) {
        res.json(err);
      });
  });
// starts the server listening
app.listen(PORT, function () {
    console.log(`NewsApp is running on port ${PORT}!!!`);
});