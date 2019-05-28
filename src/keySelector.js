const getNewKeySelector = fns => {
  const res = (...args) =>
    fns.map(fn => encodeURIComponent(fn(...args))).join('/')
  res.fns = fns
  res.keySelector = res
  return res
}

const combinedKeySelectors = {}
const getCombinedKeySelector = keySelectors => {
  const len = keySelectors.length
  if (!combinedKeySelectors[len]) combinedKeySelectors[len] = []

  const entry = combinedKeySelectors[len].find(([candidates]) =>
    candidates.every((fn, idx) => keySelectors[idx] === fn)
  )

  if (entry) return entry[1]

  const fn = getNewKeySelector(keySelectors)
  combinedKeySelectors[len].push([keySelectors, fn])
  return fn
}

export const getKeySelector = dependencies => {
  const sortedKeySelectors = dependencies
    .map(d => d.keySelector)
    .filter(Boolean)
    .sort()

  const uniqKeySelectors = []
  let prevKeySelector
  sortedKeySelectors.forEach(keySelector => {
    if (keySelector !== prevKeySelector) uniqKeySelectors.push(keySelector)
    prevKeySelector = keySelector
  })

  if (uniqKeySelectors.length === 0) return null
  return uniqKeySelectors.length === 1
    ? uniqKeySelectors[0]
    : getCombinedKeySelector(uniqKeySelectors)
}

export const createKeySelector = fn => {
  const res = (s, ...args) => fn(...args)
  res.keySelector = res
  return res
}
