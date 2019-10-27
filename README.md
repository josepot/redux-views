# redux-views

Selector library designed for state management libraries (like Redux), with built-in support for shared selectors.

## Installation

```sh
yarn add redux-views
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

More often than not, we need to build selectors that take parameters, usually to identify a specific instance. Imagine we want to build a selector that returns the passengers of a specific car. If we write the selector in a plain function, we can get an idea of what we need, but it won't memoize the results:

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

`redux-views` can create instance selectors like this one, which will be memoized as well. It just needs to know which parameters does it depend on. For this reason, we can create an id selector:

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

TODO
