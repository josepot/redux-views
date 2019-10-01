const rslct = require('reselect');
const { fooSelector, barSelector } = require('./otherSelectors');

export const bazSelector = rslct.createSelector(
  fooSelector, barSelector,
  (foo, bar) => foo + bar
);

