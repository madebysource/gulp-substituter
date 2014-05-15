var extend = require('node.extend');
var async = require('async');
var escape = require('escape-regexp');

var defaultOptions = {
  __start: '<!--',
  __end: '-->',
  __prefix: 'substitute'
};

var createRegex = function(start, end, prefix) {
  return new RegExp(escape(start) + '\\s*' + escape(prefix) + '(\\S+)\\s*' + escape(end), 'g');
};

var isStream = function(stream) {
  return stream && stream.on;
};

var handleStream = function(data, callback) {
  var result = '';

  data.on('data', function(text) {
    if (text.contents) {
      result += text.contents.toString();
    } else {
      result += text.toString();
    }
  });

  data.on('error', function(err) {
    callback(err);
  });

  data.on('end', function() {
    callback(null, result);
  });
};

var replace = function(content, options, callback) {
  options = extend(true, {}, defaultOptions, options);

  var prefix = options.__prefix || '';

  if (prefix) { prefix += ':'; }

  var regex = createRegex(options.__start, options.__end, prefix);

  var values = {};

  var finished = function() {
    var replaced = content.replace(regex, function(string, name) {
      return values[name] || '';
    });

    callback(null, replaced);
  };

  var eachFile = function(key, callback) {
    if (key === '__start' || key === '__end' || key === '__prefix') { callback(); return; }

    var save = function(err, value) {
      if (err) { return callback(err); }

      values[key] = value;

      callback(null, value);
    };

    var handleValue = function(value) {
      if (isStream(value)) {
        handleStream(value, save);
      } else {
        save(null, value);
      }
    };

    var value = options[key];

    if (value instanceof Function) {
      value = value();
    }

    handleValue(value);
  };

  async.each(Object.keys(options), eachFile, finished);
};

module.exports = replace;
