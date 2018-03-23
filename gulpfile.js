let gulp = require('gulp');
let $ = require('gulp-load-plugins')();
let lazypipe = require('lazypipe');
let fs = require('fs');
let pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

let filename = 'MoeGardenHelper-V' + pkg.version + '.' + (process.env.TRAVIS_BUILD_NUMBER || 0);
let path = 'release';
let mainTask = ['html', 'style', 'copy', 'manifest'];

$.jshintChannel = lazypipe()
    .pipe($.jshint)
    .pipe($.jshint.reporter, 'jshint-stylish')
    .pipe($.jshint.reporter, 'fail');

gulp.task('debug', $.sequence('set:d', ['script', 'live', 'background'], mainTask));
gulp.task('release', $.sequence('set:r', ['script', 'live', 'background'], mainTask, 'zip'));
gulp.task('default', function() {
    console.log('Please use `release` or `debug` task!');
});

gulp.task('set:r', function() {
    path = 'release';
    return;
});
gulp.task('set:d', function() {
    path = 'debug';
    return;
});

gulp.task('background', function() {
    return gulp.src('src/background/*.js')
        .pipe($.order(['Helper.js', 'Module*.js', 'Func*.js', '!Core.js', 'Core.js']))
        .pipe($.jshintChannel())
        .pipe($.concat('background.min.js'))
        .pipe($.if(path == 'release', $.babel({presets: ['env', 'minify']})))
        .pipe(gulp.dest(path + '/src/'));
});
gulp.task('live', function() {
    return gulp.src('src/live/*.js')
        .pipe($.order(['Helper.js', 'Module*.js', 'Func*.js', '!Core.js', 'Core.js']))
        .pipe($.jshintChannel())
        .pipe($.concat('live.js'))
        .pipe($.if(path == 'release', $.babel({presets: ['env', 'minify']})))
        .pipe($.rename({suffix: '.min'}))
        .pipe(gulp.dest(path + '/src/'));
});
gulp.task('script', function() {
    return gulp.src(['src/**/!(*.min).js', '!src/live/*.js', '!src/background/*.js'])
        .pipe($.jshintChannel())
        .pipe($.if(path == 'release', $.babel({presets: ['env', 'minify']})))
        .pipe($.rename({suffix: '.min'}))
        .pipe(gulp.dest(path + '/src/'));
});
gulp.task('html', function() {
    return gulp.src('src/**/*.html')
        .pipe($.if(path == 'release', $.htmlmin({
            collapseBooleanAttributes: true,
            minifyCSS: true,
            minifyJS: true,
            removeComments: true,
            quoteCharacter: '"'
        })))
        .pipe(gulp.dest(path + '/src/'));
});
gulp.task('style', function() {
    return gulp.src('src/**/!(*.min).css')
        .pipe($.if(path == 'release', $.cleanCss()))
        .pipe($.rename({suffix: '.min'}))
        .pipe(gulp.dest(path + '/src/'));
});
gulp.task('copy', function() {
    return gulp.src(['**/*.*', '!**/*.html', '!**/!(*.min).js', '!**/!(*.min).css', '!live/**', '!manifest.json'], {cwd: './src'})
        .pipe(gulp.dest(path + '/src/'));
});
gulp.task('manifest', function() {
    let manifest = JSON.parse(fs.readFileSync('./src/manifest.json', 'utf8'));
    manifest.version = pkg.version + '.' + (path == 'release' ? process.env.TRAVIS_BUILD_NUMBER : '0');
    manifest.description = pkg.description;
    if(!fs.existsSync(path + '/src')) {
        fs.mkdirSync(path);
        fs.mkdirSync(path + '/src');
    }
    fs.writeFileSync(path + '/src/manifest.json', JSON.stringify(manifest, null, '  '), {flag: 'w+'});
    return;
});
gulp.task('zip', function() {
    return gulp.src(path + '/src/**')
        .pipe($.zip(filename + '.zip'))
        .pipe(gulp.dest(path + '/'));
});
