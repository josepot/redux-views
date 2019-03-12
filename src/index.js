const getNewKeySelector = fns => (...args) =>
  fns.map(fn => encodeURIComponent(fn(...args))).join('/')

const combinedKeySelectors = {}
const getCombinedKeySelector = keySelectors => {
  const len = keySelectors.length
  if (!combinedKeySelectors[len]) combinedKeySelectors[len] = []

  const entry = combinedKeySelectors[len].find(([candidates]) =>
    candidates.every(c => keySelectors.some(k => k === c))
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
    : getCombinedKeySelector(keySelectors)
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
  return resFn
}

class InstanceSelector {
  constructor(dependencies, computeFn, keySelector, cache) {
    this.keySelector = keySelector
    this.cache = cache || new Map()
    this.usages = new Map()
    this.usableDependencies = dependencies.filter(d => d.use)

    this.compute = getComputeFn(dependencies, computeFn, (...args) => {
      const key = this.keySelector(...args)
      this.latestKey = key
      if (!this.cache.has(key)) this.cache.set(key, new Array(2))
      return this.cache.get(key)
    })
    this.compute.keySelector = keySelector
    this.compute.use = this.use.bind(this)
    this.compute.clearCache = (recursive = true) => {
      this.cache.clear()
      this.usages.clear()
      if (recursive) this.usableDependencies.forEach(x => x.clearCache())
    }
  }

  use() {
    const dependantUsages = this.usableDependencies.map(x => x.use())
    let prevKey
    let hasStopped = false
    const selector = (...args) => {
      const res = this.compute(...args)
      const currentKey = this.latestKey
      if (prevKey === currentKey) return res
      this.dec(prevKey)
      this.inc(currentKey)
      dependantUsages.forEach(([s]) => s(...args))
      prevKey = currentKey
      return res
    }
    const stopUsage = () => {
      if (hasStopped) return
      hasStopped = true
      this.dec(prevKey)
      dependantUsages.forEach(([, stop]) => stop())
    }

    return [selector, stopUsage]
  }

  inc(key) {
    const count = this.usages.get(key) || 0
    this.usages.set(key, count + 1)
  }

  dec(key) {
    const count = this.usages.get(key)
    if (count === undefined) return
    if (count === 1) this.cache.delete(key)
    this.usages.set(key, count - 1)
  }
}

const getDependencies = args =>
  args.length === 1 && Array.isArray(args[0]) ? args[0] : args

export const createSelector = (...args) => {
  const [computeFn] = args.splice(-1)
  const dependencies = getDependencies(args)
  const keySelector = getKeySelector(dependencies)
  return keySelector
    ? new InstanceSelector(dependencies, computeFn, keySelector).compute
    : getComputeFn(dependencies, computeFn)
}

export const createKeyedSelectorFactory = (...args) => {
  const [computeFn] = args.splice(-1)
  const dependencies = getDependencies(args)
  const cache = new Map()
  return selector => {
    const keySelector = createKeySelector(selector)
    return new InstanceSelector(
      [...dependencies, keySelector],
      computeFn,
      keySelector,
      cache
    ).compute
  }
}

export const createKeySelector = x => {
  x.keySelector = x
  return x
}

export const createStructuredSelector = obj => {
  const dependencies = Object.values(obj)
  const keys = Object.keys(obj)
  const compute = (...vals) => {
    const res = {}
    vals.forEach((val, idx) => (res[keys[idx]] = val))
    return res
  }
  return createSelector(
    dependencies,
    compute
  )
}

export const isInstanceSelector = sel => sel.keySelector && sel.use
