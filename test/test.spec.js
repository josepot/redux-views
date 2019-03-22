import { add, prop } from 'ramda'
import {
  createSelector,
  createKeySelector,
  createKeyedSelectorFactory
} from '../src'

console.log('env', process.env.NODE_ENV)

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
    test('dependencies can be grouped in an Array', () => {
      const selector = createSelector(
        [prop('a'), prop('b')],
        add
      )
      expect(selector({ a: 3, b: 4 })).toEqual(7)
    })

    test('dependencies do not have to be grouped in an Array', () => {
      const selector = createSelector(
        prop('a'),
        prop('b'),
        add
      )
      expect(selector({ a: 3, b: 4 })).toEqual(7)
    })
  })
})

describe('createKeyedSelectorFactory', () => {
  test('returns a factory of keyed-selectors with a shared cache', () => {
    const getUserFactory = createKeyedSelectorFactory(
      getUsers,
      (users, key) => users[key]
    )

    const getUserFrom = getUserFactory(({ from }) => from)
    const getUserTo = getUserFactory(({ to }) => to)

    expect(getUserFrom(state, { from: 1 })).toBe(state.users[1])
    expect(getUserFrom.recomputations()).toBe(1)
    expect(getUserTo.recomputations()).toBe(0)

    expect(getUserTo(state, { to: 1 })).toBe(state.users[1])
    expect(getUserFrom.recomputations()).toBe(1)
    expect(getUserTo.recomputations()).toBe(0)

    expect(getUserTo(state, { to: 2 })).toBe(state.users[2])
    expect(getUserTo.recomputations()).toBe(1)
    expect(getUserFrom.recomputations()).toBe(1)
  })
})

describe('keyed selectors', () => {
  let getFromProp, getToProp, getUserFrom, getUserTo, joinNames, getJoinedNames

  beforeEach(() => {
    getFromProp = createKeySelector(({ from }) => from)
    getToProp = createKeySelector(({ to }) => to)

    getUserFrom = createSelector(
      [getFromProp, getUsers],
      prop
    )
    getUserTo = createSelector(
      [getToProp, getUsers],
      prop
    )

    joinNames = jest.fn(
      ({ name: nameA }, { name: nameB }) => `${nameA}-${nameB}`
    )

    getJoinedNames = createSelector(
      [getUserFrom, getUserTo],
      joinNames
    )
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

      const [selector1, stopUsage1] = getJoinedNames.use()
      let props1 = { from: 1, to: 2 }
      selector1(s, props1)
      expect(getJoinedNames.recomputations()).toBe(1)

      const [selector2, stopUsage2] = getJoinedNames.use()
      let props2 = { from: 1, to: 3 }
      selector2(s, props2)
      expect(getJoinedNames.recomputations()).toBe(2)

      const [selector3, stopUsage3] = getJoinedNames.use()
      let props3 = { from: 2, to: 4 }
      selector3(s, props3)
      expect(getJoinedNames.recomputations()).toBe(3)

      s = {
        ...state,
        users: {
          ...state.users,
          newOne: {}
        }
      }

      selector1(s, props1)
      selector2(s, props2)
      selector3(s, props3)
      getJoinedNames(s, props1)
      getJoinedNames(s, props2)
      getJoinedNames(s, props3)
      expect(getJoinedNames.recomputations()).toBe(3)

      stopUsage1()
      stopUsage2()
      stopUsage3()

      getJoinedNames(s, props1)
      getJoinedNames(s, props2)
      getJoinedNames(s, props3)
      expect(getJoinedNames.recomputations()).toBe(6)
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

  describe('keySelector', () => {
    test('it should not create new keySelectors unless it is required', () => {
      const propIdSelector = createKeySelector(({ id }) => id)

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

      expect(isItemLoadingSelector.keySelector).toBe(propIdSelector)
      expect(isItemSelectedSelector.keySelector).toBe(propIdSelector)
      expect(rawItemSelector.keySelector).toBe(propIdSelector)
      expect(itemSelector.keySelector).toBe(propIdSelector)
    })

    test('it should create new keySelectors when it is required', () => {
      const getUserFactory = createKeyedSelectorFactory(
        getUsers,
        (users, key) => users[key]
      )
      const getUserFrom = getUserFactory(({ from }) => from)
      const getUserTo = getUserFactory(({ to }) => to)
      const compareUsers = createSelector(
        [getUserFrom, getUserTo],
        () => null
      )

      expect(getUserFrom.keySelector).not.toBe(getUserTo.keySelector)
      expect(compareUsers.keySelector).not.toBe(getUserTo.keySelector)
      expect(compareUsers.keySelector).not.toBe(getUserFrom.keySelector)
    })
  })
})
