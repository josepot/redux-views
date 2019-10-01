const tests = [
  'standard-create-selector',
  'dependencies-in-variable',
  'spread-dependencies',
  'namespace-import',
  'require-import',
  'require-import-namespace'
]

const defineTest = require('jscodeshift/dist/testUtils').defineTest
describe('ensure-array-dependencies', () => {
  tests.forEach(test =>
    defineTest(__dirname, 'ensure-array-dependencies', null, test)
  )
})
