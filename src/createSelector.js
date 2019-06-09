import { getIdSelector } from './idSelector'

const getComputeFn = (dependencies, computeFn, idSelector, getCache) => {
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

export const createSelector = (...args) => {
  const [computeFn] = args.splice(-1)
  const dependencies = getDependencies(args)
  const idSelector = getIdSelector(dependencies)
  const getSelector = idSelector ? getInstanceSelector : getComputeFn
  return getSelector(dependencies, computeFn, idSelector)
}

export const createStructuredSelector = obj => {
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
