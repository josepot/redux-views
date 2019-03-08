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
  const keySelectors = dependencies.map(x => x.keySelector).filter(Boolean)

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
  return resFn
}

class InstanceSelector {
  constructor(dependencies, computeFn, keySelector, cache) {
    this.keySelector = keySelector
    this.cache = cache || new Map()
    this.usages = new Map()
    this.usableDependencies = dependencies.filter(d => d.use)

    this.compute = getComputeFn(
      dependencies,
      computeFn,
      this.getCCache.bind(this)
    )
    this.compute.keySelector = keySelector
    this.compute.use = this.use.bind(this)
    this.compute.getCache = () => this.cache
  }

  getCCache(...args) {
    const key = this.keySelector(...args)
    this.latestKey = key
    if (!this.cache.has(key)) this.cache.set(key, new Array(2))
    return this.cache.get(key)
  }

  use() {
    const dependantUsages = this.usableDependencies.map(x => x.use())
    let latestKey
    const updateUsage = () => {
      const currentKey = this.latestKey
      if (latestKey === currentKey) return
      this.dec(latestKey)
      this.inc(currentKey)
      dependantUsages.forEach(([update]) => update())
      latestKey = currentKey
    }
    const stopUsage = () => {
      this.dec(latestKey)
      dependantUsages.forEach(([, stop]) => stop())
    }

    return [updateUsage, stopUsage]
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
    console.log('test inside')
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
