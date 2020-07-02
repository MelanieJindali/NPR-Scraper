// Dependencies
var express = require("express");
var axios = require("axios");
var cheerio = require("cheerio");
var logger = require("morgan");
var mongoose = require("mongoose");

// Use morgan logger for logging requests
app.use(logger("dev"));

// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Make public a static folder
app.use(express.static("public"));

var app = express();

// Database config
var databaseUrl = "scraper";
var collections = ["scrapedData"];

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/unit18Populater", { useNewUrlParser: true });

// Main route (simple Hello World Message)
app.get("/", function(req, res) {
  res.send("Hello world");
});

// Retrieve data from the db
app.get("/all", function(req, res) {
  // Find all results from the scrapedData collection in the db
  db.scrapedData.find({}, function(error, found) {
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

// Scrape data from one site and place it into the mongodb db
app.get("/scrape", function(req, res) {
  // Make a request via axios for the news section of `ycombinator`
  axios.get("https://www.npr.org/sections/news/").then(function(response) {
    // Load the html body from axios into cheerio
    var $ = cheerio.load(response.data);

    $(".title").each(function(i, element) {
      // Scraping title, link, img and brief desc from article
      var result = {};

      result.title = $(this).children("a").text();
      result.link = $(this).children("a").attr("href");
      
      $(".teaser").each(function(i, element) {
      result.teaser = $(this).children("a").text();

      $("img.respArchListImg").each(function(i, element) {
      result.image = $(this).attr("src");

      $("span.date").each(function (i, element) {
        result.date = $(this).text();
      
        db.Article.create(result)
          .then(function(dbArticle) {
            console.log(dbArticle);
          })
          .catch(function(err) {
            console.log(err);
          });
        });
      });
    });
  });
});

  res.send("Scrape Complete! Look at your terminal.");
});

app.listen(8080, function() {
  console.log("App running on http://localhost:8080/ !");
});