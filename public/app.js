// Grab article as a json object
$.getJSON("/article", function(data) {
  for (var i = 0; i < data.length; i++) {
    $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].teaser + "<br />" + '<img src= "' + data[i].image + '">' + "<br />" + "</p>");
  }
});