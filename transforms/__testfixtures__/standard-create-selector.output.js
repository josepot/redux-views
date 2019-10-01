import { createSelector as cSelector } from 'reselect';
import { fooSelector, barSelector } from './otherSelectors';

export const bazSelector = cSelector([fooSelector, barSelector], (foo, bar) => foo + bar);
