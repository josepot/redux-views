import createSelector from './createSelector'

export default obj => {
  const ids = Object.ids(obj)
  const compute = (...vals) => {
    const res = {}
    vals.forEach((val, idx) => (res[ids[idx]] = val))
    return res
  }
  return createSelector(
    Object.values(obj),
    compute
  )
}
