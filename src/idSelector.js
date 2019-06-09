const getNewIdSelector = fns => {
  const res = (...args) =>
    fns.map(fn => encodeURIComponent(fn(...args))).join('/')
  res.fns = fns
  res.idSelector = res
  return res
}

const combinedIdSelectors = {}
const getCombinedIdSelector = idSelectors => {
  const len = idSelectors.length
  if (!combinedIdSelectors[len]) combinedIdSelectors[len] = []

  const entry = combinedIdSelectors[len].find(([candidates]) =>
    candidates.every((fn, idx) => idSelectors[idx] === fn)
  )

  if (entry) return entry[1]

  const fn = getNewIdSelector(idSelectors)
  combinedIdSelectors[len].push([idSelectors, fn])
  return fn
}

export const getIdSelector = dependencies => {
  const sortedIdSelectors = dependencies
    .map(d => d.idSelector)
    .filter(Boolean)
    .sort()

  const uniqIdSelectors = []
  let prevIdSelector
  sortedIdSelectors.forEach(idSelector => {
    if (idSelector !== prevIdSelector) uniqIdSelectors.push(idSelector)
    prevIdSelector = idSelector
  })

  if (uniqIdSelectors.length === 0) return null
  return uniqIdSelectors.length === 1
    ? uniqIdSelectors[0]
    : getCombinedIdSelector(uniqIdSelectors)
}

export const createIdSelector = fn => {
  const res = (s, ...args) => fn(...args)
  res.idSelector = res
  return res
}
