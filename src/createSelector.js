import { getKeySelector } from './keySelector'

const getComputeFn = (dependencies, computeFn, keySelector, getCache) => {
  let nComputations = 0

  if (!getCache) {
    const cache = new Array(2)
    getCache = () => cache
  }

  const computeFnCached = (computeFnArgs, key) => {
    const cache = getCache(key)
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

  const resFn = keySelector
    ? (...args) =>
        computeFnCached(
          dependencies.map(fn => fn(...args)),
          keySelector(...args)
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
  keySelector,
  cache = new Map()
) => {
  const usages = new Map()

  const result = getComputeFn(dependencies, computeFn, keySelector, key => {
    if (!cache.has(key)) cache.set(key, new Array(2))
    return cache.get(key)
  })

  result.keySelector = keySelector

  const inc = key => usages.set(key, (usages.get(key) || 0) + 1)
  const dec = key => {
    const count = usages.get(key)
    if (count === undefined) return
    if (count === 1) {
      cache.delete(key)
      usages.delete(key)
    } else {
      usages.set(key, count - 1)
    }
  }

  const usableDependencies = dependencies.filter(d => d.use)
  result.use = key => {
    inc(key)

    let dependantUsages
    if (keySelector.fns) {
      const keys = key.split('/').map(decodeURIComponent)
      dependantUsages = usableDependencies.map(x =>
        x.use(keys[keySelector.fns.indexOf(x.keySelector)])
      )
    } else {
      dependantUsages = usableDependencies.map(x => x.use(key))
    }

    return () => {
      dec(key)
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
  const keySelector = getKeySelector(dependencies)
  const getSelector = keySelector ? getInstanceSelector : getComputeFn
  return getSelector(dependencies, computeFn, keySelector)
}

export const createStructuredSelector = obj => {
  const keys = Object.keys(obj)
  const compute = (...vals) => {
    const res = {}
    vals.forEach((val, idx) => (res[keys[idx]] = val))
    return res
  }
  return createSelector(
    Object.values(obj),
    compute
  )
}
