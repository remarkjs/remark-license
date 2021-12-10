# remark-license

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

**[remark][]** plugin to generate a license section.

## Contents

*   [What is this?](#what-is-this)
*   [When should I use this?](#when-should-i-use-this)
*   [Install](#install)
*   [Use](#use)
*   [API](#api)
    *   [`unified().use(remarkLicense[, options])`](#unifieduseremarklicense-options)
*   [Types](#types)
*   [Compatibility](#compatibility)
*   [Security](#security)
*   [Related](#related)
*   [Contribute](#contribute)
*   [License](#license)

## What is this?

This package is a [unified][] ([remark][]) plugin to fill in a license section
such as [the one](#license) at the end of this README.
It requires the section heading to be present in the source,
and the `author` and `license` fields to either be set in a `package.json` file,
or be passed as parameters.

**unified** is a project that transforms content with abstract syntax trees
(ASTs).
**remark** adds support for markdown to unified.
**mdast** is the markdown AST that remark uses.
This is a remark plugin that transforms mdast.

## When should I use this?

This project is useful when you’re writing documentation for an open source
project, typically a Node.js package, that has one or more readmes and maybe
some other markdown files as well.
You want to show the author and license associated with the project.
When this plugin is used, authors can add a certain heading (say, `## License`)
to documents and this plugin will populate them.

## Install

This package is [ESM only](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c).
In Node.js (version 12.20+, 14.14+, or 16.0+), install with [npm][]:

```sh
npm install remark-license
```

In Deno with [Skypack][]:

```js
import remarkLicense from 'https://cdn.skypack.dev/remark-license@6?dts'
```

In browsers with [Skypack][]:

```html
<script type="module">
  import remarkLicense from 'https://cdn.skypack.dev/remark-license@6?min'
</script>
```

## Use

Say we have the following file `example.md` in this project:

```markdown
# Example

Some text.

## Use

## API

## License
```

And our module `example.js` looks as follows:

```js
import {read} from 'to-vfile'
import {remark} from 'remark'
import remarkLicense from 'remark-license'

main()

async function main() {
  const file = await remark()
    .use(remarkLicense)
    .process(await read('example.md'))

  console.log(String(file))
}
```

Now running `node example.js` yields:

```markdown
# Example

Some text.

## Use

## API

## License

[MIT](license) © [Titus Wormer](https://wooorm.com)
```

> 👉 **Note**: This info is inferred from this project’s
> [`package.json`][package-json] and [`license`][license] file.
> Running this example in a different package will yield different results.

## API

This package exports no identifiers.
The default export is `remarkLicense`.

### `unified().use(remarkLicense[, options])`

Generate a license section.
In short, this plugin:

*   looks for the heading matching `/^licen[cs]e$/i` or `options.heading`.
*   if there is a heading, replaces it with a new section

##### `options`

Configuration (optional in Node.js, required in browsers).

###### `options.name`

License holder (`string`).
In Node.js, defaults to the `author` field in the closest `package.json`.
*Throws when neither given nor detected.*

###### `options.license`

[SPDX][] identifier (`string`).
In Node.js, defaults to the `license` field in the closest `package.json`.
*Throws when neither given nor detected.*

###### `options.file`

File name of license file (`string`, optional).
In Node.js, defaults to a file in the directory of the closest `package.json`
that matches `/^licen[cs]e(?=$|\.)/i`.
If there is no given or found license file, but `options.license` is a known
[SPDX][] identifier, then the URL to the license on `spdx.org` is used.

###### `options.url`

URL to license holder (`string`, optional).
In Node.js, defaults to the `author` field in the closest `package.json`.
`http://` is prepended if `url` does not start with an HTTP or HTTPS protocol.

###### `options.ignoreFinalDefinitions`

Ignore definitions that would otherwise trail in the section (`boolean`,
default: `true`).

###### `options.heading`

Heading to look for (`string` (case insensitive) or `RegExp`, default:
`/^licen[cs]e$/i`).

## Types

This package is fully typed with [TypeScript][].
It exports an `Options` type, which specifies the interface of the accepted
options.

## Compatibility

Projects maintained by the unified collective are compatible with all maintained
versions of Node.js.
As of now, that is Node.js 12.20+, 14.14+, and 16.0+.
Our projects sometimes work with older versions, but this is not guaranteed.

This plugin works with `unified` version 6+ and `remark` version 7+.

## Security

`options.url` (or `author.url` in `package.json`) is used and injected into the
tree when it’s given or found.
This could open you up to a [cross-site scripting (XSS)][xss] attack if you pass
user provided content in or store user provided content in `package.json`.

This may become a problem if the markdown is later transformed to **[rehype][]**
(**[hast][]**) or opened in an unsafe markdown viewer.

## Related

*   [`remark-collapse`](https://github.com/Rokt33r/remark-collapse)
    – make some sections collapsible
*   [`remark-contributors`](https://github.com/hughsk/remark-contributors)
    – generate a contributors section
*   [`remark-toc`](https://github.com/remarkjs/remark-toc)
    — generate a table of contents
*   [`remark-usage`](https://github.com/remarkjs/remark-usage)
    — generate a usage example

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

[skypack]: https://www.skypack.dev

[health]: https://github.com/remarkjs/.github

[contributing]: https://github.com/remarkjs/.github/blob/HEAD/contributing.md

[support]: https://github.com/remarkjs/.github/blob/HEAD/support.md

[coc]: https://github.com/remarkjs/.github/blob/HEAD/code-of-conduct.md

[license]: license

[author]: https://wooorm.com

[remark]: https://github.com/remarkjs/remark

[unified]: https://github.com/unifiedjs/unified

[spdx]: https://spdx.org/licenses/

[xss]: https://en.wikipedia.org/wiki/Cross-site_scripting

[typescript]: https://www.typescriptlang.org

[rehype]: https://github.com/rehypejs/rehype

[hast]: https://github.com/syntax-tree/hast

[package-json]: package.json
