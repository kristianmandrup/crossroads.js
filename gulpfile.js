var gulp = require("gulp");
var gutil = require("gulp-util");
var webpack = require("webpack");

webpack({
  // configuration
  context: __dirname + "/dev/src",
  entry: "./crossroads",
  output: {
    path: __dirname + "/dist",
    filename: "bundle.js"
  }
}, function(err, stats) {
  // ...
});