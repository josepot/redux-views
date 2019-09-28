const ofIdentity = [x => x]

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

const getIdSelector = dependencies => {
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

const getComputeFn = (dependencies_, computeFn, equalityFn, getCache) => {
  const dependencies = dependencies_.length > 0 ? dependencies_ : ofIdentity
  let nComputations = 0

  const resFn = (...args) => {
    const cache = getCache(...args)
    const [prevArgs, prevRes] = cache
    const computedArgs = dependencies.map(fn => fn(...args))
    if (prevArgs && computedArgs.every((val, idx) => val === prevArgs[idx])) {
      return prevRes
    }
    cache[0] = computedArgs
    const res = computeFn(...computedArgs)
    nComputations++
    return (cache[1] = equalityFn && equalityFn(res, prevRes) ? prevRes : res)
  }

  resFn.recomputations = () => nComputations
  resFn.resetRecomputations = () => (nComputations = 0)
  resFn.dependencies = dependencies
  resFn.resultFunc = computeFn
  return resFn
}

const getInstanceSelector = (
  dependencies,
  computeFn,
  equalityFn,
  idSelector
) => {
  let cache = {}
  let usages = {}

  const result = getComputeFn(
    dependencies,
    computeFn,
    equalityFn,
    (...args) => {
      const id = idSelector(...args)
      return cache[id] || (cache[id] = new Array(2))
    }
  )

  result.idSelector = idSelector

  const inc = id => (usages[id] = (usages[id] || 0) + 1)
  const dec = id => {
    if (usages[id] > 1) {
      usages[id]--
    } else {
      delete cache[id]
      delete usages[id]
    }
  }

  const usableDependencies = dependencies.filter(d => d.use)
  result.use = id => {
    inc(id)

    let dependantUsages
    if (idSelector.fns) {
      const ids = id.split('/').map(decodeURIComponent)
      dependantUsages = usableDependencies.map(x =>
        x.use(ids[idSelector.fns.indexOf(x.idSelector)])
      )
    } else {
      dependantUsages = usableDependencies.map(x => x.use(id))
    }

    return () => {
      dec(id)
      dependantUsages.forEach(stop => stop())
    }
  }

  result.clearCache = (recursive = true) => {
    cache = {}
    usages = {}
    if (recursive) usableDependencies.forEach(x => x.clearCache())
  }

  return result
}

const createSelector = (dependencies, computeFn, equalityFn) => {
  const idSelector = getIdSelector(dependencies)
  if (idSelector) {
    return getInstanceSelector(dependencies, computeFn, equalityFn, idSelector)
  }
  const cache = new Array(2)
  return getComputeFn(dependencies, computeFn, equalityFn, () => cache)
}

export default createSelector
