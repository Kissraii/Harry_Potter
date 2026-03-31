
'use strict';

const { src, dest, watch, series, parallel } = require('gulp');
const sass         = require('gulp-sass')(require('sass'));
const autoprefixerPkg = require('gulp-autoprefixer');
const autoprefixer = autoprefixerPkg.default || autoprefixerPkg;
const cleanCSS     = require('gulp-clean-css');
const uglify       = require('gulp-uglify');
const concat       = require('gulp-concat');
const sourcemaps   = require('gulp-sourcemaps');
const rename       = require('gulp-rename');
const browserSync  = require('browser-sync').create();
const path         = require('path');
const fs           = require('fs');

// ============================================================
// CONFIGURAÇÃO DE CAMINHOS
// ============================================================

const paths = {
  html: {
    src:  'src/index.html',
    dest: 'dist/',
  },
  styles: {
    "build": "vite build",
    src:   'src/styles/main.scss',
    watch: 'src/scss/**/*.scss',
    dest:  'dist/css/',
  },
  scripts: {
    src:   'src/js/**/*.js',
    dest:  'dist/js/',
  },
  images: {
    src:   'src/images/**/*',
    dest:  'dist/images/',
  },
};

// ============================================================
// TASK: HTML
// Copia o HTML para dist e injeta o reload
// ============================================================

function html(done) {
  // Lê o HTML fonte e copia para dist
  const srcFile  = path.resolve(__dirname, paths.html.src);
  const destDir  = path.resolve(__dirname, paths.html.dest);

  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  let content = fs.readFileSync(srcFile, 'utf8');
  fs.writeFileSync(path.join(destDir, 'index.html'), content, 'utf8');

  done();
}

// ============================================================
// TASK: STYLES
// Compila Sass → Autoprefixer → Minifica → Sourcemaps
// ============================================================

function styles() {
  return src(paths.styles.src)
    .pipe(sourcemaps.init())
    .pipe(
      sass({
        outputStyle: 'expanded',
        includePaths: ['src/scss'],
      }).on('error', sass.logError)
    )
    .pipe(
      autoprefixer({
        cascade:  false,
        grid:     true,
        browsers: ['last 3 versions', '> 1%', 'IE 11'],
      })
    )
    .pipe(dest(paths.styles.dest))
    .pipe(cleanCSS({ level: 2 }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(sourcemaps.write('.'))
    .pipe(dest(paths.styles.dest))
    .pipe(browserSync.stream());
}

// ============================================================
// TASK: SCRIPTS
// Concatena → Uglify → Sourcemaps
// ============================================================

function scripts() {
  return src(paths.scripts.src)
    .pipe(sourcemaps.init())
    .pipe(concat('main.js'))
    .pipe(dest(paths.scripts.dest))
    .pipe(uglify({
      compress: {
        drop_console: false,
        passes: 2,
      },
      mangle: true,
    }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(sourcemaps.write('.'))
    .pipe(dest(paths.scripts.dest))
    .pipe(browserSync.stream());
}

// ============================================================
// TASK: IMAGES
// Copia imagens para dist (sem compressão para compatibilidade)
// ============================================================

function images(done) {
  const srcDir  = path.resolve(__dirname, 'src/images');
  const destDir = path.resolve(__dirname, 'dist/images');

  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  if (fs.existsSync(srcDir)) {
    const files = fs.readdirSync(srcDir);
    files.forEach(file => {
      const srcPath  = path.join(srcDir, file);
      const destPath = path.join(destDir, file);
      if (fs.statSync(srcPath).isFile()) {
        fs.copyFileSync(srcPath, destPath);
      }
    });
  }

  done();
}

// ============================================================
// TASK: BROWSER SYNC
// Servidor local com live reload
// ============================================================

function serve(done) {
  browserSync.init({
    server: {
      baseDir: './dist',
    },
    port:   3000,
    open:   false,
    notify: false,
    ui: {
      port: 3001,
    },
  });
  done();
}

// ============================================================
// TASK: WATCH
// Observa mudanças nos arquivos fonte
// ============================================================

function watchFiles() {
  watch(paths.styles.watch,  styles);
  watch(paths.scripts.src,   scripts);
  watch(paths.html.src,      series(html, reload));
  watch(paths.images.src,    series(images, reload));
}

function reload(done) {
  browserSync.reload();
  done();
}

// ============================================================
// TASK: CLEAN
// Limpa a pasta dist
// ============================================================

function clean(done) {
  const distDir = path.resolve(__dirname, 'dist');
  if (fs.existsSync(distDir)) {
    const removeDir = (dir) => {
      if (fs.existsSync(dir)) {
        fs.readdirSync(dir).forEach(file => {
          const curPath = path.join(dir, file);
          if (fs.lstatSync(curPath).isDirectory()) {
            removeDir(curPath);
          } else {
            fs.unlinkSync(curPath);
          }
        });
        // Não remove o diretório raiz dist, apenas limpa
      }
    };
    removeDir(distDir);
  }
  done();
}

// ============================================================
// TASK: BUILD INFO
// Exibe informações do build no terminal
// ============================================================

function buildInfo(done) {
  const now = new Date();
  console.log('\n');
  console.log('╔════════════════════════════════════════╗');
  console.log('║   ⚡ Harry Potter Landing Page Build ⚡  ║');
  console.log('╠════════════════════════════════════════╣');
  console.log(`║  📅 Data: ${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR')}    ║`);
  console.log('║  🏰 Hogwarts School of Witchcraft      ║');
  console.log('║  🪄 Gulp + Sass + JS + BrowserSync     ║');
  console.log('╚════════════════════════════════════════╝');
  console.log('\n');
  done();
}

// ============================================================
// EXPORTS — TASKS PÚBLICAS
// ============================================================

// Build completo (produção)
const build = series(
  buildInfo,
  parallel(styles, scripts, images),
  html
);

// Desenvolvimento com watch + BrowserSync
const dev = series(
  build,
  serve,
  watchFiles
);

// Exports
exports.html    = html;
exports.styles  = styles;
exports.scripts = scripts;
exports.images  = images;
exports.clean   = clean;
exports.build   = build;
exports.dev     = dev;
exports.default = dev;
