/**
 * @typedef {import('../index.js').Options} Options
 */

import fs from 'node:fs'
import path from 'node:path'
import {URL} from 'node:url'
import process from 'node:process'
import test from 'tape'
import {remark} from 'remark'
import semver from 'semver'
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
    /** @type {Options|undefined} */
    let config
    /** @type {string} */
    let output

    if (isHidden(name)) continue

    try {
      config = JSON.parse(
        String(fs.readFileSync(path.join(root, name, 'config.json')))
      )
    } catch {
      try {
        const configMod = await import(
          String(
            new URL(
              path.join('.', 'fixtures', name, 'config.js'),
              import.meta.url
            )
          )
        )
        config = configMod.default
      } catch {}
    }

    try {
      output = String(fs.readFileSync(path.join(root, name, 'output.md')))
    } catch {
      output = ''
    }

    try {
      const file = await remark()
        // @ts-expect-error: to do: remove after update.
        .use(license, config)
        .process({
          value: fs.readFileSync(path.join(root, name, 'readme.md')),
          cwd: path.join(root, name),
          path: 'readme.md'
        })

      t.equal(String(file), output, 'should work on `' + name + '`')
    } catch (error) {
      if (name.indexOf('fail-') === 0) {
        let message = name.slice(5).replace(/-/g, ' ')

        // Node 20 has a different error message.
        if (
          message === 'unexpected end of json' &&
          semver.satisfies(process.version, '>=20')
        ) {
          message = 'expected property name or'
        }

        const expression = new RegExp(message, 'i')

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
