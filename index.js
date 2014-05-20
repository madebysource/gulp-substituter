var through = require('through2');
var replace = require('./lib/replace');
var gutil = require('gulp-util');

var replacer = function(options) {
  var stream = through.obj(function(file, enc, callback) {
    if (file.isNull()) {
      stream.push(file);
      return callback();
    }

    if (file.isStream()) {
      stream.emit('error', new gutil.PluginError('gulp-substituter', 'Streaming not supported'));
      return callback();
    }

    replace(file.contents.toString(), options, function(err, value) {
      if (err) {
        stream.emit('error', new gutil.PluginError('gulp-substituter', err));
        return callback();
      }

      file.contents = new Buffer(value, enc);
      stream.push(file);
      callback();
    });
  });

  return stream;
};

module.exports = replacer;
