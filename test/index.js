import fs from 'fs'
import path from 'path'
import test from 'tape'
import {remark} from 'remark'
import {isHidden} from 'is-hidden'
import license from '../index.js'

const root = path.join('test', 'fixtures')

fs.writeFileSync(
  path.join(root, 'fail-unexpected-end-of-json', 'package.json'),
  '{\n'
)

fs.renameSync('package.json', 'package.json.bak')

process.on('exit', () => {
  fs.unlinkSync(path.join(root, 'fail-unexpected-end-of-json', 'package.json'))
  fs.renameSync('package.json.bak', 'package.json')
})

test('Fixtures', async (t) => {
  const fixtures = fs.readdirSync(root)
  let index = -1

  while (++index < fixtures.length) {
    const name = fixtures[index]
    let config
    let output

    if (isHidden(name)) continue

    try {
      config = JSON.parse(fs.readFileSync(path.join(root, name, 'config.json')))
    } catch {
      try {
        config = (
          await import(
            new URL(
              path.join('.', 'fixtures', name, 'config.js'),
              import.meta.url
            )
          )
        ).default
      } catch {}
    }

    try {
      output = String(fs.readFileSync(path.join(root, name, 'output.md')))
    } catch {
      output = ''
    }

    try {
      const file = await remark()
        .use(license, config)
        .process({
          value: fs.readFileSync(path.join(root, name, 'readme.md')),
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
