export { createSelector, createStructuredSelector } from './createSelector'
export { createIdSelector } from './idSelector'
export { default as createMapSelector } from './mapSelector'
export const isInstanceSelector = sel => sel.idSelector && sel.use
