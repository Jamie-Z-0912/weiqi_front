'use strict';

var _isFn = require('is-fn');

var _isFn2 = _interopRequireDefault(_isFn);

var _rework = require('rework');

var _rework2 = _interopRequireDefault(_rework);

var _reworkPluginUrl = require('rework-plugin-url');

var _reworkPluginUrl2 = _interopRequireDefault(_reworkPluginUrl);

var _through = require('through2');

var _through2 = _interopRequireDefault(_through);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Transforms URLs in files
 * @param {String} filePath - path of CSS file that may be used by options.modify
 * @param {String} fileContents - contents of the file at filePath
 * @param {Object} options - rules for modifying URLs
 * @param {String} [options.append] - URLs are appended with this value
 * @param {Function} [options.modify] - This function is always called before append and prepend
 * @param {String} [options.prepend] - URLs are prepended with this value
 * @return {String} - transformed URL
 */
function modifyUrls(filePath, fileContents, options) {
    return (0, _rework2.default)(fileContents).use((0, _reworkPluginUrl2.default)(function (url) {
        if (url.indexOf('data:') === 0) {
            return url;
        }

        if ((0, _isFn2.default)(options.modify)) {
            url = options.modify(url, filePath);
        }

        if (typeof options.prepend === 'string') {
            url = options.prepend + url;
        }

        if (typeof options.append === 'string') {
            url += options.append;
        }

        return url;
    })).toString();
}

/**
 * Pushes along files with transformed URLs
 * @param {Object} [options={}] - same as described for modifyUrls function
 * @return {Stream} - file with transformed URLs
 */
module.exports = function () {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    return _through2.default.obj(function (file, enc, cb) {
        var modifiedContents = modifyUrls(file.path, file.contents.toString(), options);

        file.contents = new Buffer(modifiedContents);

        this.push(file);

        cb();
    });
};