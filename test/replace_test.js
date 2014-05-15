var assert = require('assert');
var replace = require('../lib/replace');
var fs = require('fs');

describe('replace', function() {
  it('returns original string when there is no variable', function(done) {
    replace('original content', {}, function(err, text) {
      assert.equal(text, 'original content');
      done();
    });
  });

  it('replaces variables in string', function(done) {
    var config = {
      title: 'hello'
    };

    replace('<!-- replace:title -->', config, function(err, text) {
      assert.equal(text, 'hello');
      done();
    });
  });

  it('replaces two variables', function(done) {
    var config = {
      title: 'hello',
      description: 'lorem'
    };

    replace('<!-- replace:title --> <!-- replace:description -->', config, function(err, text) {
      assert.equal(text, 'hello lorem');
      done();
    });
  });

  it('replaces with empty string all matches with no value', function(done) {
    var config = {
      title: 'hello'
    };

    replace('test: <!-- replace:nonexisting -->', config, function(err, text) {
      assert.equal(text, 'test: ');
      done();
    });
  });

  it('can define function as value', function(done) {
    var config = {
      value: function() {
        return '3';
      }
    };

    replace('<!-- replace:value -->', config, function(err, text) {
      assert.equal(text, '3');
      done();
    });
  });

  it('can define custom start and end characters', function(done) {
    var config = {
      __start: '{',
      __end: '}',
      value: 'hello'
    };

    replace('{ replace:value }', config, function(err, text) {
      assert.equal(text, 'hello');
      done();
    });
  });

  it('can define custom prefix', function(done) {
    var config = {
      __prefix: 'custom',
      value: 'hello'
    };

    replace('<!-- custom:value -->', config, function(err, text) {
      assert.equal(text, 'hello');
      done();
    });
  });

  it('allows optional spaces around variable name', function(done) {
    var config = {
      value: 'hello'
    };

    replace('<!--replace:value   -->', config, function(err, text) {
      assert.equal(text, 'hello');
      done();
    });
  });

  it('removes colon before variable if there is no prefix', function(done) {
    var config = {
      __prefix: null,
      value: 'hello'
    };

    replace('<!-- value -->', config, function(err, text) {
      assert.equal(text, 'hello');
      done();
    });
  });

  it('allows dashes in variable name', function(done) {
    var config = {
      'my-value': 'hello'
    };

    replace('<!-- replace:my-value -->', config, function(err, text) {
      assert.equal(text, 'hello');
      done();
    });
  });

  it('takes streams as values', function(done) {
    var config = {
      value: fs.createReadStream(__dirname + '/fixtures/file.txt')
    };

    replace('<!-- replace:value -->', config, function(err, text) {
      assert.equal(text, 'file content\n');
      done();
    });
  });

  it('works with stream inside function', function(done) {
    var config = {
      value: function() {
        return fs.createReadStream(__dirname + '/fixtures/file.txt');
      }
    };

    replace('<!-- replace:value -->', config, function(err, text) {
      assert.equal(text, 'file content\n');
      done();
    });
  });

  it('doesn\'t replace __start __end __prefix values', function(done) {
    replace('<!-- replace:__start --> <!-- replace:__end --> <!-- replace:__prefix -->', {}, function(err, text) {
      assert.equal(text, '  ');
      done();
    });
  });
});
