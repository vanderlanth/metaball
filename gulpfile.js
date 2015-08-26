'use strict';
var gulp = require('gulp');
var sass = require('gulp-sass');
var jade = require('gulp-jade');
var uglify = require('gulp-uglify');
var autoprefixer = require('gulp-autoprefixer');
var eslint = require('gulp-eslint');
var browserSync = require('browser-sync').create();


gulp.task('watch', function(gulpCallback) {
  browserSync.init({
    server: './build/',
    open: true
  }, function callback() {
    gulp.watch('build/*.html', browserSync.reload);
    gulp.watch('build/*.css', browserSync.reload);
    gulp.watch('build/*.js', browserSync.reload);
    gulp.watch('src/*.scss', ['sass']);
    gulp.watch('src/*.jade', ['global']);
    gulp.watch('src/*.js',['scripts']);
    gulp.watch('src/*.js',['eslint']);
    gulpCallback();
  });
});


gulp.task('sass', function() {
    return gulp.src('src/*.scss')
    .pipe(sass())
    .pipe(autoprefixer({
        cascade: false
     }))
    .pipe(gulp.dest('build/'))
    .pipe(browserSync.stream());
});


gulp.task('global', function(){
    var opts = {
        conditionals: true,
        spare:true
    };
    return gulp.src(['src/*.jade'])
    .pipe(jade())
    .pipe(gulp.dest('build/'))
    .pipe(browserSync.stream());
});

gulp.task('scripts', function() {
     return gulp.src('src/*.js')
    //.pipe(uglify())
    .pipe(gulp.dest('build/'))
    .pipe(browserSync.stream());
});


gulp.task('eslint', function() {
     return gulp.src('src/*.js')
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
});


gulp.task('default', ['watch']);
