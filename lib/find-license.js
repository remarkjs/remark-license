import {promises as fs} from 'node:fs'

const licenseRegexp = /^licen[cs]e(?=$|\.)/i

/**
 * @param {string} base
 * @returns {Promise<string|undefined>}
 */
export async function findLicense(base) {
  const files = await fs.readdir(base)
  let index = -1

  while (++index < files.length) {
    if (licenseRegexp.test(files[index])) {
      return files[index]
    }
  }
}
