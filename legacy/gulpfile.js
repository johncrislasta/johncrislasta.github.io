var gulp = require('gulp');
var $    = require('gulp-load-plugins')();

var sassPaths = [
  'bower_components/foundation-sites/scss',
  'bower_components/motion-ui/src'
];

gulp.task('sass', function() {
  return gulp.src([ 'assets/scss/*.scss', "!assets/scss/_*.scss" ])
      .pipe($.sourcemaps.init())
      .pipe($.sass({
        includePaths: sassPaths,
        outputStyle: 'compressed' //options; expanded, nested, compact, compressed
      })
      .on('error', $.sass.logError))
      .pipe($.autoprefixer({
        browsers: ['last 10 versions', 'ie >= 10', 'ios 6']
      }))
      .pipe($.sourcemaps.write())
      .pipe(gulp.dest('assets/css'));
});

gulp.task('default', ['sass'], function() {
  gulp.watch(['assets/scss/**/*.scss'], ['sass']);
});