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

/* Add a license section. */
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
    let defaultName
    let defaultUrl
    let defaultLicense
    let defaultLicenseFile

    // Skip package loading if we have all info in `options`.
    if (packageFile && (!options.url || !options.name || !options.license)) {
      await read(packageFile)
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

    headingRange(tree, {ignoreFinalDefinitions, test}, (start, nodes, end) => {
      const children = []
      const node = {type: 'paragraph', children}
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
        let link

        if (
          url.slice(0, http.length) !== http &&
          url.slice(0, https.length) !== https
        ) {
          link = http + url
        } else {
          link = url
        }

        parent = {type: 'link', title: null, url: link, children: []}
        children.push(parent)
      } else {
        parent = node
      }

      parent.children.push({type: 'text', value: name})

      return [start, node, end]
    })
  }
}
