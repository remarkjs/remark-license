# remark-license [![Build Status][build-badge]][build-status] [![Coverage Status][coverage-badge]][coverage-status] [![Chat][chat-badge]][chat]

Add a [license][sec] section to a README with [**remark**][remark].

## Installation

[npm][]:

```bash
npm install remark-license
```

## Usage

```javascript
var remark = require('remark');
var license = require('remark-license');

var file = remark().use(license).processSync([
  '## License',
  '',
  'Something nondescript.',
  ''
].join('\n'));

console.log(String(file));
```

Yields:

```md
## License

[MIT](LICENSE) © [Titus Wormer](http://wooorm.com)
```

## API

### `remark.use(license[, options])`

Add a license section to heading containing `/^licen[cs]e$/i`.
Replaces the original content of the section.
Does nothing when no heading is found.

###### `options`

*   `name` (`string`, optional)
    — License holder.  [Detected][] from the `package.json` in the
    current working directory, supporting both [`object` and
    `string`][author-format] format of `author`.
    _Throws when neither given nor detected._
*   `license` (`string`, optional)
    — [SPDX][] identifier.  [Detected][] from the `license` field in
    the `package.json` in the current working directory.  Deprecated
    license objects are not supported.
    _Throws when neither given nor detected._
*   `file` (`string`, optional)
    — File-name of license file.  [Detected][] from the files in the current
    working directory, in which case the first file matching
    `/^licen[cs]e(?=$|\.)/i` is used.
*   `url` (`string`, optional)
    — URL to license holder.  [Detected][] from the `package.json` in the
    current working directory, supporting both [`object` and
    `string`][author-format] format of `author`.
    `http://` is prepended if `url` starts without HTTP or HTTPS protocol.

## Detection

Detection of `package.json` and files in the current working directory is
based on the current working directory as set on the given [`vfile`][vfile].

If you want to set the cwd yourself (the default is `process.cwd()`), you can
pass in a `vfile` or [`vfile` options][vfile-options] to `.process` like so:

```js
var remark = require('remark');
var license = require('remark-license');
var vfile = require('vfile');

var file = vfile({
  cwd: './some/path/to/a/directory',
  contents: [
    '## License',
    '',
    'Something nondescript.',
    ''
  ].join('\n')
});

remark().use(license).processSync(file);

console.log(String(file));
```

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[build-badge]: https://img.shields.io/travis/wooorm/remark-license.svg

[build-status]: https://travis-ci.org/wooorm/remark-license

[coverage-badge]: https://img.shields.io/codecov/c/github/wooorm/remark-license.svg

[coverage-status]: https://codecov.io/github/wooorm/remark-license

[chat-badge]: https://img.shields.io/gitter/room/wooorm/remark.svg

[chat]: https://gitter.im/wooorm/remark

[license]: LICENSE

[author]: http://wooorm.com

[npm]: https://docs.npmjs.com/cli/install

[remark]: https://github.com/wooorm/remark

[author-format]: https://docs.npmjs.com/files/package.json#people-fields-author-contributors

[spdx]: https://spdx.org/licenses/

[vfile]: https://github.com/vfile/vfile

[vfile-options]: https://github.com/vfile/vfile#vfileoptions

[sec]: #license

[detected]: #detection
