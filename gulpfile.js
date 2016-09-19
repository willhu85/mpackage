/**
 * mpackage
 *
 * @author  willHu
 * @date    2016-09-01
 * @contact email:huweiwei1@jd.com
 * 支持
 * 1. gulp-sass编译
 * 2. gulp-sourcemaps输出sourcemaps
 * 3. gulp.spritesmith精灵图拼接
 * 4. gulp-rename修改文件名
 * 5. gulp-clean清空文件夹
 * 6. gulp-concat连接文件
 * 7. gulp-uglify压缩文件
 * 8. gulp-load-plugins加载组件
 * 9. browsersync浏览器刷新
 * 10.run-sequence执行顺序
 * 11.gulp-requirejs-optimizeAMD合并
 * 12.gulp-watch增量更新监听
 * 13.gulo-imagemin图片压缩
 */

'use strict';

/* global require */
var gulp = require('gulp');
var gulpLoadPlugins = require('gulp-load-plugins');
var $ = gulpLoadPlugins({
    rename: {
        'gulp-requirejs-optimize': 'requirejsOptimize'
    }
});
var browserSync = require('browser-sync').create();

/* settings */
var settings = {
    srcPath: 'src', // 开发目录
    distPath: 'dist', // 发布目录
    imgPath: 'img', // 图片目录
    pngLevel: 3, // png 压缩等级
    spriteLevel: 60, // sprite 压缩等级
    imgRetina: true, // css sprite是否支持高清屏
    browser: ['google chrome'] // 启动浏览器种类
};


/* ========== tasks moudles ========== */
/* scss tasks */
// command:  gulp sass
gulp.task('sass', function() {
    return gulp.src(settings.srcPath + '/scss/**/*.scss')
        .pipe($.sourcemaps.init()) // sourcemaps init
        .pipe($.sass({
            /** outputstyle: default: nested  nested/expanded/compact/compressed
             nested:     层级缩进
             expanded:   无缩进，每个样式间有空行
             compact:    一行显示
             compressed: 全部压缩到一行
             */
            outputStyle: 'compressed'
        }).on('error', $.sass.logError))
        .pipe($.sourcemaps.write('/tmp/')) // output sourcemaps
        .pipe(gulp.dest(settings.srcPath + '/css/'));
});


/* javascript tasks */
// jshint, 默认获取目录下.jshintrc中的规则
// command:  gulp jshint
gulp.task('jshint', function() {
    return gulp.src(settings.srcPath + '/js/**/*.js')
        .pipe($.jshint())
        .pipe($.jshint.reporter('default'));
});

// uglify js
// command:  gulp uglify
gulp.task('uglify', function() {
    return gulp.src(settings.srcPath + '/js/**/*.js')
        .pipe($.uglify())
        .pipe(gulp.dest(settings.distPath + '/js/'));
});

/* images tasks */
// sprite images
// command:  gulp sprite
// gulp.task('sprite', function() {
//     return gulp.src(settings.srcPath + 'img/sprite/*.png')
//         .pipe($.spritesmith({
//             imgName: 'sprite.png',
//             cssName: 'sprite.css',
//             cssTemplate: ''
//         }))
//         .pipe(gulp.dest('path/to/output/'));
// });
gulp.task('sprite', function() {
    var spriteData = gulp.src(settings.srcPath + '/img/sprite/*.png')
        .pipe($.spritesmith({
            imgName: 'sprite.png',
            cssName: '_sprite.scss',
            imgPath: '',
            cssTemplate: 'sprite.handlebars'
        }));
    spriteData.img.pipe(gulp.dest(settings.imgPath));
    spriteData.css.pipe(gulp.dest(settings.srcPath + '/scss/'));
});
// imagemin
// command:  gulp imagemin
gulp.task('copyimg', function() {
    return gulp.src(settings.srcPath + '/img/*.*')
        .pipe(gulp.dest(settings.imgPath));
});

gulp.task('imagemin', ['copyimg'], function() {
    return gulp.src(settings.imgPath + '/**/*.*')
        .pipe($.imagemin({
            optimizationLevel: settings.pngLevel, //type：Number  default：3  range：0-7
            progressive: false, //type：Boolean default：false 无损压缩jpg图片
            interlaced: false, //type：Boolean default：false 隔行扫描gif进行渲染
            multipass: false //type：Boolean default：false 多次优化svg直到完全优化
        }))
        .pipe(gulp.dest(settings.imgPath));
});


// command:  gulp cleandist
gulp.task('cleandist', function() {
    return gulp.src(settings.distPath + '/', {
            read: false
        })
        .pipe($.clean());
});

// browserSync
// command:  gulp browsersync
var files = [
    settings.srcPath + '/**/*.css',
    settings.srcPath + '/**/*.js',
    settings.srcPath + '/**/*.html'
];
gulp.task('browsersync', function() {
    //if (settings.server.proxy && settings.server.proxy !== '') {
    //    browserSync.init({
    //        proxy: settings.server.proxy,
    //        open: 'external',
    //        port: settings.server.port
    //    });
    //} else {
    //
    //}
    browserSync.init(files, {
        server: {
            baseDir: './'
        },
        browser: settings.browser
    });
});

// require
//require('./tasks/require')(gulp, $, settings);


// tasks
// imagemin&sprite
gulp.task('img', [
    //'sprite',
    //'imagemin'
]);
// just watch js & scss
gulp.task('watch', function() {
    // 公用SCSS
    // 公用SCSS
    gulp.watch(settings.srcPath + '/scss/**/*.scss', ['sass']);
    // jshint
    gulp.watch([settings.srcPath + '/js/**/*.js'], ['jshint']);
});
// watch & browsersunc
gulp.task('default', [
    'browsersync',
    'watch'
]);

// copy to dist
gulp.task('copycss', function() {
    return gulp.src(settings.srcPath + '/css/**/*.css')
        .pipe(gulp.dest(settings.distPath + '/css/'));
});

// build to dist
gulp.task('build', ['cleanDist'], function() {
    gulp.run('copycss');
    gulp.run('uglify');
    gulp.run('imagemin');
});
