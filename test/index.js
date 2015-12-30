/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module remark:license:test
 * @fileoverview Test suite for remark-license.
 */

'use strict';

/* eslint-env node */

/*
 * Dependencies.
 */

var fs = require('fs');
var path = require('path');
var test = require('tape');
var remark = require('remark');
var license = require('..');

/*
 * Methods.
 */

var read = fs.readFileSync;
var exists = fs.existsSync;

/*
 * Tests.
 */

test('remark-license()', function (t) {
    t.equal(typeof license, 'function', 'should be a function');

    t.doesNotThrow(function () {
        license(remark);
    }, 'should not throw if not passed options');

    t.end();
});

/*
 * Constants..
 */

var ROOT = path.join(__dirname, 'fixtures');

/*
 * Set-up working-directory changes.
 */

test.onFinish(function () {
    process.chdir(path.join(__dirname, '..'));
});

/*
 * Gather fixtures.
 */

test('Fixtures', function (t) {
    fs.readdirSync(ROOT).filter(function (filepath) {
        return filepath.indexOf('.') !== 0;
    }).forEach(function (fixture) {
        var filepath = path.join(ROOT, fixture);
        var config = path.join(filepath, 'config.json');
        var output = path.join(filepath, 'output.md');
        var input;
        var result;
        var fail;

        process.chdir(filepath);

        config = exists(config) ? require(config) : {};
        output = exists(output) ? read(output, 'utf-8') : '';
        input = read(path.join(filepath, 'readme.md'), 'utf-8');

        fail = fixture.indexOf('fail-') === 0 ? fixture.slice(5) : '';

        try {
            result = remark.use(license, config).process(input);

            t.equal(result, output, 'should work on `' + fixture + '`');
        } catch (exception) {
            if (!fail) {
                throw exception;
            }

            fail = new RegExp(fail.replace(/-/g, ' '), 'i');

            t.equal(
                fail.test(exception.toString().replace(/`/g, '')),
                true,
                'should fail on `' + fixture + '`'
            );
        }
    });

    t.end();
});
