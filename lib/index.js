// // TODO: Implement module
// module.exports = (name, options) => {
//   if (typeof name !== 'string') {
//     throw new TypeError(`Expected a string, got ${typeof name}`)
//   }

//   options = Object.assign({}, options)

//   return `${name}@${options.host || 'zce.me'}`
// }

const { src, dest, parallel, series, watch } = require("gulp");

const loadPlugins = require("gulp-load-plugins");

const plugins = loadPlugins();

const broswerSync = require("browser-sync");

const del = require("del");

const bs = broswerSync.create();

const cwd = process.cwd();

let config = {
  build: {
    src: "src",
    dist: "dist",
    temp: "temp",
    public: "public",
    paths: {
      styles: "assets/styles/*.scss",
      scripts: "assets/scripts/*.js",
      pages: "*.html",
      images: "assets/images/**",
      fonts: "assets/fonts/**"
    }
  }
};
try {
  const loadConfig = require(`${cwd}/pages.config.js`);

  config = Object.assign({}, config, loadConfig);
} catch (error) {}

const clean = () => {
  return del([config.build.dist, config.build.temp]);
};

const style = () => {
  return src(config.build.paths.styles, {
    base: config.build.src,
    cwd: config.build.src
  })
    .pipe(plugins.sass({ outputStyle: "expanded" }))
    .pipe(dest(config.build.temp));
};

const shell = () => {
  return src(config.build.paths.scripts, {
    base: config.build.src,
    cwd: config.build.src
  })
    .pipe(plugins.babel({ presets: [require("@babel/preset-env")] }))
    .pipe(dest(config.build.temp));
};

const template = () => {
  return src(config.build.paths.pages, {
    base: config.build.src,
    cwd: config.build.src
  })
    .pipe(plugins.swig({ data: config.data }))
    .pipe(dest(config.build.temp));
};

const image = () => {
  return src(config.build.paths.images, {
    base: config.build.src,
    cwd: config.build.src
  })
    .pipe(plugins.imagemin())
    .pipe(dest(config.build.temp));
};

const font = () => {
  return src(config.build.paths.fonts, {
    base: config.build.src,
    cwd: config.build.src
  })
    .pipe(plugins.imagemin())
    .pipe(dest(config.build.dist));
};

const extra = () => {
  return src("**", {
    base: config.build.public,
    cwd: config.build.public
  }).pipe(dest(config.build.dist));
};

const useref = () => {
  return src(config.build.paths.pages, {
    base: config.build.temp,
    cwd: config.build.temp
  })
    .pipe(plugins.useref({ searchPath: [config.build.temp, "."] }))
    .pipe(plugins.if(/\.*css$/, plugins.cleanCss()))
    .pipe(plugins.if(/\.js$/, plugins.uglify()))
    .pipe(
      plugins.if(
        /\.html$/,
        plugins.htmlmin({
          collapseWhitespace: true,
          minifyCSS: true,
          minifyJS: true
        })
      )
    )
    .pipe(dest(config.build.dist));
};

const compile = parallel(style, shell, template);

const build = series(
  clean,
  parallel(series(compile, useref), extra, image, font)
);

const server = () => {
  watch(config.build.paths.styles, { cwd: config.build.src }, style);
  watch(config.build.paths.scripts, { cwd: config.build.src }, shell);
  watch(config.build.paths.pages, { cwd: config.build.src }, template);
  // watch("src/assets/images/**", image);
  // watch("src/assets/fonts/**", font);
  // watch("public/**", extra);
  watch(
    [
      config.build.paths.images,
      config.build.paths.fonts
      // "public/**"
    ],
    { cwd: config.build.src },
    bs.reload
  );

  watch("**", { cwd: config.build.public }, bs.reload);
  bs.init({
    // port: 2080,
    notify: false,
    files: `${config.build.temp}/**`,
    server: {
      baseDir: [config.build.temp, config.build.src, config.build.public],
      routes: {
        "/node_modules": "node_modules"
      }
    }
  });
};

const develop = series(compile, server);

module.exports = { build, clean, develop };
