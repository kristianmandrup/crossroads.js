var gulp = require("gulp");
var gutil = require("gulp-util");
var webpack = require("webpack");

webpack({
  // configuration
  context: __dirname + "/dev/src",
  entry: "./crossroads",
  output: {
    path: __dirname + "/dist",
    filename: "crossroads.js"
  }
}, function(err, stats) {
  console.log('error', err);
});