'use strict'

var parse = require('parse-author')
var spdx = require('spdx-license-list')
var heading = require('mdast-util-heading-range')

module.exports = license

var fs
var path

try {
  fs = require('fs')
  path = require('path')
} catch (_) {}

var licenseRegexp = /^licen[cs]e(?=$|\.)/i
var licenseHeadingRegexp = /^licen[cs]e$/i
var http = 'http://'
var https = 'https://'

/* Add a license section. */
function license(options) {
  var settings = options || {}
  var finals = settings.ignoreFinalDefinitions
  var test = settings.heading || licenseHeadingRegexp

  var headingOptions = {
    ignoreFinalDefinitions:
      finals === undefined || finals === null ? true : finals,
    test: test
  }

  return transformer

  function transformer(tree, file, next) {
    var cwd = file.cwd
    var left = 2 // Two async operations.
    var defaultName
    var defaultUrl
    var defaultLicense
    var defaultLicenseFile

    // Skip package loading if we have all info in `options`.
    if (settings.url && settings.name && settings.license) {
      one()
    } else {
      fs.readFile(path.resolve(cwd, 'package.json'), onpackage)
    }

    if (settings.file) {
      one()
    } else {
      fs.readdir(cwd, onfiles)
    }

    function onpackage(error, buf) {
      var pack = {}
      var author

      if (buf) {
        try {
          pack = JSON.parse(buf)
        } catch (error) {
          return one(error)
        }
      }

      /* istanbul ignore if - hard to test. */
      if (error && error.code !== 'ENOENT') {
        one(error)
      } else {
        defaultLicense = pack.license
        author = pack.author || {}
        author = typeof author === 'string' ? parse(author) : author
        defaultName = author.name
        defaultUrl = author.url

        one()
      }
    }

    function onfiles(error, files) {
      var length
      var index

      /* istanbul ignore if - hard to test. */
      if (error) {
        one(error)
      } else {
        length = files.length
        index = -1

        while (++index < length) {
          if (licenseRegexp.test(files[index])) {
            defaultLicenseFile = files[index]
            break
          }
        }

        one()
      }
    }

    function one(error) {
      if (error) {
        next(error)
        left = Infinity
      } else if (--left === 0) {
        done()
      }
    }

    function done() {
      var url = settings.url || defaultUrl
      var name = settings.name || defaultName
      var license = settings.license || defaultLicense
      var licenseFile = settings.file || defaultLicenseFile

      /* Ignore the license file itself. */
      if (licenseFile && file.path === licenseFile) {
        return next()
      }

      if (!license) {
        return next(
          new Error(
            'Missing required `license` in settings.\n' +
              'Either add a `license` to a `package.json` file\n' +
              'or pass it into `remark-license`'
          )
        )
      }

      if (!name) {
        return next(
          new Error(
            'Missing required `name` in settings.\n' +
              'Either add an `author` to a `package.json` file\n' +
              'or pass it into `remark-license`'
          )
        )
      }

      if (!licenseFile && license in spdx) {
        licenseFile = spdx[license].url
      }

      heading(tree, headingOptions, onheading)

      next()

      function onheading(start, nodes, end) {
        var children = []
        var node = {type: 'paragraph', children: children}
        var link
        var parent

        if (licenseFile) {
          parent = {type: 'link', title: null, url: licenseFile, children: []}
          children.push(parent)
        } else {
          parent = node
        }

        parent.children.push({type: 'text', value: license})

        children.push({type: 'text', value: ' © '})

        if (url) {
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
      }
    }
  }
}
