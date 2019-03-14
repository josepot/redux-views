# redux-views

Redux-Views aims to solve the problem with "[shared selectors](https://github.com/reduxjs/reselect#sharing-selectors-with-props-across-multiple-component-instances)" in a way that makes shared selectors easier to compose and to work with.

It solves the same problem that `re-reselect` tries to solve, but using a very different approach. Instead of
"enhancing" `reselect`, `redux-views` is an all-in-one solution that tries to make the experience of working
with shared selectors (almost) unnoticeable for the user.

The API of Redux-Views is almost identical to the API of `reselect`. Basically, it keeps `reselect`'s 2 high-level functions:
- `createSelector` has the exact same signature, but beheaves in a slightly different way.
- `createStructureSelector` is identical to the one provided by `reselect`, except that it only accepts the first argument. And again: it beheaves in a slightly different way.

On top of those 2 functions, Redux-Views adds 2 new functions: `createKeySelector` and `createKeyedSelectorFactory`, which are the ones responsible for the "slightly different behaviour".

Redux-Views also provides handy means for dealing with cache-invalidation. However, its approach differs quite substantially from the one taken by `re-reselect`. Redux-Views approach consists of keeping an internal ref-count of the usages of a cache, in order to automatically clean it when those values are no longer needed.

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
```

The only difference is that the second snipped uses `createKeySelector` in the declaration of `getPropId`.

What `createKeySelector` does is to inform Redux-Views that the results of the given selector are the keys that should be used for identifying the results of those selectors that depend on it. In other words, it lets Redux-Views know how to properly memoize the descendant selectors that are created with `createSelector` or `createStructuredSelector`.

For instance, consider this example:

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
```

Both `getUsers` and `getIsUserLoading` depend on the same "key-selector": `getPropId`. Redux-Views has a way to know that the results of those selectors should be cached taking that key into consideration. On the other hand `getuserInfo` depends on 2 different selectors that share the same "key-selector"; therefore `getUserInfo` will also use that same "key-selector" in order to cache its results. Lets see it:

```js
getUserInfo(state, {id: '1'})
getUserInfo(state, {id: '2'})

getUserInfo(state, {id: '1'})
getUserInfo(state, {id: '2'})

getUserInfo.recomputations() // => 2
getIsUserLoading.recomputations() // => 2
getUser.recomputations() // => 2
```

The state has not changed, and we have queried the same state using 2 different ids, that's why all the selectors have been computed only twice. Now, see what happens when we change the state in a way that does not affect the data of user "1" or user "2":

```js
const newState = {
  ...state,
  loadingUsers: { ...state.loadingUsers, '3': true }
}

getUserInfo(newState, {id: '1'})
getUserInfo(newState, {id: '2'})

getUserInfo.recomputations() // => 2
getIsUserLoading.recomputations() // => 2
getUser.recomputations() // => 2
```

Again, the same number of computations, because nothing relevant has changed, awesome!

Now let's try making a relevant change, the loading status of user "2":

```js
const newState = {
  ...state,
  loadingUsers: { ...state.loadingUsers, '2': true }
}

getUserInfo(newState, {id: '1'})
getUserInfo(newState, {id: '2'})

getUserInfo.recomputations() // => 3
getIsUserLoading.recomputations() // => 3
getUser.recomputations() // => 2
```

Notice how `getUserInfo` and `getIsUserLoading` has increased by one the number of recomputations, cool! However, `getUser` has not increased its recomputations, right? That's because the part of the state that's relevant to `getUser` has not changed!

I know what you must be thinking: what happens when a selector depends on more than one different "key selector"?

I'm glad that you asked. Let's try it:

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
```

In this example, `getUserA` and `getUserB` are different "key-selectors" and `getJoinedUsers` depends on both of them... So, what key is going to use `getJoinedUsers` in order to store the results? Redux-Views will infer that for you, and will internally create a new "key selector" that is the combination of those 2 keys. Let's see it in action:

```js
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

Awesome! Right?

So, what is that `createKeyedSelectorFactory` function for?

Again, good question! In the previous example `getUserA` and `getUserB` are querying the same data, but they don't know that, so each selector has its own cache... Which is totally fine. However, It would make sense to have the 2 of them share the same cache behind the scenes. That would save memory and a few pointless recomputations. That is what `createKeyedSelectorFactory` is for:

```js
const getUserSelectorFactory = createKeyedSelectorFactory(
  [getUsers],
  (users, id) => users[id]
)
const getUserA = getUserSelectorFactory((state, {idA}) => idA)
const getUserB = getUserSelectorFactory((state, {idB}) => idB)
```

If in the previous example we had defined `getUserA` and `getUserB` like in the snipped above, all selectors would have returned exactly the same data. However, there would have been a slightly difference when looking at the number of recomputations. They would look like this, instead:

```js
getUserComparisson.recomputations() // => 4
getUserA.recomputations() // => 2 (Yep, this is not a typo)
getUserB.recomputations() // => 2 (Yep, this is not a typo)
```

Why? Because both `getUserA` and `getUserB` are using the same cache. Let's go step by step and see what's happening. First we run: 

```js
getUserComparisson(state, {idA: '1', idB: '2'})
```
And now they have both been recomputed one time, but their shared cache has 2 different entries: one for `1` and another one for `2`. Then we ran the following:

```js
getUserComparisson(state, {idA: '3', idB: '4'})
```

And again, they both have been recomputed one more time. However, now their shared cache now has 4 different entries (`1`, `2`, `3` and `4`). So, what happens when we run the next `getUserComparisson`?

```js
getUserComparisson(state, {idA: '2', idB: '1'})
```

When `getUserA` checks the cache, it finds the entry for `2` and when `getUserB` checks the cache finds the entry for `1`, so they return those values and don't recalculate their compute function.

## Cache invalidation

Coming soon...

In the meanwhile lets just say that if you are brave enough to use these
selectors with [`react-redux-lean`](https://www.npmjs.com/package/react-redux-lean), then
the cache will be automatically cleaned when it is not being used. The reason being [this](https://github.com/josepot/react-redux-lean/blob/2ef56bc228613eaec9f129fa8a082d84b3b32bc4/src/useReduxState.js#L8-L11).
