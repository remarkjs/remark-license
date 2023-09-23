import fs from 'node:fs/promises'

const licenseRegexp = /^licen[cs]e(?=$|\.)/i

/**
 * @param {string} base
 *   Folder.
 * @returns {Promise<string | undefined>}
 *   Basename of license file.
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
