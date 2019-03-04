const alwaysZero = () => 0
const emptyArr = []

class Selector {
  constructor(dependencies, computeFn, keySelector = alwaysZero) {
    this.dependencies = dependencies
    this.computeFn = computeFn
    this.keySelector = keySelector

    this.data = new Map()
    this.usages = new Map()
    this.compute = this.compute.bind(this)
    this.compute.__ref__ = this

    this.usableDependencies = dependencies.filter(
      d => typeof d.use === 'function'
    )

    this.keySelectorEntries = [[keySelector, [this.compute]]]
    const kSelectorsMap = new WeakMap([[keySelector, 0]])

    this.usableDependencies.forEach(d => {
      d.__ref__.getKeySelectorEntries().forEach(([kSelector, selectors]) => {
        const idx = kSelectorsMap.get(kSelector)
        if (idx !== undefined) {
          this.keySelectorEntries[idx][1].push(...selectors)
        } else {
          kSelectorsMap.set(kSelector, this.keySelectorEntries.length)
          this.keySelectorEntries.push([kSelector, [...selectors]])
        }
      })
    })

    this.compute.use = () => {
      let prevKeys = new Array(this.keySelectorEntries.length)
      let prevFns = new Array(this.keySelectorEntries.length)
      return (...args) => {
        const keys = this.keySelectorEntries.map(([ks]) => ks(...args))
        keys.forEach((key, idx) => {
          if (key !== prevKeys[idx]) {
            prevKeys[idx] = key
            prevFns[idx] = () => {
              this.keySelectorEntries[idx][1].forEach(s => s.__ref__.inc(key))
              return () => {
                this.keySelectorEntries[idx][1].forEach(s => s.__ref__.dec(key))
              }
            }
          }
        })
        return prevFns
      }
    }
  }

  compute(...args) {
    const key = this.keySelector(...args)
    const computeFnArgs = this.dependencies.map(fn => fn(...args))
    const [prevArgs, prevRes] = this.data.get(key) || emptyArr
    if (prevArgs && computeFnArgs.every((val, idx) => val === prevArgs[idx])) {
      return prevRes
    }
    const res = this.computeFn(...computeFnArgs)
    this.data.set(key, [computeFnArgs, res])
    return res
  }

  getKeySelectorEntries() {
    return this.keySelectorEntries
  }

  inc(key) {
    const count = this.usages.get(key) || 0
    this.usages.set(key, count + 1)
  }

  dec(key) {
    const count = this.usages.get(key)
    if (count === undefined) return
    if (count === 1) return this.data.delete(key)
    this.usages.set(key, count - 1)
  }
}

export default (dependencies_, computeFn_, keySelector) => {
  if (!computeFn_ && !keySelector && typeof dependencies_ === 'object') {
    const dependencies = Object.values(dependencies_)
    const keys = Object.keys(dependencies_)
    const computeFn = (...values) => {
      const res = Array.isArray(dependencies_) ? new Array(keys.length) : {}
      values.forEach((val, idx) => (res[keys[idx]] = val))
      return res
    }
    return new Selector(dependencies, computeFn, keySelector).compute
  }
  return new Selector(dependencies_, computeFn_, keySelector).compute
}
