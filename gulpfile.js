var path       = require('path');

/* ----- plugins ----- */

var gulp        = require('gulp');
var browserify  = require('browserify');
var clean       = require('gulp-clean');
var merge       = require('merge-stream');
var taskListing = require('gulp-task-listing');
var jshint      = require('gulp-jshint');
var sass        = require('gulp-sass');
var concat      = require('gulp-concat');
var uglify      = require('gulp-uglify');
var uglifycss   = require('gulp-uglifycss');
var rename      = require('gulp-rename');
var webserver   = require('gulp-webserver');
var source      = require('vinyl-source-stream');
var buffer      = require('vinyl-buffer');
var gulpif      = require('gulp-if');
var del         = require('del');
var runSequence = require('run-sequence');
var processes   = require('child_process');
var exec        = require('child_process').exec;


var isDebug;

/*----- build tasks -----*/

// Handle errors
function errorHandler (error) {
  console.log(error);
  this.emit('end');
}

// copy correct JS config file
gulp.task('x-js-config', function() {
  if (isDebug === true) {
    gulp.src(['src/js/config/development.js'])
      .pipe(rename("config.js"))
      .pipe(gulp.dest('src/js/app/'));
  } else {
    gulp.src(['src/js/config/production.js'])
      .pipe(rename("config.js"))
      .pipe(gulp.dest('src/js/app/'));
  }
});

// dev webserver
gulp.task('x-webserver', function() {
  gulp.src('build/')
    .pipe(webserver({
      livereload: true,
      directoryListing: false,
      open: true
    }));
});

// watch files for changes
gulp.task('x-watch', function() {
  gulp.watch('src/js/*.js', ['lint', 'x-browserify']);
  gulp.watch('src/js/app/*.js', ['lint', 'x-browserify']);
  gulp.watch('src/scss/*.scss', ['x-sass']);
  gulp.watch('src/js/config/*.js', ['x-js-config']);
  gulp.watch('src/images/**/*', ['x-images']);
  gulp.watch('src/html/*', ['x-html']);
  gulp.watch('dev/index.html', ['x-dev']);
  //gulp.watch(['src/images/**/*', 'src/html/*'], ['x-copy']);
});

// compile JS
gulp.task('x-browserify', function() {
  return browserify({
      entries: 'src/js/svg-editor.js',
      debug: isDebug
    })
    .bundle()
    .on("error", errorHandler)
    .pipe(source('svg-editor.js'))
    .pipe(buffer())
    .pipe(gulpif(!isDebug, uglify()))
    .pipe(gulp.dest('build'));
});

// compile SASS
gulp.task('x-sass', function() {
  return gulp.src('src/scss/*.scss')
    .pipe(sass({ includePaths: ['node_modules'] })
    .on('error', sass.logError))
    .pipe(gulp.dest('build'));
});

// compile HTML
gulp.task('x-html', function() {
  return gulp.src('./src/html/svg-editor.html')
    .pipe(gulp.dest('build'));
});

// copy images
gulp.task('x-images', function() {
  return gulp.src('src/images/**/*')
    .pipe(gulp.dest('build/images'));
});

// copy supporting files
gulp.task('x-copy', function() {
  return gulp.src(['src/images/**/*'])
    .pipe(gulp.dest('build/images'));
});

// minify assets
gulp.task('x-minify', function() {
  return gulp.src('build/css/*.css')
    .pipe(uglifycss({
      "max-line-len": 80
    }))
    .pipe(gulp.dest('build'));
});

// dev wrapper
gulp.task('x-dev', function() {
  return gulp.src('dev/index.html')
    .pipe(gulp.dest('build'));
});

/* ----- user tasks ----- */

// cleanup the build directory
gulp.task('clean', function() {
  return del(['./build/*']);
});

// lint javascript
gulp.task('lint', function() {
  return gulp.src(['src/js/*.js', 'src/js/app/*.js'], {base: 'src/js/'})
    .pipe(jshint())
    .on('error', errorHandler)
    .pipe(jshint.reporter('default'));
});

// build production assets
gulp.task('prod', function(done) {
  isDebug = false;
  return runSequence('clean',
                     'x-js-config',
                     'x-sass',
                     'x-browserify',
                     'x-minify',
                     'x-images',
                     done);
});

// start dev server
gulp.task('dev', [], function(done) {
  isDebug = true;
  return runSequence('clean',
                     'x-js-config',
                     'x-sass',
                     'x-browserify',
                     'x-images',
                     'x-dev',
                     'x-html',
                     ['lint', 'x-webserver', 'x-watch'],
                     done);
});

// default: list tasks
gulp.task('default', taskListing.withFilters(null, 'x-'));
