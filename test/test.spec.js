import { add, prop } from 'ramda'
import {
  createSelector,
  createKeySelector,
  createKeyedSelectorFactory
} from '../src'

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

    const getPropsFrom = jest.fn((s, { from }) => from)
    const getPropsTo = jest.fn((s, { to }) => to)
    const getUserFrom = getUserFactory(getPropsFrom)
    const getUserTo = getUserFactory(getPropsTo)

    expect(getUserFrom.__ref__.cache instanceof Map).toBe(true)
    expect(getUserFrom.__ref__.cache.size).toBe(0)
    expect(getUserTo.__ref__.cache).toBe(getUserFrom.__ref__.cache)

    expect(getPropsFrom.mock.calls.length).toBe(0)
    expect(getUserFrom.__ref__.cache.size).toBe(0)

    expect(getUserFrom(state, { from: 1 })).toBe(state.users[1])
    expect(getUserFrom.__ref__.cache.size).toBe(1)
    expect(getPropsFrom.mock.calls.length).toBe(1)
    expect(getUserTo.__ref__.nComputations).toBe(0)

    expect(getUserTo(state, { to: 1 })).toBe(state.users[1])
    expect(getUserFrom.__ref__.cache.size).toBe(1)
    expect(getUserTo.__ref__.nComputations).toBe(0)
    expect(getPropsTo.mock.calls.length).toBe(1)
    expect(getUserTo.__ref__.nComputations).toBe(0)

    expect(getUserTo(state, { to: 2 })).toBe(state.users[2])
    expect(getUserFrom.__ref__.cache.size).toBe(2)
    expect(getUserTo.__ref__.nComputations).toBe(1)
    expect(getPropsTo.mock.calls.length).toBe(2)
  })
})

describe('keyed selectors', () => {
  let getFromProp, getToProp, getUserFrom, getUserTo, joinNames, getJoinedNames

  beforeEach(() => {
    getFromProp = createKeySelector((state, { from }) => from)
    getToProp = createKeySelector((state, { to }) => to)

    getUserFrom = createSelector(
      getFromProp,
      getUsers,
      prop
    )
    getUserTo = createSelector(
      getToProp,
      getUsers,
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

      const joinedOneThree = getJoinedNames(state, { from: 1, to: 3 })
      expect(joinedOneThree).toEqual('foo1-fooo3')
      expect(joinNames.mock.calls.length).toBe(2)
      expect(getUserTo.__ref__.nComputations).toBe(2)
      expect(getUserTo.__ref__.cache.size).toBe(2)
      expect(getUserFrom.__ref__.nComputations).toBe(1)
      expect(getUserFrom.__ref__.cache.size).toBe(1)

      const joinedOneTwoAgain = getJoinedNames(state, { from: 1, to: 2 })
      expect(joinedOneTwoAgain).toBe(joinedOneTwo)
      expect(joinNames.mock.calls.length).toBe(2)
      expect(getUserTo.__ref__.nComputations).toBe(2)
      expect(getUserTo.__ref__.cache.size).toBe(2)
      expect(getUserFrom.__ref__.nComputations).toBe(1)
      expect(getUserFrom.__ref__.cache.size).toBe(1)

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
      expect(getUserTo.__ref__.nComputations).toBe(3)
      expect(getUserTo.__ref__.cache.size).toBe(2)
      expect(getUserFrom.__ref__.nComputations).toBe(2)
      expect(getUserFrom.__ref__.cache.size).toBe(1)
      expect(getJoinedNames.__ref__.nComputations).toBe(2)
      expect(getJoinedNames.__ref__.cache.size).toBe(2)
    })
  })

  describe('usage: refCounts', () => {
    test('it cleans the cache when all users unsubscribe', () => {
      let s = state
      let props

      const getSubscriptionsOneTwo = getJoinedNames.use()
      props = { from: 1, to: 2 }
      const oneTwoSubscriptions = getSubscriptionsOneTwo(s, props)
      const oneTwoUns = oneTwoSubscriptions.map(fn => fn())
      getJoinedNames(s, props)

      const getSubscriptionsOneThree = getJoinedNames.use()
      props = { from: 1, to: 3 }
      const oneThreeSubscriptions = getSubscriptionsOneThree(s, props)
      const oneThreeUns = oneThreeSubscriptions.map(fn => fn())
      getJoinedNames(s, props)

      const getSubscriptionsTwoFour = getJoinedNames.use()
      props = { from: 2, to: 4 }
      const twoFourSubscriptions = getSubscriptionsTwoFour(s, props)
      const twoFourUns = twoFourSubscriptions.map(fn => fn())
      getJoinedNames(s, props)

      s = {
        ...state,
        users: {
          ...state.users,
          newOne: {}
        }
      }

      const oneTwoSubscriptionsAgain = getSubscriptionsOneTwo(s, props)
      getJoinedNames(s, props)

      expect(oneTwoSubscriptionsAgain.length).toBe(oneTwoSubscriptions.length)
      oneTwoSubscriptionsAgain.forEach((s, idx) => {
        expect(s).toBe(oneTwoSubscriptions[idx])
      })

      expect(getJoinedNames.__ref__.cache.size).toBe(3)
      expect(getUserTo.__ref__.cache.size).toBe(3)
      expect(getUserFrom.__ref__.cache.size).toBe(2)

      oneTwoUns.forEach(fn => fn())
      expect(getJoinedNames.__ref__.cache.size).toBe(2)
      expect(getUserTo.__ref__.cache.size).toBe(2)
      expect(getUserFrom.__ref__.cache.size).toBe(2)

      oneThreeUns.forEach(fn => fn())
      expect(getJoinedNames.__ref__.cache.size).toBe(1)
      expect(getUserTo.__ref__.cache.size).toBe(1)
      expect(getUserFrom.__ref__.cache.size).toBe(1)

      twoFourUns.forEach(fn => fn())
      expect(getJoinedNames.__ref__.cache.size).toBe(0)
      expect(getUserTo.__ref__.cache.size).toBe(0)
      expect(getUserFrom.__ref__.cache.size).toBe(0)
    })
  })
})
