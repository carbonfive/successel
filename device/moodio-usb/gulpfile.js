var gulp = require('gulp')
  , gutil = require('gulp-util')
  , coffee = require('gulp-coffee')
  , watch = require("gulp-watch");

gulp.task('coffee', function() {
  gulp.src('./coffee/*.coffee')
    .pipe(coffee({bare: true}).on('error', gutil.log))
    .pipe(gulp.dest('./public/js/'))
});

// task
gulp.task('watch-coffee', function () {
    watch('./coffee/*.coffee', function (files) { // watch any changes on coffee files
        gulp.start('coffee'); // run the compile task
    });
});
