import { assocPath, prop, filter } from 'ramda'
import { createSelector, createIdSelector } from '../src'

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

const state = {
  users: {
    1: { id: 1, name: 'foo1' },
    2: { id: 2, name: 'foo2' },
    3: { id: 3, name: 'fooo3' },
    4: { id: 4, name: 'foooo4' },
    5: { id: 5, name: 'foo4' },
    6: { id: 6, name: 'foo5' },
    7: { id: 7, name: 'foo6' },
    8: { id: 8, name: 'foo7' },
    9: { id: 9, name: 'foo8' }
  }
}

const getUsers = prop('users')

describe('createSelector', () => {
  describe('computes dependant function', () => {
    test('it works', () => {
      const selector = createSelector([prop('a'), prop('b')], (a, b) => a + b)
      expect(selector({ a: '3', b: '4' })).toEqual('34')
      expect(selector({ a: 3, b: 4 })).toEqual(7)
    })

    test('should not recompute if its previous args have not changed', () => {
      const selector = createSelector([prop('a'), prop('b')], (a, b) => a + b)
      expect(selector({ a: '3', b: '4' })).toEqual('34')
      expect(selector.recomputations()).toEqual(1)
      expect(selector({ a: '3', b: '4' })).toEqual('34')
      expect(selector.recomputations()).toEqual(1)
    })
  })
})

describe('createCollectionSelector', () => {
  const state = {
    users: {
      id1: { id: 'id1', age: 15, name: 'John' },
      id2: { id: 'id2', age: 18, name: 'David' },
      id3: { id: 'id3', age: 19, name: 'Liz' },
      id4: { id: 'id4', age: 20, name: 'Eva' },
      id5: { id: 'id5', age: 12, name: 'Carles' },
      id6: { id: 'id6', age: 24, name: 'Joe' }
    },
    ids: ['id1', 'id2', 'id3', 'id4', 'id5', 'id6']
  }
  const getId = createIdSelector(prop('id'))
  const getUsers = prop('users')
  const getUserIds = prop('ids')
  const getUser = createSelector([getId, getUsers], prop)
  const getUserAge = createSelector([getUser], prop('age'))

  const getUsersList = createSelector(
    [],
    state => getUserIds(state).map(id => getUserAge(state, { id })),
    shallowEqual
  )

  const getUsersUnderAge = createSelector(
    [getUsersList],
    filter(age => age < 18),
    shallowEqual
  )

  test('it does not return a new value unless the return collection has changed', () => {
    const initialResult = getUsersUnderAge(state)
    expect(initialResult).toEqual([15, 12])
    expect(getUsersUnderAge(state)).toBe(initialResult)

    let newState = assocPath(['users', 'id2', 'age'], 19, state)
    expect(getUsersUnderAge(newState)).toBe(initialResult)

    newState = assocPath(['users', 'id2', 'age'], 17, state)
    expect(getUsersUnderAge(newState)).toEqual([15, 17, 12])
  })
})

describe('id selectors', () => {
  let getFromProp, getToProp, getUserFrom, getUserTo, joinNames, getJoinedNames

  beforeEach(() => {
    getFromProp = createIdSelector(({ from }) => from.toString())
    getToProp = createIdSelector(({ to }) => to.toString())

    getUserFrom = createSelector([getFromProp, getUsers], prop)
    getUserTo = createSelector([getToProp, getUsers], prop)

    joinNames = jest.fn(
      ({ name: nameA }, { name: nameB }) => `${nameA}-${nameB}`
    )

    getJoinedNames = createSelector([getUserFrom, getUserTo], joinNames)
  })

  describe('cache and recomputations', () => {
    test('it detects those selectors that its cache should be keyed', () => {
      const joinedOneTwo = getJoinedNames(state, { from: 1, to: 2 })
      expect(joinedOneTwo).toEqual('foo1-foo2')
      expect(joinNames.mock.calls.length).toBe(1)
      expect(getUserTo.recomputations()).toBe(1)
      expect(getUserFrom.recomputations()).toBe(1)
      expect(getJoinedNames.recomputations()).toBe(1)

      const joinedOneThree = getJoinedNames(state, { from: 1, to: 3 })
      expect(joinedOneThree).toEqual('foo1-fooo3')
      expect(joinNames.mock.calls.length).toBe(2)
      expect(getUserTo.recomputations()).toBe(2)
      expect(getUserFrom.recomputations()).toBe(1)
      expect(getJoinedNames.recomputations()).toBe(2)

      const joinedOneTwoAgain = getJoinedNames(state, { from: 1, to: 2 })
      expect(joinedOneTwoAgain).toBe(joinedOneTwo)
      expect(joinNames.mock.calls.length).toBe(2)
      expect(getUserTo.recomputations()).toBe(2)
      expect(getUserFrom.recomputations()).toBe(1)
      expect(getJoinedNames.recomputations()).toBe(2)

      const newState = {
        ...state,
        users: {
          ...state.users,
          newOne: {}
        }
      }

      const joinedOneThreeAgain = getJoinedNames(newState, { from: 1, to: 3 })
      expect(joinedOneThreeAgain).toBe(joinedOneThree)
      expect(joinNames.mock.calls.length).toBe(2)
      expect(getUserTo.recomputations()).toBe(3)
      expect(getUserFrom.recomputations()).toBe(2)
      expect(getJoinedNames.recomputations()).toBe(2)
    })
  })

  describe('usage: refCounts', () => {
    test('it cleans the cache when all users unsubscribe', () => {
      let s = state

      let props1 = { from: 1, to: 2 }
      const stopUsage1 = getJoinedNames.use(
        getJoinedNames.idSelector({}, props1)
      )
      getJoinedNames(s, props1)
      expect(getJoinedNames.recomputations()).toBe(1)
      expect(getUserFrom.recomputations()).toBe(1)
      expect(getUserTo.recomputations()).toBe(1)

      let props2 = { from: 1, to: 3 }
      const stopUsage2 = getJoinedNames.use(
        getJoinedNames.idSelector({}, props2)
      )
      getJoinedNames(s, props2)
      expect(getJoinedNames.recomputations()).toBe(2)
      expect(getUserFrom.recomputations()).toBe(1)
      expect(getUserTo.recomputations()).toBe(2)

      let props3 = { from: 2, to: 4 }
      const stopUsage3 = getJoinedNames.use(
        getJoinedNames.idSelector({}, props3)
      )
      getJoinedNames(s, props3)
      expect(getJoinedNames.recomputations()).toBe(3)
      expect(getUserFrom.recomputations()).toBe(2)
      expect(getUserTo.recomputations()).toBe(3)

      getJoinedNames(s, props1)
      getJoinedNames(s, props2)
      getJoinedNames(s, props3)
      expect(getJoinedNames.recomputations()).toBe(3)
      expect(getUserFrom.recomputations()).toBe(2)
      expect(getUserTo.recomputations()).toBe(3)

      s = {
        ...state,
        users: {
          ...state.users,
          newOne: {}
        }
      }

      getJoinedNames(s, props1)
      getJoinedNames(s, props2)
      getJoinedNames(s, props3)
      expect(getJoinedNames.recomputations()).toBe(3)
      expect(getUserFrom.recomputations()).toBe(4)
      expect(getUserTo.recomputations()).toBe(6)

      stopUsage1()
      stopUsage2()
      stopUsage3()

      getJoinedNames(s, props1)
      getJoinedNames(s, props2)
      getJoinedNames(s, props3)
      expect(getJoinedNames.recomputations()).toBe(6)
      expect(getUserFrom.recomputations()).toBe(6)
      expect(getUserTo.recomputations()).toBe(9)
    })
  })

  describe('clear cache', () => {
    test('it clears the cache recursively', () => {
      getJoinedNames(state, { from: 1, to: 2 })
      getJoinedNames(state, { from: 3, to: 2 })
      getJoinedNames(state, { from: 1, to: 3 })

      expect(getJoinedNames.recomputations()).toBe(3)
      expect(getUserTo.recomputations()).toBe(2)
      expect(getUserFrom.recomputations()).toBe(2)

      getJoinedNames(state, { from: 1, to: 2 })
      getJoinedNames(state, { from: 3, to: 2 })
      getJoinedNames(state, { from: 1, to: 3 })

      expect(getJoinedNames.recomputations()).toBe(3)
      expect(getUserTo.recomputations()).toBe(2)
      expect(getUserFrom.recomputations()).toBe(2)

      getJoinedNames.clearCache()

      getJoinedNames(state, { from: 1, to: 2 })
      getJoinedNames(state, { from: 3, to: 2 })
      getJoinedNames(state, { from: 1, to: 3 })

      expect(getJoinedNames.recomputations()).toBe(6)
      expect(getUserTo.recomputations()).toBe(4)
      expect(getUserFrom.recomputations()).toBe(4)
    })

    test('it clears the cache non recursively', () => {
      getJoinedNames(state, { from: 1, to: 2 })
      getJoinedNames(state, { from: 3, to: 2 })
      getJoinedNames(state, { from: 1, to: 3 })

      expect(getJoinedNames.recomputations()).toBe(3)
      expect(getUserTo.recomputations()).toBe(2)
      expect(getUserFrom.recomputations()).toBe(2)

      getJoinedNames(state, { from: 1, to: 2 })
      getJoinedNames(state, { from: 3, to: 2 })
      getJoinedNames(state, { from: 1, to: 3 })

      expect(getJoinedNames.recomputations()).toBe(3)
      expect(getUserTo.recomputations()).toBe(2)
      expect(getUserFrom.recomputations()).toBe(2)

      getJoinedNames.clearCache(false)

      getJoinedNames(state, { from: 1, to: 2 })
      getJoinedNames(state, { from: 3, to: 2 })
      getJoinedNames(state, { from: 1, to: 3 })

      expect(getJoinedNames.recomputations()).toBe(6)
      expect(getUserTo.recomputations()).toBe(2)
      expect(getUserFrom.recomputations()).toBe(2)
    })
  })

  describe('idSelector', () => {
    test('it should not create new idSelectors unless it is required', () => {
      const propIdSelector = createIdSelector(({ id }) => id.toString())

      const isItemLoadingSelector = createSelector(
        [propIdSelector, () => ({})],
        Function.prototype
      )

      const isItemSelectedSelector = createSelector(
        [propIdSelector, () => ({})],
        Function.prototype
      )

      const rawItemSelector = createSelector(
        [propIdSelector, () => ({})],
        Function.prototype
      )

      const itemSelector = createSelector(
        [rawItemSelector, isItemLoadingSelector, isItemSelectedSelector],
        (item, isLoading, isSelected) => ({
          ...item,
          isLoading,
          isSelected
        })
      )

      expect(isItemLoadingSelector.idSelector).toBe(propIdSelector.idSelector)
      expect(isItemSelectedSelector.idSelector).toBe(propIdSelector.idSelector)
      expect(rawItemSelector.idSelector).toBe(propIdSelector.idSelector)
      expect(itemSelector.idSelector).toBe(propIdSelector.idSelector)
    })
  })
})
