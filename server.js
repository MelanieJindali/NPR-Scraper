// Dependencies
var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");

// Models
var db = require("./models")

var app = express();

// Deployed database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://npr:password1@ds159772.mlab.com:59772/heroku_xwc8h9q1";
mongoose.connect(MONGODB_URI);

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/npr", { useNewUrlParser: true });

// Scrape data from npr and put results in model
app.get("/scrape", function (req, res) {
  axios.get("https://www.npr.org/sections/news/").then(function (response) {
    // Load the html body from axios into cheerio
    var $ = cheerio.load(response.data);

    $("article").each(function (i, element) {
      var result = {};

      result.title = $(element)
        .children(".item-info-wrap")
        .children(".item-info")
        .children(".title")
        .text();
      result.link = $(element)
        .children(".item-info-wrap")
        .children(".item-info")
        .children(".teaser")
        .children("a")
        .attr("href");
      result.teaser = $(element)
        .children(".item-info-wrap")
        .children(".item-info")
        .children(".teaser")
        .text();
      result.image = $(element)
        .children(".item-image")
        .children(".imagewrap")
        .children("a")
        .children("img")
        .attr("src");

      db.Article.create(result)
        .then(function (dbArticle) {
          console.log(dbArticle);
        })
        .catch(function (err) {
          console.log(err);
        });
    });
  });
  res.send("Scrape Complete! Look at your terminal.");
});

app.get("/articles", function (req, res) {
  // Grab every document in the Article collection
  db.Article.find({})
    .then(function (dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function (req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function (dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function (req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function (dbNote) {
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function (dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

app.listen(8080, function () {
  console.log("App running on http://localhost:8080/");
});