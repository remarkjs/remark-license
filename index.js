/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module remark:license
 * @fileoverview Add a license section to your README.
 */

'use strict';

/* eslint-env commonjs */

/* global global */

/*
 * Dependencies.
 */

var heading = require('mdast-util-heading-range');

var fs;
var path;

try { fs = require('fs'); } catch (e) { /* Empty */ }
try { path = require('path'); } catch (e) { /* Empty */ }

/*
 * Expressions.
 */

var EXPRESSION = /^([^<(]+?)?[ \t]*(?:<([^>(]+?)>)?[ \t]*(?:\(([^)]+?)\)|$)/;
var LICENSE = /^licen[cs]e(?=$|\.)/i;

/*
 * Constants.
 */

var HTTP_PROTOCOL = 'http://';
var HTTPS_PROTOCOL = 'https://';

/**
 * Adds an license section.
 *
 * @param {Remark} remark - Instance
 * @param {Object?} options - Configuration.
 */
function attacher(remark, options) {
    var settings = {};
    var pack = {};
    var entries = [];
    var cwd = global.process && global.process.cwd();
    var url;
    var length;
    var index;

    if (options === null || options === undefined) {
        options = {};
    }

    try {
        pack = require(path.resolve(cwd, 'package.json'));
    } catch (exception) { /* Empty */ }

    if (typeof pack.author === 'string') {
        url = EXPRESSION.exec(pack.author);
        settings.name = url[1];
        settings.url = url[3];
    } else if (pack.author && pack.author.name) {
        settings.name = pack.author.name;
        settings.url = pack.author.url;
    }

    if (options.file) {
        settings.file = options.file;
    } else {
        try {
            entries = fs.readdirSync(cwd);
        } catch (exception) { /* Empty */ }

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

    if (!settings.name) {
        throw new Error(
            'Missing required `name` in settings.\n' +
            'Either add an `author` to a `package.json` file\n' +
            'or pass it into `remark-license`'
        );
    }

    return function (tree) {
        heading(tree, /^licen[cs]e$/i, function (start, nodes, end) {
            var children = [];
            var url;
            var node;
            var parent;

            node = {
                'type': 'paragraph',
                'children': children
            };

            if (!settings.file) {
                parent = node;
            } else {
                parent = {
                    'type': 'link',
                    'href': settings.file,
                    'children': []
                };

                children.push(parent);
            }

            parent.children.push({
                'type': 'text',
                'value': settings.license
            });

            children.push({
                'type': 'text',
                'value': ' © '
            });

            if (!settings.url) {
                parent = node;
            } else {
                url = settings.url;

                if (
                    url.slice(0, HTTP_PROTOCOL.length) !== HTTP_PROTOCOL &&
                    url.slice(0, HTTPS_PROTOCOL.length) !== HTTPS_PROTOCOL
                ) {
                    url = HTTP_PROTOCOL + url;
                }

                parent = {
                    'type': 'link',
                    'href': url,
                    'children': []
                };

                children.push(parent);
            }

            parent.children.push({
                'type': 'text',
                'value': settings.name
            });

            return [start, node, end];
        });
    };
}

/*
 * Expose `attacher`.
 */

module.exports = attacher;
