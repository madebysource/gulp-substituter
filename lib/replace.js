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

var filterReservedKeyword = function(options) {

  var result = {};

  for (var name in options) {
    if (options.hasOwnProperty(name)) {
      if (name !== '__start' && name !== '__end' && name !== '__prefix') {
        result[name] = options[name];
      }
    }
  }

  return result;
};

var keysInContent = function(regex, content) {
  var result = content.match(regex);

  if (!result) { return []; }

  return result.map(function(item) {
    regex.lastIndex = 0;

    return regex.exec(item)[1];
  });
};

var evaluateItem = function(value, callback) {
  if (isFunction(value)) {
    value = value();
  }

  if (isStream(value)) {
    handleStream(value, callback);
  } else {
    callback(null, value);
  }
};

var evaluateProperties = function(regex, options, done) {
  var values = {};

  async.each(Object.keys(options), function(key, callback) {
    var value = options[key];

    evaluateItem(value, function(err, value) {
      if (err) { return callback(err); }

      values[key] = value;
      callback(null, value);
    });

  }, function(err) {
    done(err, values);
  });
};

var runReplace = function(regex, content, values, previousKeys) {
  previousKeys = previousKeys || [];

  var result = content.replace(regex, function(string, name) {
    return values[name] || '';
  });

  var keys = keysInContent(regex, result);

  if (keys.length > 0) {
    var isRecursive = keys.some(function(item) {
      return previousKeys.indexOf(item) > -1;
    });

    if (isRecursive) {
      throw new Error('Circular dependency detected');
    }

    return runReplace(regex, result, values, keys);
  }

  return result;
};

var replace = function(content, options, callback) {
  options = extend(true, {}, defaultOptions, options);

  var prefix = options.__prefix || '';

  if (prefix) { prefix += ':'; }

  var regex = createRegex(options.__start, options.__end, prefix);

  var values = filterReservedKeyword(options);

  evaluateProperties(regex, values, function(err, values) {
    if (err) { return callback(err); }

    var result;
    try {
      result = runReplace(regex, content, values);
    } catch (e) {
      return callback(e);
    }

    callback(null, result);
  });
};

module.exports = replace;
