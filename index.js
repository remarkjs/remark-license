/**
 * @typedef {import('mdast').Root} Root
 * @typedef {import('mdast').Paragraph} Paragraph
 * @typedef {import('mdast').Link} Link
 * @typedef {import('mdast').PhrasingContent} PhrasingContent
 * @typedef {import('type-fest').PackageJson} PackageJson
 *
 * @typedef Options
 *   Configuration.
 * @property {string} [name]
 *   License holder.
 *   Detected from the `package.json` closest to the file supporting both
 *   `object` and `string` format of `author`.
 *   *Throws when neither given nor detected.*
 * @property {string} [license]
 *   SPDX identifier
 *   Detected from the `license` field in the `package.json` in the current
 *   working directory.
 *   Deprecated license objects are not supported.
 *   *Throws when neither given nor detected.*
 * @property {string} [file]
 *   File name of license file
 *   Detected from the files in the directory of the `package.json` if there is
 *   one, or the current working directory, in which case the first file
 *   matching `/^licen[cs]e(?=$|\.)/i` is used.
 *   If there is no given or found license file, but `options.license` is a
 *   known SPDX identifier, the URL to the license on `spdx.org` is used.
 * @property {string} [url]
 *   URL to license holder
 *   Detected from the `package.json` in the current working directory,
 *   supporting both `object` and `string` format of `author`.
 *   `http://` is prepended if `url` starts without HTTP or HTTPS protocol.
 * @property {boolean} [ignoreFinalDefinitions=true]
 *   Ignore final definitions otherwise in the section.
 * @property {string|RegExp} [heading]
 *   Heading to look for.
 *   Default: `/^licen[cs]e$/i`.
 */

import {promises as fs} from 'fs'
import path from 'path'
import parse from 'parse-author'
import spdx from 'spdx-license-list'
import {read} from 'to-vfile'
import {findUpOne} from 'vfile-find-up'
import {headingRange} from 'mdast-util-heading-range'

const licenseRegexp = /^licen[cs]e(?=$|\.)/i
const licenseHeadingRegexp = /^licen[cs]e$/i
const http = 'http://'
const https = 'https://'

/**
 * Plugin to add a license section.
 *
 * @type {import('unified').Plugin<[Options], Root>}
 */
export default function remarkLicense(options = {}) {
  const ignoreFinalDefinitions =
    options.ignoreFinalDefinitions === undefined ||
    options.ignoreFinalDefinitions === null
      ? true
      : options.ignoreFinalDefinitions
  const test = options.heading || licenseHeadingRegexp

  // eslint-disable-next-line complexity
  return async (tree, file) => {
    // Else is for stdin, typically not used.
    /* c8 ignore next */
    const base = file.dirname ? path.resolve(file.cwd, file.dirname) : file.cwd
    const packageFile = await findUpOne('package.json', base)
    /** @type {string|undefined} */
    let defaultName
    /** @type {string|undefined} */
    let defaultUrl
    /** @type {string|undefined} */
    let defaultLicense
    /** @type {string|undefined} */
    let defaultLicenseFile

    // Skip package loading if we have all info in `options`.
    if (packageFile && (!options.url || !options.name || !options.license)) {
      await read(packageFile)
      /** @type {PackageJson} */
      const packageJson = JSON.parse(String(packageFile))
      const author =
        typeof packageJson.author === 'string'
          ? parse(packageJson.author)
          : packageJson.author || {}
      defaultLicense = packageJson.license
      defaultName = author.name
      defaultUrl = author.url
    }

    if (!options.file) {
      const files = await fs.readdir(
        (packageFile && path.resolve(packageFile.cwd, packageFile.dirname)) ||
          file.cwd
      )
      let index = -1

      while (++index < files.length) {
        if (licenseRegexp.test(files[index])) {
          defaultLicenseFile = files[index]
          break
        }
      }
    }

    const url = options.url || defaultUrl
    const name = options.name || defaultName
    const license = options.license || defaultLicense
    let licenseFile = options.file || defaultLicenseFile

    /* Ignore the license file itself. */
    if (licenseFile && file.path === licenseFile) {
      return
    }

    if (!license) {
      throw new Error(
        'Missing required `license` in settings.\n' +
          'Either add a `license` to a `package.json` file\n' +
          'or pass it into `remark-license`'
      )
    }

    if (!name) {
      throw new Error(
        'Missing required `name` in settings.\n' +
          'Either add an `author` to a `package.json` file\n' +
          'or pass it into `remark-license`'
      )
    }

    if (!licenseFile && license in spdx) {
      licenseFile = spdx[license].url
    }

    headingRange(tree, {ignoreFinalDefinitions, test}, (start, _, end) => {
      /** @type {PhrasingContent[]} */
      const children = []
      /** @type {Paragraph} */
      const node = {type: 'paragraph', children}
      /** @type {Paragraph|Link} */
      let parent

      if (licenseFile) {
        parent = {type: 'link', title: null, url: licenseFile, children: []}
        children.push(parent)
      } else {
        parent = node
      }

      parent.children.push({type: 'text', value: license})
      children.push({type: 'text', value: ' © '})

      if (url) {
        parent = {
          type: 'link',
          title: null,
          url:
            url.slice(0, http.length) !== http &&
            url.slice(0, https.length) !== https
              ? http + url
              : url,
          children: []
        }
        children.push(parent)
      } else {
        parent = node
      }

      parent.children.push({type: 'text', value: name})

      return [start, node, end]
    })
  }
}
