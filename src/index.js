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

const getKeySelectorEntries = (dependencies, keySelector, compute) => {
  const usableDependencies = dependencies.filter(
    d => typeof d.use === 'function'
  )

  const result = [[keySelector, [compute]]]
  const kSelectorsMap = new WeakMap([[keySelector, 0]])

  usableDependencies.forEach(d => {
    d.keySelectorEntries.forEach(([kSelector, selectors]) => {
      const idx = kSelectorsMap.get(kSelector)
      if (idx !== undefined) {
        result[idx][1].push(...selectors)
      } else {
        kSelectorsMap.set(kSelector, result.length)
        result.push([kSelector, [...selectors]])
      }
    })
  })
  return result
}

class Selector {
  constructor(dependencies, computeFn) {
    this.dependencies = dependencies
    this.computeFn = computeFn
    this.nComputations = 0
    this.compute = this.compute.bind(this)
    this.compute.__ref__ = this
  }

  compute(...args) {
    const cache = this.getCache(...args)
    const [prevArgs, prevRes] = cache
    const computeFnArgs = this.dependencies.map(fn => fn(...args))
    if (prevArgs && computeFnArgs.every((val, idx) => val === prevArgs[idx])) {
      return prevRes
    }
    const res = this.computeFn(...computeFnArgs)
    this.nComputations++
    cache[0] = computeFnArgs
    cache[1] = res
    return res
  }
}

const selfBind = (that, ...fns) =>
  fns.forEach(fn => {
    that[fn] = that[fn].bind(that)
  })

class InstanceSelector extends Selector {
  constructor(dependencies, computeFn, keySelector, cache) {
    super(dependencies, computeFn)
    this.keySelector = keySelector
    this.keySelectorEntries = getKeySelectorEntries(
      dependencies,
      this.keySelector,
      this.compute
    )
    this.cache = cache || new Map()
    this.usages = new Map()

    selfBind(this, 'inc', 'dec', 'getCache', 'use')

    this.compute.keySelector = keySelector
    this.compute.keySelectorEntries = this.keySelectorEntries
    this.compute.inc = this.inc
    this.compute.dec = this.dec
    this.compute.use = this.use
  }

  getCache(...args) {
    const key = this.keySelector(...args)
    if (!this.cache.has(key)) this.cache.set(key, new Array(2))
    return this.cache.get(key)
  }

  use() {
    let prevKeys = new Array(this.keySelectorEntries.length)
    let prevFns = new Array(this.keySelectorEntries.length)
    return (...args) => {
      const keys = this.keySelectorEntries.map(([ks]) => ks(...args))
      keys.forEach((key, idx) => {
        if (key !== prevKeys[idx]) {
          prevKeys[idx] = key
          prevFns[idx] = () => {
            this.keySelectorEntries[idx][1].forEach(s => s.inc(key))
            return () => {
              this.keySelectorEntries[idx][1].forEach(s => s.dec(key))
            }
          }
        }
      })
      return prevFns
    }
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

class FlatSelector extends Selector {
  constructor(dependencies, computeFn) {
    super(dependencies, computeFn)
    this.cache = new Array(2)
    this.usages = 0
    this.getCache = this.getCache.bind(this)
  }

  getCache() {
    return this.cache
  }
}

const getDependencies = args =>
  args.length === 1 && Array.isArray(args[0]) ? args[0] : args

export const createSelector = (...args) => {
  const [computeFn] = args.splice(-1)
  const dependencies = getDependencies(args)
  const keySelector = getKeySelector(dependencies)
  const SelectorType = keySelector ? InstanceSelector : FlatSelector
  return new SelectorType(dependencies, computeFn, keySelector).compute
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
  const keySelector = createSelector(
    [s => s, (s, p) => p],
    x
  )
  keySelector.keySelector = keySelector
  return keySelector
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
