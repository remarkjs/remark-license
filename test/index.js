'use strict'

var fs = require('fs')
var path = require('path')
var test = require('tape')
var remark = require('remark')
var license = require('..')

var read = fs.readFileSync
var exists = fs.existsSync

var ROOT = path.join(__dirname, 'fixtures')

test('license()', function(t) {
  t.equal(typeof license, 'function', 'should be a function')

  t.doesNotThrow(function() {
    license.call(remark())
  }, 'should not throw if not passed options')

  t.end()
})

test('current working directory', function(t) {
  t.plan(1)

  remark()
    .use(license)
    .process('# License', function(err, file) {
      t.deepEqual(
        [err, String(file)],
        [
          null,
          '# License\n\n[MIT](license) © [Titus Wormer](https://wooorm.com)\n'
        ]
      )
    })
})

test('Fixtures', function(t) {
  var paths = fs.readdirSync(ROOT).filter(filter)

  t.plan(paths.length)

  paths.forEach(each)

  function each(fixture) {
    var filepath = path.join(ROOT, fixture)
    var config = path.join(filepath, 'config.json')
    var output = path.join(filepath, 'output.md')
    var input
    var fail
    var file

    config = exists(config) ? require(config) : {}
    output = exists(output) ? read(output, 'utf-8') : ''
    input = read(path.join(filepath, 'readme.md'))
    file = {contents: input, cwd: filepath, path: 'readme.md'}
    fail = fixture.indexOf('fail-') === 0 ? fixture.slice(5) : ''

    remark()
      .use(license, config)
      .process(file, function(err, file) {
        if (err) {
          if (!fail) {
            throw err
          }

          fail = new RegExp(fail.replace(/-/g, ' '), 'i')

          t.equal(
            fail.test(String(err).replace(/`/g, '')),
            true,
            'should fail on `' + fixture + '` matching `' + fail + '`'
          )
        } else {
          t.equal(String(file), output, 'should work on `' + fixture + '`')
        }
      })
  }
})

function filter(filepath) {
  return filepath.indexOf('.') !== 0
}
