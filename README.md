# redux-views

Selector library designed for state management libraries (like Redux), with built-in support for shared selectors.

## Installation

```sh
npm install --save redux-views
```

## Simple usage

Selectors are functions that compute derived data given a state, allowing that state to contain less redundant data.

```js
import { createSelector } from 'redux-views';

const getAllCars = state => state.cars;

const getRunningCars = createSelector(
  [getAllCars],
  cars => cars.filter(car => car.isRunning)
);
```

All selectors created by redux-views are memoized: This means that if you call a selector multiple times with the same state and parameters, you'll always get the same result, without running the computation again.

```js
const activeCars1 = getRunningCars(myState);
const activeCars2 = getRunningCars(myState);

assert(activeCars1 === activeCars2);
assert(getRunningCars.recomputations() === 1);
```

## Parametric selectors

Sometimes we need to build selectors that take parameters, usually to identify a specific instance. Consider the following selector which returns the passengers of a specific car:

```js
const getRunningCarPassengers = (state, props) => {
  const { carId } = props;

  const runningCars = getRunningCars(state);
  const passengers = getPassengers(state);

  const car = runningCars
    .find(car => car.id === carId);

  return car.passengerIds
    .map(id => passengers[id]);
}

const passengersCar1_0 = getRunningCarPassengers(state, { carId: 1 });
const passengersCar2 = getRunningCarPassengers(state, { carId: 2 });
const passengersCar1_1 = getRunningCarPassengers(state, { carId: 1 });

assert(passengersCar1_0 !== passengersCar1_1);
// getRunningCarPassengers recomputed 3 times
```

As you can imagine, the `getRunningCarPassengers` function is not memoized and it will re-evaluate every time that it's called.

With `redux-views` we can create instance selectors like this one, which will be automatically memoized. It just needs to know which parameters does it depend on. For this reason, we can create an id selector:

```js
import { createIdSelector } from 'redux-views';

const getCarIdProp = createIdSelector(props => props.carId);
const getRunningCar = createSelector(
  [
    getRunningCars,
    getCarIdProp
  ],
  (cars, carId) => cars.find(car => car.id === carId)
);
const getRunningCarPassengers = createSelector(
  [
    getRunningCar,
    getPassengers
  ],
  (car, passengers) => car.passengerIds.map(id => passengers[id])
);

const passengersCar1_0 = getRunningCarPassengers(state, { carId: 1 }); // computes
const passengersCar2 = getRunningCarPassengers(state, { carId: 2 }); // computes
const passengersCar1_1 = getRunningCarPassengers(state, { carId: 1 }); // cached

assert(passengersCar1_0 === passengersCar1_1);
assert(getRunningCars.recomputations() === 2);
```

This way, `redux-views` knows that `getRunningCarPassengers` will probably give different results for each `carId`, effectively allowing it to memoize the value for each one.

It's good to know that, by default, `redux-views` will keep those memoized values for as long as the application runs. However, it provides two ways of clearing the cache, either manually or with a ref count which automatically clears the cache when the selector is not used anymore. This is something internal and rarely used for individual projects, as it's meant for bindings with state management libraries.

If you're using a binding that supports ref count, you most likely don't need to worry about invalidating the cache.

## Migrating from reselect@4.0

This version of `redux-views` removes the variadic overload of `createSelector` from `reselect@4.0`, which means that all calls that were using this overload will need to be changed. For example:

```js
createSelector(
  getRunningCars,
  getPassengers,
  (cars, passengers) => ...
);
```

becomes

```js
createSelector(
  [
    getRunningCars,
    getPassengers,
  ],
  (cars, passengers) => ...
);
```

That's the only breaking change for the simple usage. `redux-views` passes all the tests from `reselect@4.0`. There's a codemod in the works that will allow to replace all of these automatically.

Now, to make use of the built-in memoization in parametric selectors it will need extra work, but basically you'll need to find all of the selectors that use props, and replace them with a `createIdSelector`. Possible examples:

```js
createSelector(
  getRunningCars,
  (_, props) => props.carId,
  (cars, carId) => cars[props.carId]
);
```

becomes

```js
const getCarIdProp = createIdSelector(props => props.carId);

createSelector(
  getRunningCars,
  getCarIdProp,
  (cars, carId) => cars[props.carId]
);
```

This will allow you to get rid of all selector creators (`reselect@4.0`'s solution for memoizing shared parametric selectors)

## Migrating from re-reselect

`re-reselect` has a very similar concept to `redux-views`, but you had to define a "keySelector" for every parametric selector you needed. So grabbing the example from their doc:

```js
const getUsers = state => state.users;
const getLibraryId = (state, libraryName) => state.libraries[libraryName].id;

const getUsersByLibrary = createCachedSelector(
  // inputSelectors
  getUsers,
  getLibraryId,

  // resultFunc
  (users, libraryId) => expensiveComputation(users, libraryId),
)(
  // re-reselect keySelector (receives selectors' arguments)
  // Use "libraryName" as cacheKey
  (_state_, libraryName) => libraryName
);
```

Now becomes

```js
const getUsers = state => state.users;
const getLibraryName = createIdSelector(libraryName => libraryName);
const getLibraryId = createSelector(
  [
    state => state.libraries,
    getLibraryName,
  ],
  (libraries, libraryName) => libraries[libraryName].id
);

const getUsersByLibrary = createSelector(
  [
    getUsers,
    getLibraryId,
  ],
  (users, libraryId) => expensiveComputation(users, libraryId),
);
```

And we don't need to define any keySelector for every other selector we want to create that hangs from this one.

## API

### createSelector

```ts
function createSelector<T, R>(
  selectors: Array<Selector<R>>,
  combiner: (...res: Array<R>) => T,
  equalityFn?: (a: T, b: T) => boolean
): Selector<T>;
```

Creates a new selector by combining other selectors. Parameters:

* selectors: List of input selectors
* combiner: Computing function. Receives through arguments the result of the input selectors (in the same order as they are defined)
* equalityFn: Optional function that checks whether two values returned by `combiner` are equal. Defaults to strict equality (`===`).

### createIdSelector

```ts
function createIdSelector(
  idSelector: (...props: Array) => string
): Selector<string>;
```

Creates a selector from props. Parameters:

* idSelector: Function that should return a string representing the id.

### createStructuredSelector

```ts
export function createStructuredSelector<T>(
  selectors: Dictionary<Selector<T>>
): Selector<Dictionary<T>>
```

Convenience function that creates a selector by combining them in an object. Example:

```ts
const getDataA = createSelector(...);
const getDataB = createSelector(...);

createStructuredSelector({
  a: getDataA,
  b: getDataB
});

// Is the same as

createSelector(
  [
    getDataA,
    getDataB
  ],
  (a, b) => ({
    a,
    b
  }),
  shallowCompare
);
```

## Internal API

> This API is only meant when building bindings of this library for state management ones (like Redux), for internal testing, or for low-level access to the internal cache. Normal usage of this library in individual projects shouldn't need any of these.

Every selector created by `redux-views` has the following properties:

* recomputations: Function that returns the number of computations performed by this selector.
* resetRecomputations: Function that clears the number of computations.
* dependencies: Original list of dependencies.
* resultFunc: Original combiner function.

Additionally, those selectors that have a selector created by `createIdSelector` in their dependency chain, will have:

* idSelector: Function that returns the id for an instance.
* use: Function that adds a usage to the ref count for a given instance.
* clearCache: Function that immediately clears the cache.

The most important function is `use`. It has the following signature:

```ts
function use(
  id: string
): () => void;
```

What this function does is mark that the value computed for the instance `id` is in use through a ref count.

The function returned by `use` is the clean-up function, and when the ref count reaches 0, the value whose idSelector returns that `id` is removed from the cache.

Typically, for every instance of a component, you want to grab the `id` of that instance by using the `idSelector` function and call `use` with it. Then, every time that `id` changes, call the clean-up function and call `use` again with the new id.

This API makes is very easy to integrate with React. For instance, we could easily create a hook like `usePropsSelector` that uses the `useSelector` hook from `react-redux`: 

```js
const usePropsSelector = (selector, props) => {
  const id = selector.idSelector && selector.idSelector(null, props);
  useEffect(() => selector.use && selector.use(id), [selector, id]);

  return useSelector(x => selector(x, props));
};
```
