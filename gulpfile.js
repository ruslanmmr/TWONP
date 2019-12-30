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
  return gulp.src(["./src/views/**/*.pug", "!./src/views/blocks/*.pug", "!./src/views/layout/*.pug"])
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
gulp.task("scripts", function () {
  return gulp.src("./src/js/app.js")
    .pipe(webpackStream({
      mode: 'production',
      performance: {
        hints: false,
        maxEntrypointSize: 1000,
        maxAssetSize: 1000
      },
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
gulp.task("styles", function () {
  return gulp.src(["./src/styles/**/*.scss", "!./src/vendor/**/*.css"])
    .pipe(plumber())
    .pipe(sourcemaps.init())
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
    .pipe(plumber.stop())
    .pipe(sourcemaps.write("./maps/"))
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
gulp.task("dest", function () {
  return gulp.src(["./src/**/*", "./src/.htaccess", "!./src/img/**/*", "!./src/js/**/*", "!./src/styles/**/*", "!./src/views/**/*"])
    .pipe(gulp.dest("./dest/"))
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
    watch(["./src/**/*", "!./src/img/**/*", "!./src/js/**/*", "!./src/styles/**/*", "!./src/views/**/*"], gulp.series("dest"));
    res();
  });
});

// BUILD
gulp.task("default", gulp.series("clean",
  gulp.parallel("pug", "styles", "scripts", "images", "favicons", "dest"),
  gulp.parallel("watch", "serve")
));

//gulp deploy
gulp.task("deploy", function () {
  return gulp.src('./dest/**')
    .pipe(rsync({
      root: './dest/',
      hostname: '92.53.96.11',
      destination: '/home/c/ct60473/public_html/assets/components/project/dest',
      username: 'ct60473',
      archive: true,
      silent: false,
      compress: true
  }));
});
// Qmt7usfjXrxg

/* gulp.task("deploy", function () {
  return gulp.src('./dest/**')
    .pipe(rsync({
      root: './dest/',
      hostname: 'palmayasen.beget.tech',
      destination: '/home/p/palmayasen/palmayasen.beget.tech/public_html/assets/components/project/dest',
      username: 'palmayasen_test',
      archive: true,
      silent: false,
      compress: true
  }));
}); */


