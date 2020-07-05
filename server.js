// Dependencies
var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");

// Models
var db = require("./models")

var app = express();

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/npr", { useNewUrlParser: true });

// Retrieve data from the db
app.get("/all", function (req, res) {
  // Find all results from the scrapedData collection in the db
  db.scrapedData.find({}, function (error, found) {
    // Throw any errors to the console
    if (error) {
      console.log(error);
    }
    // If there are no errors, send the data to the browser as json
    else {
      res.json(found);
    }
  });
});

// Scrape data from npr and put results in model
app.get("/scrape", function (req, res) {
  // Make a request via axios for the news section of `ycombinator`
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

app.get("/article", function (req, res) {
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

app.listen(8080, function () {
  console.log("App running on http://localhost:8080/");
});