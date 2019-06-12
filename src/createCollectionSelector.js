import { createSelectorCreator } from './createSelector'

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

export default createSelectorCreator(computeFn => {
  let prevVal
  return (...args) => {
    const res = computeFn(...args)
    if (!shallowEqual(res, prevVal)) prevVal = res
    return prevVal
  }
})
