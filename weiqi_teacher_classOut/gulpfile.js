var gulp = require('gulp'),                         //gulp组件
    babelify = require('babelify'),                 //支持import 和 from 及export 功能解析
    concat = require('gulp-concat'),                //合并数据
    rename = require('gulp-rename'),                //重合名
    browser = require('browserify'),                //文件打包组件
    sass = require('gulp-sass'),                    //sass解析
    source = require('vinyl-source-stream'),        //stream流
    buffer = require('vinyl-buffer'),               //buffer流
    cheerio = require('gulp-cheerio'),              //dom操作
    uglify = require('gulp-uglify'),                //js合并
    cssmin = require('gulp-cssmin'),                //css压缩
    prefixer = require('gulp-autoprefixer'),        //追加前缀  'last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'
    header = require('gulp-header'),                //头部信息生成
    browserSync = require('browser-sync'),           //服务
    readCss = require('./libs/readCss'),
    readHtml = require('./libs/readHtml'),
    through = require('through2'),                           //读取文件流
    fs = require('fs'),                             //读取文件流
    decodeHtml = require('./libs/decode')           //解码
    ;

var _assetsDir = './assets',
    _buildDir = './build',
    _docsDir = './docs';

function getDate(){
    return (function(date){
        return date.getFullYear() + '/' + (date.getMonth()+1) + '/' + date.getDate()
    })(new Date());
}

//时间戳
function getStamp(){
    return new Date().getTime();
}

//获取路径
function getPath(url, u){
    u = 'undefined' !== typeof u ? u : '/';
    var _index = url.lastIndexOf(u), _fileName = url.substring(_index + 1), _name = _fileName.substr(0, _fileName.lastIndexOf('.'));
    return { dir : url.substring(0, _index), fileName : url.substring(_index + 1), name : _name };
}

//获取json数据
function getJson(_url){
    return JSON.parse(fs.readFileSync(_assetsDir + '/' + _url));
}

//开发环境
(function(){
    var _allJs = [
        _assetsDir + '/js/plugin/jquery-1.11.1.min.js',
        _assetsDir + '/js/plugin/bootstrap/bootstrap.min.js',
        _assetsDir + '/js/plugin/jquery.validate/jquery.validate.min.js',
        _assetsDir + '/js/plugin/cookie.js',
        _assetsDir + '/js/plugin/jquery.placeholder.min.js',
        _assetsDir + '/js/plugin/template.js',
        _assetsDir + '/js/plugin/crafty-min.js',
        _assetsDir + '/js/plugin/zy.media.min.js',
        _assetsDir + '/js/plugin/video.min.js',
        _assetsDir + '/js/plugin/common.js'
    ], _appCssName = 'app.min.css', _appPluginName = 'app.min.js', _commonCss = 'common.min.css', _commonJs = 'common.min.js', _indexJs = 'index.min.js',
        bannerData = {
            name : "WeiQi", description : 'This is a go project development', version : '0.0.1', author : 'Qiang', datetime : getDate()
        },
        banner = ['/**',
            '',
            ' * <%= pkg.name %> - <%= pkg.description %>',
            ' * @version v<%= pkg.version %>',
            ' * Copyright (c) 2015 <%= pkg.author %> by on <%= pkg.datetime %>',
            ' */',
            ''].join('\n');

    var _images = [];
    function writeLoad(path){
        _images[_images.length] = path;
        gulp.src(_assetsDir + '/js/pages/load.js')
            .pipe(through.obj(function(file,enc,cb){
                if(file.isBuffer()){
                    var _newString = new Buffer('var loading_images = "' + _images.toString() + '";');
                    file.contents = Buffer.concat([_newString, file.contents]);
                }
                this.push(file);
                cb();
            }))
            .pipe(gulp.dest(_buildDir + '/js/pages'));
    }

    //写入需要加载的图片
    gulp.task('imageList', function(){
        _images = [];
        return gulp.src(_buildDir + '/images/**/*')
            .pipe(through.obj(function(file,enc,cb){
                if(file.isBuffer()){
                    writeLoad(file.path.replace(__dirname + '\\' + _buildDir.substr(2) + '\\', '').replace(/\\/gi, '/'));
                }
                this.push(file);
                cb();
            }));
    });
    //js合并
    gulp.task('mJs', function(){
        return gulp.src(_allJs)
            .pipe(concat(_appPluginName))
            .pipe(gulp.dest(_buildDir + '/js'));
    });
    //css合并
    gulp.task('mCss', function(){
        return gulp.src(_assetsDir + '/css/*.css')
            .pipe(concat(_appCssName))
            .pipe(cssmin())
            .pipe(gulp.dest(_buildDir + '/css'));
    });
    //js
    gulp.task('js', function(){
        return browser(_assetsDir + '/js/index.js')
            .transform("babelify", {presets: ["es2015"], extensions: [".js"]})
            .bundle()
            .pipe(source('common.js'))
            .pipe(gulp.dest(_buildDir + '/js'))
            .pipe(rename(_commonJs))
            .pipe(buffer())
            .pipe(uglify())
            .pipe(gulp.dest(_buildDir + '/js'))
            .pipe(rename('wq.min.js'))
            .pipe(header(banner, {pkg : bannerData}))
            .pipe(gulp.dest(_buildDir + '/js'));
    });
    //css
    gulp.task('css', function(){
       return gulp.src(_assetsDir + '/sass/common.scss')
            .pipe(rename(_commonCss))
            .pipe(sass({outputStyle: 'expanded'}))
            .pipe(prefixer({
                browsers: ['last 15 versions', 'ie 8']
            }))
            .pipe(cssmin())
            .pipe(gulp.dest(_buildDir + '/css'));
    });
    //json
    gulp.task('json', function(){
        gulp.src(_assetsDir + '/json/*.json')
            .pipe(gulp.dest(_buildDir + '/json'));
    });
    //html
    var htmlPath = '';
    gulp.task('html', function(){
        htmlPath = '' != htmlPath ? htmlPath : _assetsDir + '/*.html';
        return gulp.src(htmlPath)
            .pipe(cheerio(function($){
                var scripts = $('script'), _body = $('body');
                //头部追加 样式
                $('head').append($('<link />').attr({
                    'rel' : 'stylesheet',
                    'type' : 'text/css',
                    'href' : 'css/' + _appCssName + '?_=v' + getStamp()
                })).append($('<link />').attr({
                    'rel' : 'stylesheet',
                    'type' : 'text/css',
                    'href' : 'css/' + _commonCss + '?_=v' + getStamp()
                }));
                //底部添加 js
                _body.append($('<script />').attr({
                    'type' : 'text/javascript',
                    'src' : 'js/' + _appPluginName + '?_=v' + getStamp()
                })).append($('<script />').attr({
                    'type' : 'text/javascript',
                    'src' : 'js/' + _commonJs + '?_=v' + getStamp()
                }));
                //追加js
                scripts.each(function(){
                    var _path;
                    if('undefined' !== typeof $(this).attr('src')){
                        _path = getPath(_assetsDir + '/' + $(this).attr('src'));
                        gulp.src(_path.dir + '/' + _path.fileName)
                            .pipe(gulp.dest(_path.dir.replace(_assetsDir, _buildDir)));

                        _body.append($(this).attr('src', $(this).attr('src') + '?_=v' + getStamp()));
                        //如果是加载页， 而调 imageList 进程执行 写入需要加载的图片集
                        if(_path.name == 'load'){
                            gulp.run('imageList');
                        }
                    }else{
                        if($(this).attr('type') != 'text/html') _body.append($(this));
                    }
                    //end
                });
                htmlPath = '';
            }))
            .pipe(decodeHtml())
            .pipe(gulp.dest(_buildDir + '/'));
    });
    //
    gulp.task('imageCss', function(){
        return gulp.src(_buildDir + '/css/*.css')
            .pipe(readCss({
                modify : function(url, filePath){
                    var files = getPath(url.substring(3));      //获取目录
                    fs.exists(_buildDir + '/' + files.dir + '/' + files.fileName, function(e){
                        if(!e){
                            gulp.src(_assetsDir + '/' + files.dir + '/' + files.fileName)
                                .pipe(gulp.dest(_buildDir +'/' + files.dir));
                        }
                    });
                    return filePath;
                }
            }));
    });
    //image
    gulp.task('imageHtml', function(){
        return gulp.src(_buildDir + '/*.html')
            .pipe(readHtml({
                modify : function(url, filePath){
                    var files = getPath(url);      //获取目录
                    fs.exists(_buildDir + '/' + url, function(e){
                        if(!e){
                            gulp.src(_assetsDir + '/' + files.dir + '/' + files.fileName)
                                .pipe(gulp.dest(_buildDir +'/'+ files.dir));
                        }
                    });
                    return filePath;
                }
            }));
    });
    //检测
    gulp.task('watch', function(){
        gulp.watch(_assetsDir + '/sass/*.scss', function(){
           gulp.run('css');
            setTimeout(function(){
                browserSync.reload();
            }, 50);
        });
        gulp.watch(_assetsDir + '/js/index.js', function(){
            gulp.run('js');
            setTimeout(function(){
                browserSync.reload();
            }, 150);
        });
        gulp.watch(_assetsDir + '/js/lib/*.js', function(){
            gulp.run('js');
            setTimeout(function(){
                browserSync.reload();
            }, 50);
        });
        gulp.watch(_assetsDir + '/js/pages/*.js', function(){
            gulp.run('html');
            setTimeout(function(){
                browserSync.reload();
            }, 50);
        });
        gulp.watch(_assetsDir + '/json/*.json', function(){
            gulp.run('json');
            browserSync.reload();
        });
        gulp.watch(_assetsDir + '/*.html', function(e){
            htmlPath = e.path;
            gulp.run('html');
            setTimeout(function(){
                browserSync.reload();
            }, 50);
        });
    });
    //服务
    gulp.task('default', function(){
        gulp.run('mJs', 'js', 'mCss', 'css', 'html', 'watch');

        browserSync({
            server : {
                baseDir : _buildDir +'/',
                tunnel : true
            }
        });
    });
})();

//生产环境
(function(){
     gulp.task('moveInfo', function(){
        return gulp.src([_buildDir + '/**/*', '!' + _buildDir + '/json/**', '!' + _buildDir + '/sgf/**', '!' + _buildDir + '/test/**', '!' + _buildDir + '/a01010101.mp4', '!' + _buildDir + '/svg.html', '!' + _buildDir + '/js/common.js', '!' + _buildDir + '/js/wq.min.js'])
         .pipe(gulp.dest(_docsDir + '/'))
     });
    gulp.task('ugJs', function(){
        return  gulp.src(_buildDir + '/js/pages/*')
            .pipe(uglify())
            .pipe(gulp.dest(_docsDir + '/js/pages/'))
    });
})();