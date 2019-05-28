import { inc, prop } from 'ramda'
import { createSelector, createKeySelector, createMapSelector } from '../src'

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
        (a, b) => a + b
      )
      expect(selector({ a: '3', b: '4' })).toEqual('34')
    })

    test('dependencies do not have to be grouped in an Array', () => {
      const selector = createSelector(
        prop('a'),
        prop('b'),
        (a, b) => a + b
      )
      expect(selector({ a: '3', b: '4' })).toEqual('34')
    })

    test('should not recompute if its previous args have not changed', () => {
      const selector = createSelector(
        prop('a'),
        prop('b'),
        (a, b) => a + b
      )
      expect(selector({ a: '3', b: '4' })).toEqual('34')
      expect(selector.recomputations()).toEqual(1)
      expect(selector({ a: '3', b: '4' })).toEqual('34')
      expect(selector.recomputations()).toEqual(1)
    })
  })
})

describe('createMapSelector', () => {
  const state = [0, 1, 2, 3, 4, 5]
  const getId = createKeySelector(prop('id'))
  const incId = createSelector(
    getId,
    inc
  )
  const idsSelector = s => s.map(id => ({ id }))
  const getIncState = createMapSelector(idsSelector, incId)
  test('it works', () => {
    const expecteState = [1, 2, 3, 4, 5, 6]
    expect(getIncState(state)).toEqual(expecteState)
    expect(getIncState.recomputations()).toBe(1)
    expect(getIncState([...state])).toEqual(expecteState)
    expect(getIncState.recomputations()).toBe(1)
    expect(() => {
      createMapSelector(Function.prototype, idsSelector, inc)
    }).toThrow()
  })
})

describe('keyed selectors', () => {
  let getFromProp, getToProp, getUserFrom, getUserTo, joinNames, getJoinedNames

  beforeEach(() => {
    getFromProp = createKeySelector(({ from }) => from.toString())
    getToProp = createKeySelector(({ to }) => to.toString())

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

      let props1 = { from: 1, to: 2 }
      const stopUsage1 = getJoinedNames.use(
        getJoinedNames.keySelector({}, props1)
      )
      getJoinedNames(s, props1)
      expect(getJoinedNames.recomputations()).toBe(1)
      expect(getUserFrom.recomputations()).toBe(1)
      expect(getUserTo.recomputations()).toBe(1)

      let props2 = { from: 1, to: 3 }
      const stopUsage2 = getJoinedNames.use(
        getJoinedNames.keySelector({}, props2)
      )
      getJoinedNames(s, props2)
      expect(getJoinedNames.recomputations()).toBe(2)
      expect(getUserFrom.recomputations()).toBe(1)
      expect(getUserTo.recomputations()).toBe(2)

      let props3 = { from: 2, to: 4 }
      const stopUsage3 = getJoinedNames.use(
        getJoinedNames.keySelector({}, props3)
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

  describe('keySelector', () => {
    test('it should not create new keySelectors unless it is required', () => {
      const propIdSelector = createKeySelector(({ id }) => id.toString())

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
  })
})
