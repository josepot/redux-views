const identity = x => x
const ofIdentity = [identity]

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

const getComputeFn = (dependencies_, computeFn, idSelector, getCache) => {
  const dependencies = dependencies_.length > 0 ? dependencies_ : ofIdentity
  let nComputations = 0

  if (!getCache) {
    const cache = new Array(2)
    getCache = () => cache
  }

  const computeFnCached = (computeFnArgs, id) => {
    const cache = getCache(id)
    const [prevArgs, prevRes] = cache
    if (prevArgs && computeFnArgs.every((val, idx) => val === prevArgs[idx])) {
      return prevRes
    }
    nComputations++
    const res = computeFn(...computeFnArgs)
    cache[0] = computeFnArgs
    cache[1] = res
    return res
  }

  const resFn = idSelector
    ? (...args) =>
        computeFnCached(
          dependencies.map(fn => fn(...args)),
          idSelector(...args)
        )
    : (...args) => computeFnCached(dependencies.map(fn => fn(...args)))

  resFn.recomputations = () => nComputations
  resFn.resetRecomputations = () => (nComputations = 0)
  resFn.dependencies = dependencies
  resFn.resultFunc = computeFn
  resFn.resultFuncCached = computeFnCached
  resFn.resultFuncCached.recomputations = resFn.recomputations
  return resFn
}

const getInstanceSelector = (
  dependencies,
  computeFn,
  idSelector,
  cache = new Map()
) => {
  const usages = new Map()

  const result = getComputeFn(dependencies, computeFn, idSelector, id => {
    if (!cache.has(id)) cache.set(id, new Array(2))
    return cache.get(id)
  })

  result.idSelector = idSelector

  const inc = id => usages.set(id, (usages.get(id) || 0) + 1)
  const dec = id => {
    const count = usages.get(id)
    if (count === undefined) return
    if (count === 1) {
      cache.delete(id)
      usages.delete(id)
    } else {
      usages.set(id, count - 1)
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
    cache.clear()
    usages.clear()
    if (recursive) usableDependencies.forEach(x => x.clearCache())
  }

  return result
}

const getDependencies = args =>
  args.length === 1 && Array.isArray(args[0]) ? args[0] : args

export const createSelectorCreator = computeFnEnhancer => (...args) => {
  const computeFn = computeFnEnhancer(args.splice(-1)[0])
  const dependencies = getDependencies(args)
  const idSelector = getIdSelector(dependencies)
  const getSelector = idSelector ? getInstanceSelector : getComputeFn
  return getSelector(dependencies, computeFn, idSelector)
}

export default createSelectorCreator(identity)
