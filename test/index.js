'use strict';

var fs = require('fs');
var path = require('path');
var test = require('tape');
var remark = require('remark');
var license = require('..');

var read = fs.readFileSync;
var exists = fs.existsSync;

var ROOT = path.join(__dirname, 'fixtures');

test('remark-license()', function (t) {
  t.equal(typeof license, 'function', 'should be a function');

  t.doesNotThrow(function () {
    license(remark());
  }, 'should not throw if not passed options');

  t.end();
});

test.onFinish(function () {
  process.chdir(path.join(__dirname, '..'));
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

      process.chdir(filepath);

      config = exists(config) ? require(config) : {};
      output = exists(output) ? read(output, 'utf-8') : '';
      input = read(path.join(filepath, 'readme.md'), 'utf-8');

      fail = fixture.indexOf('fail-') === 0 ? fixture.slice(5) : '';

      try {
        result = remark().use(license, config).process(input).toString();

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
