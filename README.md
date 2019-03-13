# redux-views

Redux-Views aims to solve the problem with "instance-selectors" in a way that's transparent to the user.
Making the resulting selectors easier to compose and to work with.

It solves the same problem that `re-reselect` tries to solve, but using a very different approach. Instead of
"enhancing" `reselect`, `redux-views` is an all-in-one solution that tries to make the experience of working
with instance-selectors (almost) invisible for the user.

Its API is a subset of `reselect`'s API, keeping the 2 high-level functions:
- `createSelector` has the exact same signature
- `createStructureSelector` is identical to the one provided by `reselect`, except that it only accepts the first argument.

On top of those 2 functions, Redux-Views adds 2 new functions: `createKeySelector` and `createKeyedSelectorFactory`.

Redux-Views also comes with tooling for cache-invalidation. However, its approach differs quite substantially from the
one taken by `re-reselect`. Redux-Views approach consists of internally keeping a ref-count of the usages of cache in order
to automatically clean it when its values are no longer needed.

## The problem with reselect

```js
const getUsers = state => state.users
const getPropId = (state, {id}) => id

const getUser = createSelector(
  [getUsers, getPropId],
  (users, id) => users[id]
)

getUser(state, {id: '1'})
getUser(state, {id: '2'})

getUser(state, {id: '1'})
getUser(state, {id: '2'})

getUser.recomputations() // => 4
```

## Redux-Views solution

```js
const getUsers = state => state.users

// `createKeySelector` let's redux-views know that any selector that
// directly or indirectly depends on it must keep a cache for the resulting key
const getPropId = createKeySelector((state, {id}) => id)

const getUser = createSelector(
  [getUsers, getPropId],
  (users, id) => users[id]
)

getUser(state, {id: '1'})
getUser(state, {id: '2'})

getUser(state, {id: '1'})
getUser(state, {id: '2'})

getUser.recomputations() // => 2

let newState = {
  ...state,
  users: {
    ...state.users,
    '3': {id: 3, name: 'test3'}
  }
}

getUser(newState, {id: '1'})
getUser(newState, {id: '2'})

getUser.recomputations() // => 2

const user2Updated = {id: '2', name: 'test2'}
newState = {
  ...state,
  users: { ...state.users, '2': user2Updated }
}

getUser(newState, {id: '1'})
getUser(newState, {id: '2'}) === user2Updated // => true

getUser.recomputations() // => 3
```

Even better:

```js
const getUsers = state => state.users
const getLoadingUsers = state => state.loadingUsers
const getPropId = createKeySelector((state, {id}) => id)

const getUser = createSelector(
  [getUsers, getPropId],
  (users, id) => users[id]
)

const getIsUserLoading = createSelector(
  [getLoadingUsers, getPropId],
  (loadingUsers, id) => Boolean(loadingUsers[id])
)

const getUserInfo = createStructuredSelector({
  user: getUser,
  isLoading: getIsUserLoading,
})

getUserInfo(state, {id: '1'})
getUserInfo(state, {id: '2'})

getUserInfo(state, {id: '1'})
getUserInfo(state, {id: '2'})

getUserInfo.recomputations() // => 2
getIsUserLoading.recomputations() // => 2
getUser.recomputations() // => 2


const newState = {
  ...state,
  loadingUsers: { ...state.loadingUsers, '2': true }
}

getUserInfo(state, {id: '1'})
getUserInfo(state, {id: '2'})

getUserInfo.recomputations() // => 3
getIsUserLoading.recomputations() // => 3
getUser.recomputations() // => 2 (this part of the state has not changed)
```

But wait, there is more :-)

```js
const getUsers = state => state.users

const getPropIdA = createKeySelector((state, {idA}) => idA)
const getPropIdB = createKeySelector((state, {idB}) => idB)

const userById = (users, id) => users[id]
const getUserA = createSelector([getUsers, getPropIdA], userById)
const getUserB = createSelector([getUsers, getPropIdB], userById)

const getJoinedUsers = createSelector(
  [getUserA, getUserB],
  (userA, userB) => {
    // => Some expensive operation in order to join 2 users
  }
)

getUserComparisson(state, {idA: '1', idB: '2'})
getUserComparisson(state, {idA: '3', idB: '4'})
getUserComparisson(state, {idA: '2', idB: '1'})
getUserComparisson(state, {idA: '4', idB: '3'})

getUserComparisson(state, {idA: '1', idB: '2'})
getUserComparisson(state, {idA: '3', idB: '4'})
getUserComparisson(state, {idA: '2', idB: '1'})
getUserComparisson(state, {idA: '4', idB: '3'})

getUserComparisson.recomputations() // => 4
getUserA.recomputations() // => 4
getUserB.recomputations() // => 4
```

In the previous example `getUserA` and `getUserB` are querying the same data,
but they don't know that, so each selector has its own cache... Which is fine. However, It would make
sense to have the 2 of them share the same cache behind the scenes, in order to save memory and pointless recomputations.
That is what `createKeyedSelectorFactory` is for:

```js
const getUserSelectorFactory = createKeyedSelectorFactory(
  [getUsers],
  (users, id) => users[id]
)
const getUserA = getUserSelectorFactory((state, {idA}) => idA)
const getUserB = getUserSelectorFactory((state, {idB}) => idB)
```

If we defined `getUserA` and `getUserB` like in the snipped above, and then we used the same
code as in the previous example: everything would behave exactly the same. However,
we would find a small difference when looking at the `recomputations`:

```js
getUserComparisson.recomputations() // => 4
getUserA.recomputations() // => 2 (Yep, this is not a typo)
getUserB.recomputations() // => 2 (Yep, this is not a typo)
```

## Cache invalidation

Coming soon...

In the meanwhile lets just say that if you are brave enough to use these
selectors with [`react-redux-lean`](https://www.npmjs.com/package/react-redux-lean), then
the cache will be automatically cleaned when it is not being used. The reason being [this](https://github.com/josepot/react-redux-lean/blob/2ef56bc228613eaec9f129fa8a082d84b3b32bc4/src/useReduxState.js#L8-L11).
