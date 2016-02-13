# remark-license [![Build Status](https://img.shields.io/travis/wooorm/remark-license.svg)](https://travis-ci.org/wooorm/remark-license) [![Coverage Status](https://img.shields.io/codecov/c/github/wooorm/remark-license.svg)](https://codecov.io/github/wooorm/remark-license)

Add a [license](#license) section to a README.

## Installation

[npm](https://docs.npmjs.com/cli/install):

```bash
npm install remark-license
```

**remark-license** is also available as an AMD, CommonJS, and globals
module, [uncompressed and compressed](https://github.com/wooorm/remark-license/releases).

## Usage

Require dependencies:

```javascript
var remark = require('remark');
var license = require('remark-license');
```

Process a document:

```javascript
var doc = remark.use(license).process([
    '## License',
    '',
    'Something nondescript.',
    ''
].join('\n'));
```

Yields:

```md
## License

[MIT](LICENSE) © [Titus Wormer](http://wooorm.com)
```

## API

### [remark](https://github.com/wooorm/remark#api).[use](https://github.com/wooorm/remark#remarkuseplugin-options)(license\[, options])

Add a license section to heading containing `/^licen[cs]e$/i`.
Replaces the original content of the section.
Does nothing when no heading is found.

**Parameters**:

*   `license` — This plug-in;

*   `options` (`Object`, optional):

    *   `name` (`string`, optional)
        — License holder.  Detected from the `package.json` in the
        current working directory, supporting both [`object` and
        `string`](https://docs.npmjs.com/files/package.json#people-fields-author-contributors)
        format of `author`.
        _Throws when neither given nor detected._

    *   `license` (`string`, optional)
        — [SPDX](https://spdx.org/licenses/) identifier.
        Detected from the `package.json`’s `license` field in the current
        working directory.  Deprecated license objects are not supported.
        _Throws when neither given nor detected._

    *   `file` (`string`, optional)
        — File-name of license file.  Detected from the files in the current
        working directory, in which case the first file matching
        `/^licen[cs]e(?=$|\.)/i` is used.

    *   `url` (`string`, optional)
        — URL to license holder.  Detected from the `package.json` in the
        current working directory, supporting both [`object` and
        `string`](https://docs.npmjs.com/files/package.json#people-fields-author-contributors)
        format of `author`.
        `http://` is prepended if `url` starts without HTTP or HTTPS protocol.

## License

[MIT](LICENSE) © [Titus Wormer](http://wooorm.com)
