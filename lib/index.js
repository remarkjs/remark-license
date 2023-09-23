/**
 * @typedef {import('mdast').Link} Link
 * @typedef {import('mdast').Paragraph} Paragraph
 * @typedef {import('mdast').PhrasingContent} PhrasingContent
 * @typedef {import('mdast').Root} Root
 *
 * @typedef {import('vfile').VFile} VFile
 */

/**
 * @typedef Options
 *   Configuration (optional).
 * @property {boolean | null | undefined} [ignoreFinalDefinitions=true]
 *   Ignore definitions at the end of the license section (default: `true`).
 * @property {string | null | undefined} [file]
 *   Path to license file (optional);
 *   detected from the files in the directory of the `package.json` if there is
 *   one, or the current working directory, in which case the first file
 *   matching `/^licen[cs]e(?=$|\.)/i` is used;
 *   if there is no given or found license file, but `options.license` is a
 *   known SPDX identifier, the URL to the license on `spdx.org` is used.
 * @property {RegExp | string | null | undefined} [heading]
 *   Heading to look for (default: `/^licen[cs]e$/i`).
 * @property {string | null | undefined} [license]
 *   SPDX identifier (optional, example: `'mit'`);
 *   detected from the `license` field in the `package.json` in the current
 *   working directory;
 *   throws when neither given nor detected.
 * @property {string | null | undefined} [name]
 *   License holder (optional);
 *   detected from the `package.json` closest to the file supporting both
 *   `object` and `string` format of `author`;
 *   throws when neither given nor detected.
 * @property {string | null | undefined} [url]
 *   URL to license holder (optional);
 *   detected from the `package.json` in the current working directory.
 */

import {headingRange} from 'mdast-util-heading-range'
import spdx from 'spdx-license-list'
import {findNearestPackage} from './find-nearest-package.js'
import {findLicense} from './find-license.js'

const http = 'http://'
const https = 'https://'
const licenseHeadingRegexp = /^licen[cs]e$/i

/** @type {Readonly<Options>} */
const emptyOptions = {}

/**
 * Generate a license section.
 *
 * @param {Readonly<Options> | null | undefined} [options]
 *   Configuration (optional).
 * @returns
 *   Transform.
 */
export default function remarkLicense(options) {
  const settings = options || emptyOptions
  const ignoreFinalDefinitions = settings.ignoreFinalDefinitions !== false
  const test = settings.heading || licenseHeadingRegexp

  /**
   * Transform.
   *
   * @param {Root} tree
   *   Tree.
   * @param {VFile} file
   *   File.
   * @returns {Promise<undefined>}
   *   Nothing.
   */
  return async function (tree, file) {
    const info =
      !settings.url || !settings.name || !settings.license || !settings.file
        ? await findNearestPackage(file)
        : undefined
    const url = settings.url || (info ? info.url : undefined)
    const name = settings.name || (info ? info.name : undefined)
    const license = settings.license || (info ? info.license : undefined)
    let licenseFile =
      settings.file ||
      (await findLicense((info ? info.folder : undefined) || file.cwd))

    // Ignore the license file itself.
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

    headingRange(
      tree,
      {ignoreFinalDefinitions, test},
      function (start, _, end) {
        /** @type {Array<PhrasingContent>} */
        const children = []
        /** @type {Paragraph} */
        const node = {type: 'paragraph', children}
        /** @type {Link | Paragraph} */
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
      }
    )
  }
}
