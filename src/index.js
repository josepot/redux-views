export { default as createSelector } from './createSelector'
export { default as createStructuredSelector } from './createStructuredSelector'
export { default as createCollectionSelector } from './createCollectionSelector'
export { default as createIdSelector } from './createIdSelector'
export const isInstanceSelector = sel => sel.idSelector && sel.use
