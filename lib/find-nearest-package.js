/**
 * @typedef {import('vfile').VFile} VFile
 */

/**
 * @typedef Info
 *   Info.
 * @property {string} folder
 *   Path to folder with `package.json`.
 * @property {string | undefined} license
 *   SPDX identifier.
 * @property {string | undefined} name
 *   Name of author.
 * @property {string | undefined} url
 *   URL for author.
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import parse from 'parse-author'
import {findUp} from 'vfile-find-up'

/**
 * @param {VFile} from
 *   File to resolve from.
 * @returns {Promise<Info | undefined>}
 *   Info.
 */
export async function findNearestPackage(from) {
  /* c8 ignore next -- else is for stdin, typically not used. */
  const base = from.dirname ? path.resolve(from.cwd, from.dirname) : from.cwd
  const file = await findUp('package.json', base)

  if (file) {
    file.value = await fs.readFile(file.path)
    /** @type {import('type-fest').PackageJson} */
    const json = JSON.parse(String(file))
    const author =
      typeof json.author === 'string' ? parse(json.author) : json.author || {}

    return {
      /* c8 ignore next -- always defined. */
      folder: file.dirname ? path.resolve(file.cwd, file.dirname) : file.cwd,
      license: json.license,
      name: author.name,
      url: author.url
    }
  }
}
