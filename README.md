# redux-views

Redux-Views aims to solve the problem with [shared selectors](https://github.com/reduxjs/reselect#sharing-selectors-with-props-across-multiple-component-instances) in a way that makes them easier to compose and to work with.

It solves the same problem that `re-reselect` tries to solve, but using a very different approach. Instead of
"enhancing" `reselect`, `redux-views` is an all-in-one solution that tries to make the experience of working
with shared selectors (almost) transparent for the user.

The API of Redux-Views is almost identical to the API of `reselect`. Basically, it keeps `reselect`'s 2 high-level functions:
- `createSelector` has the exact same signature.
- `createStructureSelector` is identical to the one provided by `reselect`, except that it only accepts the first argument.

On top of those 2 functions, Redux-Views adds 2 new functions: `createKeySelector` and `createKeyedSelectorFactory`, which help the library to identify those selectors that just return ids.

Redux-Views also provides handy means for dealing with cache-invalidation. Its approach differs quite substantially from the one taken by `re-reselect`. Redux-Views prefferred approach consists of keeping an internal ref-count of the usages of a cache, in order to automatically clean it when those values are no longer needed.

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

Both `getUsers` and `getIsUserLoading` depend on the same "key-selector": `getPropId`. Redux-Views has a way to know that the results of those selectors should be cached taking that key into account. On the other hand, `getuserInfo` depends on 2 different selectors that share the same "key-selector"; therefore `getUserInfo` will also use that same key-selector in order to cache its results. Lets see it:

```js
getUserInfo(state, {id: '1'})
getUserInfo(state, {id: '2'})

getUserInfo(state, {id: '1'})
getUserInfo(state, {id: '2'})

getUserInfo.recomputations() // => 2
getIsUserLoading.recomputations() // => 2
getUser.recomputations() // => 2
```

The state has not changed, and we have queried the same state using 2 different ids, that is why all the selectors have been computed only twice. Now, let us see what happens when we change the state in a way that does not affect the data of user "1" or user "2":

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

Now let us try making a relevant change, the loading status of user "2":

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

Notice how `getUserInfo` and `getIsUserLoading` have increased the number of recomputations, cool! However, the recomputations of `getUser` remain the same, right? That is because the part of the state that is relevant to `getUser` has not changed.

I know what you must be thinking: what happens when a selector depends on more than one different key-selector?

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

In this example, `getUserA` and `getUserB` have different key-selectors and `getJoinedUsers` depends on both of them. So, what key is going to use `getJoinedUsers` in order to cache its results? Redux-Views will infer that, by creating a new key-selector that is the combination of those 2. Let's see it in action:

```js
getJoinedUsers(state, {idA: '1', idB: '2'})
getJoinedUsers(state, {idA: '3', idB: '4'})
getJoinedUsers(state, {idA: '2', idB: '1'})
getJoinedUsers(state, {idA: '4', idB: '3'})

getJoinedUsers(state, {idA: '1', idB: '2'})
getJoinedUsers(state, {idA: '3', idB: '4'})
getJoinedUsers(state, {idA: '2', idB: '1'})
getJoinedUsers(state, {idA: '4', idB: '3'})

getJoinedUsers.recomputations() // => 4
getUserA.recomputations() // => 4
getUserB.recomputations() // => 4
```

Awesome! Right?

So, what is that `createKeyedSelectorFactory` function for?

Great question!

In the previous example `getUserA` and `getUserB` are querying the same data, but they don't know that. Therefore, each selector has its own cache. Which is totally fine. However, It could make sense to have the 2 of them share the same cache. That would save us memory and a few pointless recomputations. That is what `createKeyedSelectorFactory` is for:

```js
const getUserSelectorFactory = createKeyedSelectorFactory(
  [getUsers],
  (users, id) => users[id]
)
const getUserA = getUserSelectorFactory((state, {idA}) => idA)
const getUserB = getUserSelectorFactory((state, {idB}) => idB)
```

If in the previous example we had defined `getUserA` and `getUserB` like in the snipped above, then everything would have beheaved exactly the same. However, we would have noticed a small difference in the number of recomputations:

```js
getJoinedUsers.recomputations() // => 4
getUserA.recomputations() // => 2 (Yep, this is not a typo)
getUserB.recomputations() // => 2 (Yep, this is not a typo)
```

Why? Because both `getUserA` and `getUserB` are sharing the same cache object. Let's analize it in slow motion. First we run: 

```js
getJoinedUsers(state, {idA: '1', idB: '2'})
```
The cache was empty before, so neither `getUserA` nor `getUserB` found anything in the cache and they both got computed. After they got computed, though, they saved their results in their shared cache, so now that cache has 2 entries: `1` and `2`. Next line:

```js
getJoinedUsers(state, {idA: '3', idB: '4'})
```

They both have been computed again because there were no entries for `3` and `4`. However, that shared cache has now 4 different entries (`1`, `2`, `3` and `4`). So, what happens when we run the next `getJoinedUsers`?

```js
getJoinedUsers(state, {idA: '2', idB: '1'})
```

When `getUserA` checks the cache, it finds the entry for `2` and when `getUserB` checks the cache finds the entry for `1`, so they return those values and don't evaluate their compute function.

## Cache invalidation

Just like reselect does, the selectors created with redux-views expose the following functions:
- `resultFunc`
- `recomputations`
- `resetRecomputations`

On top of those, shared-selectors also expose the these functions:

- `keySelector`: the selector that is being used in order to calculate the key of the instance that is consuming the selector.
- `use`: a function that returns a tuple with 2 functions: 
  - The selector to be consumed if you want redux-views to keep track of the ref-count usages of its cache.
  - An function for unsubscribing. Any time that use returns a different tuple, the previous unsubscribe function should be invoked. Also, the latest one should be invoked on componentWillUnmount 
- `clearCache`: if you don't want to handle cache-invalidation through ref-counts, you can manually clear the cache using this function. By default it recursively clears the cache of the also the cache of its dependencies. If you do not want to clear the cache recursively, use false as the first (and only) argument.

In order to leverage the `use` function returned by shared-selectors, you have 2 options:

- Enhance the `connect` function of `react-redux`, something more or less like this:

```js
const customConnect = (selector, ...rest) => Base => props => {
  const [usableSelector, unsubscribe] = useMemo(
    () => (selector && selector.use
      ? selector.use()
      : [selector, Function.prototype]),
    [selector]
  )
  useEffect(() => unsubscribe, [unsubscribe])
  const Component = useMemo(
    () => connect(usableSelector, ...rest)(Base),
    [selector, Base]
  )
  return <Component {...props} />
}
```

- Use [`react-redux-lean`](https://github.com/josepot/react-redux-lean) instead of `react-redux`.
