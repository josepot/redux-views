export { createSelector, createStructuredSelector } from './createSelector'
export { createKeySelector } from './keySelector'
export { default as createMapSelector } from './mapSelector'
export const isInstanceSelector = sel => sel.keySelector && sel.use
