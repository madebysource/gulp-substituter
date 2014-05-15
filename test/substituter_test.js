var assert = require('assert');
var replacer = require('../');
var File = require('vinyl');

describe('Substituter', function() {
  it('replaces matched strings with configured values', function(done) {
    var stream = replacer({
      key: 'value'
    });

    stream.write(new File({
      path: 'index.html',
      contents: new Buffer('hello <!-- replace:key -->')
    }));

    stream.on('data', function(file) {
      var content = file.contents.toString();
      assert.equal(content, 'hello value');
    });

    stream.on('end', done);

    stream.end();
  });
});
