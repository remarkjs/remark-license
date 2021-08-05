import fs from 'fs'
import path from 'path'
import test from 'tape'
import remark from 'remark'
import hidden from 'is-hidden'
import negate from 'negate'
import license from '../index.js'

var root = path.join('test', 'fixtures')

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

test('Fixtures', async function (t) {
  var fixtures = fs.readdirSync(root).filter(negate(hidden))
  var index = -1

  while (++index < fixtures.length) {
    const name = fixtures[index]
    let config
    let output

    try {
      config = JSON.parse(fs.readFileSync(path.join(root, name, 'config.json')))
    } catch (_) {
      try {
        config = (
          await import(
            new URL(
              path.join('.', 'fixtures', name, 'config.js'),
              import.meta.url
            )
          )
        ).default
      } catch (_) {}
    }

    try {
      output = String(fs.readFileSync(path.join(root, name, 'output.md')))
    } catch (_) {
      output = ''
    }

    try {
      const file = await remark()
        .use(license, config)
        .process({
          contents: fs.readFileSync(path.join(root, name, 'readme.md')),
          cwd: path.join(root, name),
          path: 'readme.md'
        })

      t.equal(String(file), output, 'should work on `' + name + '`')
    } catch (error) {
      if (name.indexOf('fail-') === 0) {
        const expression = new RegExp(name.slice(5).replace(/-/g, ' '), 'i')

        t.equal(
          expression.test(String(error).replace(/`/g, '')),
          true,
          'should fail on `' + name + '` matching `' + expression + '`'
        )
      } else {
        t.ifError(error, name)
      }
    }
  }

  t.end()
})
