# remark-license

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

[**remark**][remark] plugin to add a [license][section] section to your readme.

## Note!

This plugin is ready for the new parser in remark
([`remarkjs/remark#536`](https://github.com/remarkjs/remark/pull/536)).
No change is needed: it works exactly the same now as it did before!

## Install

[npm][]:

```sh
npm install remark-license
```

## Use

Say we have the following file, `example.md`:

```markdown
## License

Something nondescript.
```

And our script, `example.js`, looks as follows:

```js
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

### `remark().use(license[, options])`

Plugin to add a license section to your readme.
Adds content to the heading matching `/^licen[cs]e$/i` or `options.heading`.
Replaces the original content of that section.
Does nothing when no heading is found.
Does nothing when the processed file is the license file (such for a license
heading in `license.md`).

##### `options`

###### `options.name`

License holder (`string`, optional).
[Detected][] from the `package.json` in the current working directory,
supporting both [`object` and `string`][author-format] format of `author`.
*Throws when neither given nor detected.*

###### `options.license`

[SPDX][] identifier (`string`, optional).
[Detected][] from the `license` field in the `package.json` in the current
working directory.
Deprecated license objects are not supported.
*Throws when neither given nor detected.*

###### `options.file`

File name of license file (`string`, optional).
[Detected][] from the files in the current working directory, in which case the
first file matching `/^licen[cs]e(?=$|\.)/i` is used.
If there is no given or found license file, but `options.license` is a known
[SPDX identifier][spdx], the URL to the license on `spdx.org` is used.

###### `options.url`

URL to license holder (`string`, optional).
[Detected][] from the `package.json` in the current working directory,
supporting both [`object` and `string`][author-format] format of `author`.
`http://` is prepended if `url` starts without HTTP or HTTPS protocol.

###### `options.ignoreFinalDefinitions`

Ignore final definitions otherwise in the section (`boolean`, default: true).

###### `options.heading`

Heading to look for
(`string` (case-insensitive) or `RegExp`, default: `/^licen[cs]e$/i`).

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

## Security

`options.url` (or `author.url` in `package.json`) is used and injected into the
tree when it’s given or found.
This could open you up to a [cross-site scripting (XSS)][xss] attack if you pass
user provided content in or store user provided content in `package.json`.

This may become a problem if the Markdown later transformed to
[**rehype**][rehype] ([**hast**][hast]) or opened in an unsafe Markdown viewer.

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

See [`contributing.md`][contributing] in [`remarkjs/.github`][health] for ways
to get started.
See [`support.md`][support] for ways to get help.

This project has a [code of conduct][coc].
By interacting with this repository, organization, or community you agree to
abide by its terms.

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[build-badge]: https://github.com/remarkjs/remark-license/workflows/main/badge.svg

[build]: https://github.com/remarkjs/remark-license/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/remarkjs/remark-license.svg

[coverage]: https://codecov.io/github/remarkjs/remark-license

[downloads-badge]: https://img.shields.io/npm/dm/remark-license.svg

[downloads]: https://www.npmjs.com/package/remark-license

[size-badge]: https://img.shields.io/bundlephobia/minzip/remark-license.svg

[size]: https://bundlephobia.com/result?p=remark-license

[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg

[backers-badge]: https://opencollective.com/unified/backers/badge.svg

[collective]: https://opencollective.com/unified

[chat-badge]: https://img.shields.io/badge/chat-discussions-success.svg

[chat]: https://github.com/remarkjs/remark/discussions

[npm]: https://docs.npmjs.com/cli/install

[health]: https://github.com/remarkjs/.github

[contributing]: https://github.com/remarkjs/.github/blob/HEAD/contributing.md

[support]: https://github.com/remarkjs/.github/blob/HEAD/support.md

[coc]: https://github.com/remarkjs/.github/blob/HEAD/code-of-conduct.md

[license]: license

[author]: https://wooorm.com

[remark]: https://github.com/remarkjs/remark

[author-format]: https://docs.npmjs.com/files/package.json#people-fields-author-contributors

[spdx]: https://spdx.org/licenses/

[vfile]: https://github.com/vfile/vfile

[vfile-options]: https://github.com/vfile/vfile#vfileoptions

[section]: #license

[detected]: #detection

[xss]: https://en.wikipedia.org/wiki/Cross-site_scripting

[rehype]: https://github.com/rehypejs/rehype

[hast]: https://github.com/syntax-tree/hast
