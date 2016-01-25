'use strict';

let gulp = require('gulp');
let gutil = require('gulp-util');
let notify = require('gulp-notify');
let filter = require('gulp-filter');
// bundle
let browserify = require('browserify');
let watchify = require('watchify');
let babelify = require('babelify');
// scripts
let uglify = require('gulp-uglify');
let eslint = require('gulp-eslint');
// styles
let sass = require('gulp-sass');
let autoprefixer = require('gulp-autoprefixer');
let cssminify = require('gulp-cssnano');
// general
let rename = require('gulp-rename');
let buffer = require('vinyl-buffer');
let source = require('vinyl-source-stream');
let browserSync = require('browser-sync');
let sourcemaps = require('gulp-sourcemaps');

const paths = {
 build: 'build/',
 scss: 'css/scss/',
 scripts: 'js/',
 mainJs: 'main.js'
};

let build = (file, watch) => {
  // build options
  let opts = {
    entries: ['./js/' + file],
    debug: true,
    cache: {},
    packageCache: {},
    transform: [babelify]
  };

  let bundler = (watch) ? watchify(browserify(opts)) : browserify(opts);

  let rebundle = () => {
    let stream = bundler.bundle();

    return stream
      .on('error', handleErrors)
      .pipe(source(file))
      .pipe(buffer())
      .pipe(uglify())
      .pipe(rename({ suffix: '.min' }))
      .pipe(gulp.dest(paths.build))
      .pipe(browserSync.stream())
  };

  bundler.on('update', () => {
    rebundle();
    gutil.log('Bundling now...');
  });

  return rebundle();
};

let handleErrors = function() {
  let args = Array.prototype.slice.call(arguments);

  notify.onError({
    title: 'Compile Error',
    message: '<%= error.message %>'
  }).apply(this, args);

  this.emit('end'); // Keep gulp from hanging on this task
};

gulp.task('browser-sync', () => {
  return browserSync.init({
    server: { },
    ghostMode: false
  })
});

gulp.task('bs-reload', () => {
  return browserSync.reload();
});

gulp.task('lint', function () {
  return gulp
    .src([`${paths.js}**/*.js`])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
});

gulp.task('bundle', () => {
  return build(paths.mainJs, false);
});

gulp.task('sass', function() {
  return gulp.src(paths.scss + 'style.scss')
    .pipe(sourcemaps.init({
      loadMaps: true
    }))
    .pipe(sass())
    .pipe(autoprefixer({
      browsers: ['last 4 versions'],
      cascade: false
    }))
    .pipe(cssminify())
    .pipe(rename({ suffix: '.min' }))
    .pipe(sourcemaps.write('maps'))
    .pipe(gulp.dest(paths.build))
    .pipe(filter('**/*.css'))
    .pipe(browserSync.stream())
});

gulp.task('default', ['sass', 'lint', 'bundle', 'browser-sync'], () => {
  gulp.watch('css/**/*', ['sass']);
  gulp.watch('*.html', ['bs-reload']);

  return build(paths.mainJs, true);
});
