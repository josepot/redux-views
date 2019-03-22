const getNewKeySelector = fns => (...args) =>
  fns.map(fn => encodeURIComponent(fn(...args))).join('/')

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

const getKeySelector = dependencies => {
  const keySelectorsSet = new WeakSet()
  const keySelectors = []
  dependencies.forEach(({ keySelector }) => {
    if (!keySelector || keySelectorsSet.has(keySelector)) return
    keySelectors.push(keySelector)
    keySelectorsSet.add(keySelector)
  })

  if (keySelectors.length === 0) return null
  return keySelectors.length === 1
    ? keySelectors[0]
    : getCombinedKeySelector(keySelectors.sort())
}

const getComputeFn = (dependencies, computeFn, getCache) => {
  if (!getCache) getCache = () => new Array(2)
  let nComputations = 0
  const resFn = (...args) => {
    const cache = getCache(...args)
    const [prevArgs, prevRes] = cache
    const computeFnArgs = dependencies.map(fn => fn(...args))
    if (prevArgs && computeFnArgs.every((val, idx) => val === prevArgs[idx])) {
      return prevRes
    }
    nComputations++
    const res = computeFn(...computeFnArgs)
    cache[0] = computeFnArgs
    cache[1] = res
    return res
  }
  resFn.recomputations = () => nComputations
  resFn.resetRecomputations = () => (nComputations = 0)
  resFn.dependencies = dependencies
  resFn.resultFn = computeFn
  return resFn
}

const getInstanceSelector = (
  dependencies,
  computeFn,
  keySelector,
  cache = new Map()
) => {
  const usages = new Map()
  const usableDependencies = dependencies.filter(d => d.use)
  let latestKey

  const result = getComputeFn(dependencies, computeFn, (...args) => {
    const key = keySelector(...args)
    latestKey = key
    if (!cache.has(key)) cache.set(key, new Array(2))
    return cache.get(key)
  })

  result.keySelector = keySelector

  const inc = key => usages.set(key, (usages.get(key) || 0) + 1)
  const dec = key => {
    const count = usages.get(key)
    if (count === undefined) return
    if (count === 1) cache.delete(key)
    usages.set(key, count - 1)
  }

  result.use = () => {
    const dependantUsages = usableDependencies.map(x => x.use())
    let prevKey
    let hasStopped = false
    const selector = (...args) => {
      const res = result(...args)
      const currentKey = latestKey
      if (prevKey === currentKey) return res
      dec(prevKey)
      inc(currentKey)
      dependantUsages.forEach(([s]) => s(...args))
      prevKey = currentKey
      return res
    }
    const stopUsage = () => {
      if (hasStopped) return
      hasStopped = true
      dec(prevKey)
      dependantUsages.forEach(([, stop]) => stop())
    }

    return [selector, stopUsage]
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

export const createKeyedSelectorFactory = (...args) => {
  const [computeFn] = args.splice(-1)
  const dependencies = getDependencies(args)
  const cache = new Map()
  return fn => {
    const keySelector = createKeySelector(fn)
    return getInstanceSelector(
      [...dependencies, keySelector],
      computeFn,
      keySelector,
      cache
    )
  }
}

export const createKeySelector = fn => {
  const res = (s, ...args) => fn(...args)
  res.keySelector = res
  return res
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

export const isInstanceSelector = sel => sel.keySelector && sel.use
