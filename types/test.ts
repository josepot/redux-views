import { createSelector } from 'redux-views';

// $ExpectType OutputSelector<{}, {}>
createSelector(
  state => state,
  state => state
);
