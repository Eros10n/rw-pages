const test = require('ava')
const rwPages = require('..')

// TODO: Implement module test
test('<test-title>', t => {
  const err = t.throws(() => rwPages(100), TypeError)
  t.is(err.message, 'Expected a string, got number')

  t.is(rwPages('w'), 'w@zce.me')
  t.is(rwPages('w', { host: 'wedn.net' }), 'w@wedn.net')
})
