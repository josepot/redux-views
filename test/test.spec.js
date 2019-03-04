import createSelector from '../src'
const prop = key => state => state[key]

const state = {
  messages: {
    1: { id: 1, text: 'foo1' },
    2: { id: 2, text: 'foo2' },
    3: { id: 3, text: 'foo2' },
    4: { id: 4, text: 'foo3' },
    5: { id: 5, text: 'foo4' },
    6: { id: 6, text: 'foo5' },
    7: { id: 7, text: 'foo6' },
    8: { id: 8, text: 'foo7' },
    9: { id: 9, text: 'foo8' }
  },
  users: {
    foo: { id: 'foo', name: 'foo' },
    bar: { id: 'bar', name: 'bar' }
  },
  usersMessages: {
    foo: [1, 2, 3, 4, 5],
    bar: [6, 7, 8, 9]
  }
}

const messagesSelector = prop('messages')
const usersSelector = prop('users')
const usersMessagesSelector = prop('usersMessages')

const getUserKey = (state, { userId }) => userId

const messageKeysPerUser = createSelector(
  [usersMessagesSelector, getUserKey],
  (usersMessages, key) => usersMessages[key],
  getUserKey
)

const nMessagesPerUser = createSelector(
  [messageKeysPerUser],
  x => (x ? x.length : 0),
  getUserKey
)

describe('test', () => {
  test('test', () => {
    const getFooSubscriptions = nMessagesPerUser.use()
    const getFooSubscriptions2 = nMessagesPerUser.use()
    const getBarSubscriptions = nMessagesPerUser.use()

    const fooProps = { userId: 'foo' }
    const fooFns = getFooSubscriptions(state, fooProps)
    const fooFns2 = getFooSubscriptions2(state, fooProps)
    const fooUnsubscriptions = fooFns.map(f => f())
    const fooUnsubscriptions2 = fooFns2.map(f => f())
    const fooMessages = nMessagesPerUser(state, fooProps)
    expect(fooMessages).toEqual(5)
    expect(nMessagesPerUser.__ref__.usages.get('foo')).toEqual(2)

    const barProps = { userId: 'bar' }
    const barFns = getBarSubscriptions(state, barProps)
    const barUnsubscriptions = barFns.map(f => f())
    const barMessages = nMessagesPerUser(state, barProps)
    expect(barMessages).toEqual(4)

    expect(nMessagesPerUser.__ref__.data.size).toEqual(2)

    fooUnsubscriptions.forEach(fn => fn())
    expect(nMessagesPerUser.__ref__.data.size).toEqual(2)

    fooUnsubscriptions2.forEach(fn => fn())
    expect(nMessagesPerUser.__ref__.data.size).toEqual(1)

    barUnsubscriptions.forEach(fn => fn())
    expect(nMessagesPerUser.__ref__.data.size).toEqual(0)
  })
})
