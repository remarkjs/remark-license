import parse from 'parse-author'
import {read} from 'to-vfile'
import {findUpOne} from 'vfile-find-up'

/**
 * @param {string} base
 * @returns {Promise<{license: string|undefined, name: string|undefined, url: string|undefined}>}
 */
export async function findNearestPackage(base) {
  const file = await findUpOne('package.json', base)

  if (file) {
    await read(file)
    /** @type {import('type-fest').PackageJson} */
    const json = JSON.parse(String(file))
    const author =
      typeof json.author === 'string' ? parse(json.author) : json.author || {}

    return {license: json.license, name: author.name, url: author.url}
  }

  return {license: undefined, name: undefined, url: undefined}
}
