'use strict';

var parse = require('parse-author');
var spdxLicenseList = require('spdx-license-list');
var heading = require('mdast-util-heading-range');

module.exports = license;

var fs;
var path;

try {
  fs = require('fs');
  path = require('path');
} catch (err) {}

var LICENSE = /^licen[cs]e(?=$|\.)/i;

var http = 'http://';
var https = 'https://';

/* Add a license section. */
function license(options) {
  return transformer;

  function transformer(tree, file) {
    var settings = {};
    var pack = {};
    var entries = [];
    var cwd = file.cwd;
    var length;
    var index;

    if (!options) {
      options = {};
    }

    // Don't add to license files themselves, that'd be redundant
    if (file.stem && LICENSE.test(file.stem)) {
      return;
    }

    try {
      pack = require(path.resolve(cwd, 'package.json'));
    } catch (err) {}

    if (typeof pack.author === 'string') {
      pack.author = parse(pack.author);
    }

    if (pack.author && pack.author.name) {
      settings.name = pack.author.name;
      settings.url = pack.author.url;
    }

    if (options.file) {
      settings.file = options.file;
    } else {
      try {
        entries = fs.readdirSync(cwd);
      } catch (err) {
        /* Empty */
      }

      length = entries.length;
      index = -1;

      while (++index < length) {
        if (LICENSE.test(entries[index])) {
          settings.file = entries[index];
          break;
        }
      }
    }

    if (options.url) {
      settings.url = options.url;
    }

    if (options.name) {
      settings.name = options.name;
    }

    settings.license = options.license || pack.license;

    if (!settings.license) {
      throw new Error(
        'Missing required `license` in settings.\n' +
          'Either add a `license` to a `package.json` file\n' +
          'or pass it into `remark-license`'
      );
    }

    // If license was still not found then try to find its url
    if (!settings.file && spdxLicenseList[settings.license]) {
      settings.file = spdxLicenseList[settings.license].url;
    }

    if (!settings.name) {
      throw new Error(
        'Missing required `name` in settings.\n' +
          'Either add an `author` to a `package.json` file\n' +
          'or pass it into `remark-license`'
      );
    }

    heading(tree, /^licen[cs]e$/i, function (start, nodes, end) {
      var children = [];
      var node = {type: 'paragraph', children: children};
      var url;
      var parent;

      if (settings.file) {
        parent = {
          type: 'link',
          url: settings.file,
          children: []
        };

        children.push(parent);
      } else {
        parent = node;
      }

      parent.children.push({type: 'text', value: settings.license});

      children.push({type: 'text', value: ' © '});

      if (settings.url) {
        url = settings.url;

        if (
          url.slice(0, http.length) !== http &&
          url.slice(0, https.length) !== https
        ) {
          url = http + url;
        }

        parent = {
          type: 'link',
          url: url,
          children: []
        };

        children.push(parent);
      } else {
        parent = node;
      }

      parent.children.push({type: 'text', value: settings.name});

      return [start, node, end];
    });
  }
}
