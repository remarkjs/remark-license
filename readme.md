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
    *   [`Options`](#options)
*   [Types](#types)
*   [Compatibility](#compatibility)
*   [Security](#security)
*   [Related](#related)
*   [Contribute](#contribute)
*   [License](#license)

## What is this?

This package is a [unified][] ([remark][]) plugin to generate a license section
such as [the one at the bottom of this readme][license-section].

## When should I use this?

This project is useful when you’re writing documentation for an open source
project, typically a Node.js package, that has one or more readmes and maybe
some other markdown files as well.
You want to show the author and license associated with the project.
When this plugin is used, authors can add a certain heading (say, `## License`)
to documents and this plugin will populate them.

## Install

This package is [ESM only][esm].
In Node.js (version 16+), install with [npm][]:

```sh
npm install remark-license
```

In Deno with [`esm.sh`][esmsh]:

```js
import remarkLicense from 'https://esm.sh/remark-license@6'
```

In browsers with [`esm.sh`][esmsh]:

```html
<script type="module">
  import remarkLicense from 'https://esm.sh/remark-license@6?bundle'
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

…and a module `example.js`:

```js
import {remark} from 'remark'
import remarkLicense from 'remark-license'
import {read} from 'to-vfile'

const file = await remark()
  .use(remarkLicense)
  .process(await read('example.md'))

console.log(String(file))
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
> [`package.json`][file-package-json] and [`license`][file-license] file.
> Running this example in a different package will yield different results.

## API

This package exports no identifiers.
The default export is [`remarkLicense`][api-remark-license].

### `unified().use(remarkLicense[, options])`

Generate a license section.

###### Parameters

*   `options` ([`Options`][api-options], optional)
    — configuration

###### Returns

Transform ([`Transformer`][unified-transformer]).

### `Options`

Configuration (TypeScript type).

###### Fields

*   `ignoreFinalDefinitions` (`boolean`, default: `true`)
    — ignore definitions at the end of the license section
*   `file` (`string`, optional)
    — path to license file;
    detected from the files in the directory of the `package.json` if there is
    one, or the current working directory, in which case the first file
    matching `/^licen[cs]e(?=$|\.)/i` is used;
    if there is no given or found license file, but `options.license` is a
    known [SPDX][] identifier, the URL to the license on `spdx.org` is used
*   `heading` (`RegExp | string`, default: `/^licen[cs]e$/i`)
    — heading to look for
*   `license` (`string`, optional, example: `'mit'`)
    — [SPDX][] identifier;
    detected from the `license` field in the `package.json` in the current
    working directory;
    throws when neither given nor detected
*   `name` (`string`, optional)
    — license holder;
    detected from the `package.json` closest to the file supporting both
    `object` and `string` format of `author`;
    throws when neither given nor detected
*   `url` (`string`, optional)
    — URL to license holder;
    detected from the `package.json` in the current working directory

## Types

This package is fully typed with [TypeScript][].
It exports the additional type [`Options`][api-options].

## Compatibility

Projects maintained by the unified collective are compatible with maintained
versions of Node.js.

When we cut a new major release, we drop support for unmaintained versions of
Node.
This means we try to keep the current release line, `remark-license@^6`,
compatible with Node.js 12.

This plugin works with `unified` version 6+ and `remark` version 7+.

## Security

`options.url` (or `author.url` in `package.json`) is used and injected into the
tree when it’s given or found.
This could open you up to a [cross-site scripting (XSS)][wiki-xss] attack if
you pass user provided content in or store user provided content in
`package.json`.

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

[MIT](license) © [Titus Wormer](https://wooorm.com)

[build-badge]: https://github.com/remarkjs/remark-license/workflows/main/badge.svg

[build]: https://github.com/remarkjs/remark-license/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/remarkjs/remark-license.svg

[coverage]: https://codecov.io/github/remarkjs/remark-license

[downloads-badge]: https://img.shields.io/npm/dm/remark-license.svg

[downloads]: https://www.npmjs.com/package/remark-license

[size-badge]: https://img.shields.io/bundlejs/size/remark-license

[size]: https://bundlejs.com/?q=remark-license

[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg

[backers-badge]: https://opencollective.com/unified/backers/badge.svg

[collective]: https://opencollective.com/unified

[chat-badge]: https://img.shields.io/badge/chat-discussions-success.svg

[chat]: https://github.com/remarkjs/remark/discussions

[npm]: https://docs.npmjs.com/cli/install

[esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c

[esmsh]: https://esm.sh

[health]: https://github.com/remarkjs/.github

[contributing]: https://github.com/remarkjs/.github/blob/main/contributing.md

[support]: https://github.com/remarkjs/.github/blob/main/support.md

[coc]: https://github.com/remarkjs/.github/blob/main/code-of-conduct.md

[hast]: https://github.com/syntax-tree/hast

[rehype]: https://github.com/rehypejs/rehype

[remark]: https://github.com/remarkjs/remark

[spdx]: https://spdx.org/licenses/

[typescript]: https://www.typescriptlang.org

[unified]: https://github.com/unifiedjs/unified

[unified-transformer]: https://github.com/unifiedjs/unified#transformer

[wiki-xss]: https://en.wikipedia.org/wiki/Cross-site_scripting

[file-package-json]: package.json

[file-license]: license

[license-section]: #license

[api-options]: #options

[api-remark-license]: #unifieduseremarklicense-options
