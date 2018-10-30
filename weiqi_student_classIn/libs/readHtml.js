var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;

var _through2 = _interopRequireDefault(through);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * 复制图片
 */
function copyImage(options, file){
    if(file.isBuffer()){
        var _reg = new RegExp('<img.*src=["\']\.*?\>', 'gi'),
            _imgs = file.contents.toString().match(_reg),
            _reg2 = new RegExp('src=["\']\.*?["\']', 'gi'),
            _srcReg = new RegExp('src=["\']'),
            tmp;
        for(var i in _imgs){
            tmp = _imgs[i].match(_reg2)[0];
            if('function' === typeof options.modify){
                options.modify(tmp.replace(_srcReg, '').replace(/["']/, ''), file.path);
            }
        }
    }
}

function fixSrc(_string, _before){
    var reg = new RegExp(_before + '=["\']');

    return _string.replace(reg, '').replace(/["']/, '');
}

function createScript(src){
    return '<script type="text/javascript" src="' + src +'"></script>';
}

//修改Script路径
function suffixScript(options, file){
    if(file.isBuffer()){
        var _reg = new RegExp("<script.*src=\"\.*?\></script>", 'gi'),
            _imgs = file.contents.toString().match(_reg),
            _reg2 = new RegExp('src=["\']\.*?["\']', 'gi'),             //提取
            _scriptHtml = '';

        for(var i in _imgs){
            if(i == 0){
                if('undefined' !== typeof options.plugs){
                    for(var j in options.plugs){
                        _scriptHtml += createScript(options.plugs[j]);
                    }
                    _scriptHtml += _imgs[i];
                    file.contents.setSourceContent('');
                    console.log(_scriptHtml)
                }
                if('function' === typeof options.modify) options.modify(_imgs, file.path);
            }
        }
        //for end
    }
}

//修改样式路径
function suffixLink(){

}

/**
 * 读取html中img 图片路径
 */
function readHtml(){
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    return _through2.default.obj(function (file, enc, cb) {
        switch (options.type){
            case 'script' :
                suffixScript(options, file);
                break;
            case 'link' :
                suffixLink(options, file);
                break;
            default:
                copyImage(options, file);
                break;
        }
        this.push(file);
        cb();
    });
}

module.exports = readHtml;