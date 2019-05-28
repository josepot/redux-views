const hasOwn = Object.prototype.hasOwnProperty

function shallowEqual(objA, objB) {
  if (objA === objB) return true

  if (
    typeof objA !== 'object' ||
    objA === null ||
    typeof objB !== 'object' ||
    objB === null
  ) {
    return false
  }

  const keysA = Object.keys(objA)
  const keysB = Object.keys(objB)

  if (keysA.length !== keysB.length) return false

  for (let i = 0; i < keysA.length; i++) {
    if (!hasOwn.call(objB, keysA[i]) || objA[keysA[i]] !== objB[keysA[i]]) {
      return false
    }
  }

  return true
}

const map = (fn, target) => {
  const isArray = Array.isArray(target)
  const res = isArray ? new Array(target.length) : {}

  for (let key in target) {
    res[key] = fn(target[key])
  }

  return res
}

export default (idsSelector, itemSelector) => {
  if (typeof itemSelector.keySelector !== 'function') throw new Error()
  const mapper = state => id =>
    itemSelector(state, ...(Array.isArray(id) ? id : [id]))

  let prevRes
  let recomputations = 0

  const res = state => {
    const finalMapper = mapper(state)
    const ids = idsSelector(state)
    const result = map(finalMapper, ids)
    if (shallowEqual(result, prevRes)) {
      return prevRes
    }
    recomputations++
    return (prevRes = result)
  }

  res.recomputations = () => recomputations
  res.resetRecomputations = () => (recomputations = 0)

  return res
}
