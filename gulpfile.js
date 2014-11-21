var gulp    = require("gulp");
var webpack = require('webpack');
var gwebpack = require('gulp-webpack');

// var UglifyPlugin = require("webpack/lib/optimize/UglifyJsPlugin")

var config = {
  context: __dirname + "/dev/src",
  entry: "./crossroads",
  output: {
    path: __dirname + "/dist",
    filename: "crossroads.js"
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin()
  ]
};

gulp.task("webpack", function() {
  return gulp.src('src/crossroads.js')
    .pipe(gwebpack(config))
    .pipe(gulp.dest('dist/'));
});