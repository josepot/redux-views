import createSelector from './createSelector'

export default selectors => {
  if (process.env.NODE_ENV !== 'production' && typeof selectors !== 'object') {
    throw new Error(
      'createStructuredSelector expects first argument to be an object ' +
        `where each property is a selector, instead received a ${typeof selectors}`
    )
  }
  const ids = Object.keys(selectors)
  const compute = (...vals) => {
    const res = {}
    vals.forEach((val, idx) => (res[ids[idx]] = val))
    return res
  }
  return createSelector(
    Object.values(selectors),
    compute
  )
}
