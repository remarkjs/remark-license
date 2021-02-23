'use strict'

var fs = require('fs')
var path = require('path')
var test = require('tape')
var remark = require('remark')
var hidden = require('is-hidden')
var negate = require('negate')
var license = require('..')

var root = path.join(__dirname, 'fixtures')

fs.writeFileSync(
  path.join(root, 'fail-unexpected-end-of-json', 'package.json'),
  '{\n'
)

process.on('exit', () => {
  fs.unlinkSync(path.join(root, 'fail-unexpected-end-of-json', 'package.json'))
})

test('current working directory', function (t) {
  t.plan(1)

  remark()
    .use(license)
    .process('# License', function (error, file) {
      t.deepEqual(
        [error, String(file)],
        [
          null,
          '# License\n\n[MIT](license) © [Titus Wormer](https://wooorm.com)\n'
        ]
      )
    })
})

test('Fixtures', function (t) {
  var fixtures = fs.readdirSync(root).filter(negate(hidden))
  var index = -1

  t.plan(fixtures.length)

  while (++index < fixtures.length) {
    one(fixtures[index])
  }

  function one(name) {
    var config
    var output

    try {
      config = JSON.parse(fs.readFileSync(path.join(root, name, 'config.json')))
    } catch (_) {
      try {
        config = require(path.join(root, name, 'config.js'))
      } catch (_) {}
    }

    try {
      output = String(fs.readFileSync(path.join(root, name, 'output.md')))
    } catch (_) {
      output = ''
    }

    remark()
      .use(license, config)
      .process(
        {
          contents: fs.readFileSync(path.join(root, name, 'readme.md')),
          cwd: path.join(root, name),
          path: 'readme.md'
        },
        function (error, file) {
          var expression

          if (name.indexOf('fail-') === 0) {
            expression = new RegExp(name.slice(5).replace(/-/g, ' '), 'i')

            t.equal(
              expression.test(String(error).replace(/`/g, '')),
              true,
              'should fail on `' + name + '` matching `' + expression + '`'
            )
          } else if (error) {
            throw error
          } else {
            t.equal(String(file), output, 'should work on `' + name + '`')
          }
        }
      )
  }
})
