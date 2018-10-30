var through = require('through2');
var entities = require('entities');                      //unicode解码

module.exports = function(){
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    return through.obj(function (file, enc, cb) {
        file.contents = new Buffer(entities.decode(file.contents.toString()));
        this.push(file);
        cb();
    });
};