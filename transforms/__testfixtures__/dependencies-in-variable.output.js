import { createSelector } from 'reselect';

import { fooSelector, barSelector } from './otherSelectors';

const dependencies = [fooSelector, barSelector];

export const bazSelector = (() => {
  const dependencies2 = dependencies;
  const dependencies3 = dependencies2;
  return createSelector(dependencies3, (foo, bar) => foo + bar);
})();
