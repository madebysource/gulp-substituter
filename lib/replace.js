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

var isFunction = function(value) {
  return value instanceof Function;
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

  async.each(Object.keys(options), function(key, callback) {
    if (key === '__start' || key === '__end' || key === '__prefix') { return callback(); }

    var value = options[key];

    if (isFunction(value)) {
      value = value();
    }

    if (isStream(value)) {
      handleStream(value, function(err, value) {
        if (err) { return callback(err); }

        values[key] = value;
        callback(null, value);
      });
    } else {
      values[key] = value;
      callback();
    }
  }, function() {
    callback(null, content.replace(regex, function(string, name) {
      return values[name] || '';
    }));
  });
};

module.exports = replace;
