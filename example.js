// Require dependencies:
var remark = require('remark');
var license = require('./index.js');

// Process a document:
var doc = remark.use(license).process([
    '## License',
    '',
    'Something nondescript.',
    ''
].join('\n'));

// Yields:
console.log('md', doc);
