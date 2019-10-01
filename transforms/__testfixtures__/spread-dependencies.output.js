import { createSelector } from 'reselect';
import { fooSelector, barSelector } from './otherSelectors';

const dependencies = [fooSelector, barSelector];

export const bazSelector = (() => {
  const dependencies2 = dependencies;
  return createSelector(
    [...dependencies, ...dependencies2],
    (foo, bar, foo2, bar2) => foo + bar + foo2 + bar2
  );
})();

export const bazzSelector = (() => {
  return createSelector(dependencies, (foo, bar) => foo + bar);
})();
