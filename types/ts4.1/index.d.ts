// TypeScript Version: 4.1

export type Selector<S, R> = (state: S) => R
export type ParametricSelector<S, P, R> = (
  state: S,
  props: P,
  ...args: any[]
) => R

interface OutputProps<C> {
  resultFunc: C
  recomputations: () => number
  resetRecomputations: () => number
}

export type OutputSelector<S, R, C> = Selector<S, R> & OutputProps<C>
export type OutputParametricSelector<S, P, R, C> = ParametricSelector<S, P, R> &
  OutputProps<C>

////////////////////////
/// createIdSelector ///
////////////////////////

interface IdSelector<P> {
  (props: P, ...args: any[]): string
}

export function createIdSelector<P>(
  idSelector: IdSelector<P>
): ParametricSelector<{}, P, string>

//////////////////////
/// createSelector ///
//////////////////////

type ExtractSelectorResult<
  T extends ReadonlyArray<Selector<unknown, unknown>>
> = {
  [Index in keyof T]: T[Index] extends Selector<any, infer R> ? R : never
}
type ExtractSelectorInput<
  T extends ReadonlyArray<Selector<unknown, unknown>>
> = {
  [Index in keyof T]: T[Index] extends Selector<infer I, any> ? I : never
}
type MergeTypes<T extends ReadonlyArray<unknown>> = T extends [
  infer F,
  ...(infer R)
]
  ? F & MergeTypes<R>
  : {}

type ExtractParametricSelectorResult<
  T extends ReadonlyArray<ParametricSelector<unknown, unknown, unknown>>
> = {
  [Index in keyof T]: T[Index] extends ParametricSelector<any, any, infer R>
    ? R
    : never
}
type ExtractParametricSelectorProps<
  T extends ReadonlyArray<ParametricSelector<unknown, unknown, unknown>>
> = {
  [Index in keyof T]: T[Index] extends ParametricSelector<any, infer P, any>
    ? P
    : never
}
type ExtractParametricSelectorInput<
  T extends ReadonlyArray<ParametricSelector<unknown, unknown, unknown>>
> = {
  [Index in keyof T]: T[Index] extends ParametricSelector<infer I, any, any>
    ? I
    : never
}

type EqualityFn<T> = (a: T, b: T) => boolean
interface SelectorCreator {
  <
    T,
    S extends ReadonlyArray<Selector<any, any>>,
    Args extends ExtractSelectorResult<S>
  >(
    selectors: [...S],
    combiner: (...results: Args) => T,
    equalityFn?: EqualityFn<T>
  ): OutputSelector<
    MergeTypes<ExtractSelectorInput<S>>,
    T,
    (...results: Args) => T
  >

  <
    T,
    S extends ReadonlyArray<ParametricSelector<any, any, any>>,
    Args extends ExtractParametricSelectorResult<S>
  >(
    selectors: [...S],
    combiner: (...results: Args) => T,
    equalityFn?: EqualityFn<T>
  ): OutputParametricSelector<
    MergeTypes<ExtractParametricSelectorInput<S>>,
    MergeTypes<ExtractParametricSelectorProps<S>>,
    T,
    (...results: Args) => T
  >
}

export {}

export const createSelector: SelectorCreator

////////////////////////////////
/// createStructuredSelector ///
////////////////////////////////

export function createStructuredSelector<S, T>(
  selectors: { [K in keyof T]: Selector<S, T[K]> }
): OutputSelector<S, T, never>

export function createStructuredSelector<S, P, T>(
  selectors: { [K in keyof T]: ParametricSelector<S, P, T[K]> }
): OutputParametricSelector<S, P, T, never>
