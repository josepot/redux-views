# redux-views

Redux-Views aims to solve the problem with [shared selectors](https://github.com/reduxjs/reselect#sharing-selectors-with-props-across-multiple-component-instances) in a way that makes them easier to compose and to work with.

It solves the same problem that `re-reselect` tries to solve, but using a very different approach. Instead of
"enhancing" `reselect`, `redux-views` is an all-in-one solution that tries to make the experience of working
with shared selectors (almost) transparent for the user.

The API of Redux-Views is almost identical to the API of `reselect`. Basically, it keeps `reselect`'s 2 high-level functions:
- `createSelector` has the exact same signature.
- `createStructureSelector` is identical to the one provided by `reselect` except that it only accepts the first argument.

On top of those 2 functions, Redux-Views adds a new function: `createIdSelector`, which helps the library to identify those selectors that just return ids.

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
const getPropId = createIdSelector(({id}) => id)

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

The only difference is that the second snippet uses `createIdSelector` in the declaration of `getPropId`.

`createIdSelector` takes a function that:
- Receives all the parameters that are passed to the resulting selector __except for the state__
- Must return the ID of the instance that consumes the resulting selector.
And it returns a normal selector.

Using this enhancer for generating id-selectors allows Redux-Views to understand the usages of the selectors that depend on them. In other words, using `createIdSelector` for creating selectors that return ids allows Redux-Views to optimally memoize the other selectors.

For instance, consider this example:

```js
const getUsers = state => state.users
const getLoadingUsers = state => state.loadingUsers
const getPropId = createIdSelector(({id}) => id)

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

Both `getUsers` and `getIsUserLoading` depend on the same "id-selector": `getPropId`. Redux-Views has a way to know that the results of those selectors should be cached taking that id into account. On the other hand, `getuserInfo` depends on 2 different selectors that share the same "id-selector". Therefore, `getUserInfo` will also use that same id-selector in order to cache its results. Let's see it:

```js
getUserInfo(state, {id: '1'})
getUserInfo(state, {id: '2'})

getUserInfo(state, {id: '1'})
getUserInfo(state, {id: '2'})

getUserInfo.recomputations() // => 2
getIsUserLoading.recomputations() // => 2
getUser.recomputations() // => 2
```

The state has not changed and we have queried the same state using 2 different IDs. That is why all the selectors have been computed only twice. Now let's see what happens when we change the state in a way that does not affect the data of user "1" or user "2":

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

Notice how `getUserInfo` and `getIsUserLoading` have increased the number of recomputations, cool! However, the recomputations of `getUser` remain the same, right? That's because the part of the state that's relevant to `getUser` has not changed.

I know what you must be thinking: what happens when a selector depends on more than one different id-selector?

I'm glad that you asked. Let's try it:

```js
const getUsers = state => state.users

const getPropIdA = createIdSelector(({idA}) => idA)
const getPropIdB = createIdSelector(({idB}) => idB)

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

In this example, `getUserA` and `getUserB` have different id-selectors and `getJoinedUsers` depends on both of them. So, what id is going to use `getJoinedUsers` in order to cache its results? Redux-Views will infer that by creating a new id-selector that is the combination of those 2. Let's see it in action:

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

## Cache Invalidation

Just like `reselect` does, the selectors created with redux-views expose the following functions:
- `resultFunc`
- `recomputations`
- `resetRecomputations`

On top of those, shared-selectors also expose these functions:

- `idSelector`: the selector that is being used in order to calculate the id of the instance that is consuming the selector.
- `use`: a function that receives the id of the instance that is using it (the result of computing `idSelector`) and returns a function for unsubscribing.
- `clearCache`: if you don't want to handle cache-invalidation through ref-counts, you can manually clear the cache using this function. By default it recursively clears the cache and also the cache of its dependencies. If you do not want to clear the cache recursively, use false as the first (and only) argument.

In order to leverage the `use` function returned by shared-selectors, you have 2 options:

- Enhance the `connect` function of `react-redux`, something like this should do the job if are not using the `forwardRef` option:

```js
const customConnect = (selector, ...rest) => {
  const { idSelector, use } = selector || {}
  return Base => {
    const Component = connect(selector, ...rest)(Base);
    return props => {
      const id = useMemo(
        () => idSelector ? idSelector(null, props) : undefined,
        [idSelector, props]
      );
      useEffect(() => use && use(id), [use, id])
      return <Component {...props} />;
    }
  }
}
```

- Use [`react-redux-lean`](https://github.com/josepot/react-redux-lean) instead of `react-redux`.

## Credits to:
- [@voliva](https://github.com/voliva/): For helping with the definition of the API and for adding the typings.
