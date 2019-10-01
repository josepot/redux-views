const { createSelector: cSelector } = require('reselect');
const { fooSelector, barSelector } = require('./otherSelectors');

export const bazSelector = cSelector([fooSelector, barSelector], (foo, bar) => foo + bar);

