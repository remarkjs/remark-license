/**
 * @typedef {import('../index.js').Options} Options
 */

import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import process from 'node:process'
import test from 'node:test'
import {fileURLToPath} from 'node:url'
import {remark} from 'remark'
import semver from 'semver'
import license from '../index.js'

test('fixtures', async function (t) {
  // Prepapre.
  const root = new URL('fixtures/', import.meta.url)
  const packageUrl = new URL('../package.json', import.meta.url)
  const packageBackUrl = new URL('../package.json.bak', import.meta.url)
  const brokenPackageUrl = new URL(
    'fail-unexpected-end-of-json/package.json',
    root
  )

  await fs.writeFile(brokenPackageUrl, '{\n')
  await fs.rename(packageUrl, packageBackUrl)

  // Test.
  const fixtures = await fs.readdir(root)
  let index = -1

  while (++index < fixtures.length) {
    const folder = fixtures[index]

    if (folder.startsWith('.')) continue

    await t.test(folder, async function () {
      const folderUrl = new URL(folder + '/', root)
      const inputUrl = new URL('readme.md', folderUrl)
      const outputUrl = new URL('output.md', folderUrl)
      const configUrl = new URL('config.json', folderUrl)
      const configJsUrl = new URL('config.js', folderUrl)

      /** @type {Options | undefined} */
      let config
      /** @type {string} */
      let output

      try {
        config = JSON.parse(String(await fs.readFile(configUrl)))
      } catch {
        try {
          const configMod = await import(String(configJsUrl))
          config = configMod.default
        } catch {}
      }

      try {
        output = String(await fs.readFile(outputUrl))
      } catch {
        output = ''
      }

      try {
        const file = await remark()
          // @ts-expect-error: to do: remove after update.
          .use(license, config)
          .process({
            value: await fs.readFile(inputUrl),
            cwd: fileURLToPath(folderUrl),
            path: 'readme.md'
          })

        assert.equal(String(file), output)
      } catch (error) {
        if (folder.indexOf('fail-') !== 0) {
          throw error
        }

        let message = folder.slice(5).replace(/-/g, ' ')

        // Node 20 has a different error message.
        if (
          message === 'unexpected end of json' &&
          semver.satisfies(process.version, '>=20')
        ) {
          message = 'expected property name or'
        }

        assert.match(String(error).replace(/`/g, ''), new RegExp(message, 'i'))
      }
    })
  }

  // Clean.
  await fs.unlink(brokenPackageUrl)
  await fs.rename(packageBackUrl, packageUrl)
})
