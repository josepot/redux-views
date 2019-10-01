import * as rslct from 'reselect';
import { fooSelector, barSelector } from './otherSelectors';

export const bazSelector = rslct.createSelector([fooSelector, barSelector], (foo, bar) => foo + bar);

