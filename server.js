// Dependencies
var express = require("express");
var mongojs = require("mongojs");
var axios = require("axios");
var cheerio = require("cheerio");

var app = express();

// Database config
var databaseUrl = "scraper";
var collections = ["scrapedData"];

// Mongojs config 
var db = mongojs(databaseUrl, collections);
db.on("error", function(error) {
  console.log("Database Error:", error);
});

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
      var title = $(element).children("a").text();
      var link = $(element).children("a").attr("href");
      
      $(".teaser").each(function(i, element) {
      var teaser = $(element).children("a").text();

      $("img.respArchListImg").each(function(i, element) {
      var image = $(element).attr("src");

      $("span.date").each(function (i, element) {
        var date = $(element).text();
      
          if (title && link) {
          // Insert the data in the scrapedData db
          db.scrapedData.insert({
          title,
          link,
          teaser,
          image,
          date
          },
            function(err, inserted) {
          if (err) {
            console.log(err);
          }
          else {
            console.log(inserted);
          }
          });
          }
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