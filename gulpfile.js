var gulp = require("gulp"),
    browsersync = require("browser-sync").create(),
    packageJson = require('./package.json'),
    autoprefixer = require("gulp-autoprefixer"),
    babel = require("gulp-babel"),
    uglify = require("gulp-uglify"),
    concat = require("gulp-concat"),
    pug = require("gulp-pug"),
    sass = require("gulp-sass"),
    mincss = require("gulp-clean-css"),
    sourcemaps = require("gulp-sourcemaps"),
    rename = require("gulp-rename"),
    favicons = require("gulp-favicons"),
    replace = require("gulp-replace"),
    newer = require("gulp-newer"),
    plumber = require("gulp-plumber"),
    debug = require("gulp-debug"),
    watch = require("gulp-watch"),
    clean = require("gulp-clean"),
    webpack = require('webpack'),
    webpackStream = require('webpack-stream'),
    rsync = require('gulp-rsync');

gulp.task("pug", function () {
  return gulp.src(["./src/views/**/*.pug", "!./src/views/blocks/*.pug"])
    .pipe(pug({
      pretty: true
    }))
    .pipe(replace("../dest/", "../"))
    .pipe(gulp.dest("./dest/"))
    .pipe(debug({
      "title": "html"
    }))
    .on("end", browsersync.reload);
});
gulp.task("pugBuild", function () {
  return gulp.src(["./src/views/**/*.pug", "!./src/views/blocks/*.pug"])
    .pipe(pug({
      pretty: false
    }))
    .pipe(replace("../dest/", "../"))
    .pipe(gulp.dest("./dest/"))
    .on("end", browsersync.reload);
});
gulp.task("scripts", function () {
  return gulp.src("./src/js/app.js")
    .pipe(webpackStream({
      mode: 'development',
      output: {
        filename: 'app.js',
      },
      module: {
        rules: [{
          test: /\.(js)$/,
          exclude: /(node_modules)/,
          loader: 'babel-loader',
          options: {
          presets: [
                [
                    "@babel/preset-env",
                    {
                      targets: {
                          node: "8.10"
                      }
                    }
                ]
            ]
          }
        }]
      }
    }))
    .pipe(rename({
      suffix: ".min"
    }))
    .pipe(gulp.dest("./dest/js/"))
    .pipe(debug({"title": "scripts"}))
    .on("end", browsersync.reload);
});
gulp.task("scriptsBuild", function () {
  return gulp.src("./src/js/app.js")
    .pipe(webpackStream({
      mode: 'production',
      output: {
        filename: 'app.js',
      },
      module: {
        rules: [{
          test: /\.(js)$/,
          exclude: /(node_modules)/,
          loader: 'babel-loader',
          query: {
            cacheDirectory: true,
            presets: ['env']
          }
        }]
      }
    }))
    .pipe(rename({
      suffix: ".min"
    }))
    .pipe(gulp.dest("./dest/js/"))
    .on("end", browsersync.reload);
});
gulp.task("styles", function () {
  return gulp.src(["./src/styles/**/*.scss", "!./src/vendor/**/*.css"])
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(autoprefixer({
      overrideBrowserslist: ["last 12 versions", "> 1%"]
    }))
    .pipe(rename({
      suffix: ".min"
    }))
    .pipe(replace("../../dest/", "../"))
    .pipe(plumber.stop())
    .pipe(sourcemaps.write("./maps/"))
    .pipe(gulp.dest("./dest/styles/"))
    .pipe(debug({
      "title": "styles"
    }))
    .on("end", browsersync.reload);
});
gulp.task("stylesBuild", function () {
  return gulp.src(["./src/styles/**/*.scss", "!./src/vendor/**/*.css"])
    .pipe(sass())
    .pipe(autoprefixer({
      overrideBrowserslist: ["last 12 versions", "> 1%"]
    }))
    .pipe(mincss({
      level: {
        1: {
          specialComments: 0
        }
      }
    }))
    .pipe(rename({
      suffix: ".min"
    }))
    .pipe(replace("../../dest/", "../"))
    .pipe(gulp.dest("./dest/styles/"))
    .on("end", browsersync.reload);
});
gulp.task("images", function () {
  return gulp.src(["./src/img/**/*.{jpg,jpeg,png,gif,svg}", "!./src/img/favicons/*.{jpg,jpeg,png,gif}"])
    .pipe(newer("./dest/img/"))
    .pipe(gulp.dest("./dest/img/"))
    .pipe(debug({
      "title": "images"
    }))
    .on("end", browsersync.reload);
});
gulp.task("favicons", function () {
  return gulp.src("./src/img/favicons/*.{jpg,jpeg,png,gif}")
    .pipe(favicons({
      icons: {
        appleIcon: true,
        favicons: true,
        online: false,
        appleStartup: false,
        android: false,
        firefox: false,
        yandex: false,
        windows: false,
        coast: false
      }
    }))
    .pipe(gulp.dest("./dest/img/favicons/"))
    .pipe(debug({
      "title": "favicons"
    }));
});
gulp.task("destPHP", function () {
  return gulp.src("./src/php/**/*")
    .pipe(gulp.dest("./dest/"))
    .on("end", browsersync.reload);
});
gulp.task("destVideos", function () {
  return gulp.src("./src/videos/**/*")
    .pipe(gulp.dest("./dest/videos/"))
    .on("end", browsersync.reload);
});
gulp.task("destFonts", function () {
  return gulp.src("./src/fonts/**/*")
    .pipe(gulp.dest("./dest/fonts/"))
    .on("end", browsersync.reload);
});
gulp.task("clean", function () {
  return gulp.src("./dest/*", {
      read: false
    })
    .pipe(clean())
    .pipe(debug({
      "title": "clean"
    }));
});
gulp.task("serve", function () {
  return new Promise((res, rej) => {
    browsersync.init({
      server: "./dest/",
      tunnel: false,
      port: 9000
    });
    res();
  });
});
//
gulp.task("watch", function () {
  return new Promise((res, rej) => {
    watch("./src/views/**/*.pug", gulp.series("pug"));
    watch("./src/styles/**/*.scss", gulp.series("styles"));
    watch("./src/js/**/*.js", gulp.series("scripts"));
    watch(["./src/img/**/*.{jpg,jpeg,png,gif,svg}", "!./src/img/favicons/*.{jpg,jpeg,png,gif}"], gulp.series("images"));
    watch("./src/img/favicons/*.{jpg,jpeg,png,gif}", gulp.series("favicons"));
    watch("./src/fonts/**/*", gulp.series("destFonts"));
    watch("./src/php/**/*", gulp.series("destPHP"));
    watch("./src/videos/**/*", gulp.series("destVideos"));
    res();
  });
});

// BUILD
gulp.task("default", gulp.series("clean",
  gulp.parallel("pug", "styles", "scripts", "destFonts", "destVideos", "destPHP", "images", "favicons"),
  gulp.parallel("watch", "serve")
));
//gulp build
gulp.task("build", gulp.series("clean", gulp.parallel("pugBuild", "stylesBuild", "scriptsBuild", "destFonts", "destVideos", "destPHP", "images", "favicons")));

/* //gulp deploy
gulp.task("deploy", function () {
  return gulp.src('./dest/**')
    .pipe(rsync({
      root: './dest/',
      hostname: 'u0683784@37.140.192.157',
      destination: 'www/test.artica.art/',
      archive: true,
      silent: false,
      compress: true,
      exclude: ['.htpasswd', '.htaccess'],
    }));
}); */