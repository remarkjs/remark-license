'use strict';

var fs = require('fs');
var path = require('path');
var vfile = require('vfile');
var test = require('tape');
var remark = require('remark');
var license = require('..');

var read = fs.readFileSync;
var exists = fs.existsSync;

var ROOT = path.join(__dirname, 'fixtures');

test('license()', function (t) {
  t.equal(typeof license, 'function', 'should be a function');

  t.doesNotThrow(function () {
    license.call(remark());
  }, 'should not throw if not passed options');

  t.end();
});

test('current working directory', function (t) {
  var result = remark().use(license).processSync('# License').toString();
  t.equal(result, '# License\n\n[MIT](LICENSE) © [Titus Wormer](http://wooorm.com)\n');
  t.end();
});

test('do not add license to license file itself', function (t) {
  var file = vfile({path: '~/LICENSE.txt', contents: 'Alpha *braavo* charlie.'});
  var result = remark().use(license).processSync(file).toString();
  t.equal(result, 'Alpha _braavo_ charlie.\n');
  t.end();
});

test('Fixtures', function (t) {
  fs.readdirSync(ROOT)
    .filter(function (filepath) {
      return filepath.indexOf('.') !== 0;
    })
    .forEach(function (fixture) {
      var filepath = path.join(ROOT, fixture);
      var config = path.join(filepath, 'config.json');
      var output = path.join(filepath, 'output.md');
      var input;
      var result;
      var fail;

      config = exists(config) ? require(config) : {};
      output = exists(output) ? read(output, 'utf-8') : '';
      input = read(path.join(filepath, 'readme.md'), 'utf-8');

      fail = fixture.indexOf('fail-') === 0 ? fixture.slice(5) : '';

      try {
        result = remark().use(license, config).processSync({contents: input, cwd: filepath}).toString();
        t.equal(result, output, 'should work on `' + fixture + '`');
      } catch (err) {
        if (!fail) {
          throw err;
        }

        fail = new RegExp(fail.replace(/-/g, ' '), 'i');

        t.equal(
            fail.test(err.toString().replace(/`/g, '')),
            true,
            'should fail on `' + fixture + '`'
        );
      }
    });

  t.end();
});
