# remark-license

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Chat][chat-badge]][chat]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]

Add a [license][section] section to a README with [**remark**][remark].

## Installation

[npm][]:

```bash
npm install remark-license
```

## Usage

Say we have the following file, `example.md`:

```markdown
## License

Something nondescript.
```

And our script, `example.js`, looks as follows:

```javascript
var fs = require('fs')
var remark = require('remark')
var license = require('remark-license')

remark()
  .use(license)
  .process(fs.readFileSync('example.md'), function(err, file) {
    if (err) throw err
    console.log(String(file))
  })
```

Now, running `node example` yields:

```markdown
## License

[MIT](LICENSE) © [Titus Wormer](https://wooorm.com)
```

## API

### `remark.use(license[, options])`

Add a license section to heading containing `/^licen[cs]e$/i`.
Replaces the original content of the section.
Does nothing when no heading is found.
Does nothing when the processed file is the license file (such for a license
heading in `license.md`).

##### `options`

###### `options.name`

`string`, optional — License holder.  [Detected][] from the `package.json` in
the current working directory, supporting both [`object` and
`string`][author-format] format of `author`.  _Throws when neither given nor
detected._

###### `options.license`

`string`, optional — [SPDX][] identifier.  [Detected][] from the `license`
field in the `package.json` in the current working directory.  Deprecated
license objects are not supported.  _Throws when neither given nor detected._

###### `options.file`

`string`, optional — File-name of license file.  [Detected][] from the files
in the current working directory, in which case the first file matching
`/^licen[cs]e(?=$|\.)/i` is used.
If there is no given or found license file, but `options.license` is a known
[SPDX identifier][spdx], the URL to the license on `spdx.org` is used.

###### `options.url`

`string`, optional — URL to license holder.  [Detected][] from the
`package.json` in the current working directory, supporting both [`object`
and `string`][author-format] format of `author`.  `http://` is prepended if
`url` starts without HTTP or HTTPS protocol.

###### `options.ignoreFinalDefinitions`

Ignore final definitions otherwise in the section (`boolean`, default: true).

## Detection

Detection of `package.json` and files in the current working directory is
based on the current working directory as set on the given [`vfile`][vfile].

If you want to set the cwd yourself (the default is `process.cwd()`), you can
pass in a `vfile` or [`vfile` options][vfile-options] to `.process` like so:

```js
var fs = require('fs')
var path = require('path')
var remark = require('remark')
var license = require('remark-license')

remark()
  .use(license)
  .process(
    {
      cwd: path.join('.', 'some', 'path', 'to', 'a', 'directory'),
      contents: fs.readFileSync('example.md')
    },
    function(err, file) {
      if (err) throw err
      console.log(String(file))
    }
  )
```

## Related

*   [`remark-collapse`](https://github.com/Rokt33r/remark-collapse)
    — Make a section collapsible
*   [`remark-contributors`](https://github.com/hughsk/remark-contributors)
    — Add a list of contributors
*   [`remark-toc`](https://github.com/remarkjs/remark-toc)
    — Add a table of contents
*   [`remark-usage`](https://github.com/remarkjs/remark-usage)
    — Add a usage example

## Contribute

See [`contributing.md` in `remarkjs/remark`][contributing] for ways to get
started.

This organisation has a [Code of Conduct][coc].  By interacting with this
repository, organisation, or community you agree to abide by its terms.

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[build-badge]: https://img.shields.io/travis/remarkjs/remark-license.svg

[build]: https://travis-ci.org/remarkjs/remark-license

[coverage-badge]: https://img.shields.io/codecov/c/github/remarkjs/remark-license.svg

[coverage]: https://codecov.io/github/remarkjs/remark-license

[downloads-badge]: https://img.shields.io/npm/dm/remark-license.svg

[downloads]: https://www.npmjs.com/package/remark-license

[chat-badge]: https://img.shields.io/badge/join%20the%20community-on%20spectrum-7b16ff.svg

[chat]: https://spectrum.chat/unified/remark

[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg

[backers-badge]: https://opencollective.com/unified/backers/badge.svg

[collective]: https://opencollective.com/unified

[license]: license

[author]: https://wooorm.com

[npm]: https://docs.npmjs.com/cli/install

[remark]: https://github.com/remarkjs/remark

[author-format]: https://docs.npmjs.com/files/package.json#people-fields-author-contributors

[spdx]: https://spdx.org/licenses/

[vfile]: https://github.com/vfile/vfile

[vfile-options]: https://github.com/vfile/vfile#vfileoptions

[section]: #license

[detected]: #detection

[contributing]: https://github.com/remarkjs/remark/blob/master/contributing.md

[coc]: https://github.com/remarkjs/remark/blob/master/code-of-conduct.md
