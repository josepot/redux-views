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

type ExtractSelectorsResult<
  T extends ReadonlyArray<
    Selector<unknown, unknown> | ParametricSelector<unknown, unknown, unknown>
  >
> = {
  [Index in keyof T]: T[Index] extends Selector<any, infer Result>
    ? Result
    : T[Index] extends ParametricSelector<any, any, infer Result>
    ? Result
    : never
}
type ExtractSelectorsInput<
  T extends ReadonlyArray<
    Selector<unknown, unknown> | ParametricSelector<unknown, unknown, unknown>
  >
> = {
  [Index in keyof T]: T[Index] extends Selector<infer Input, any>
    ? Input
    : T[Index] extends ParametricSelector<infer Input, any, any>
    ? Input
    : never
}
type ExtractSelectorsProps<
  T extends ReadonlyArray<ParametricSelector<unknown, unknown, unknown>>
> = {
  [Index in keyof T]: T[Index] extends ParametricSelector<any, infer Props, any>
    ? Props
    : never
}
type MergeTypes<T extends ReadonlyArray<unknown>, Acc = {}> = T extends [
  infer Front,
  ...(infer Tail)
]
  ? MergeTypes<Tail, Front & Acc>
  : Acc

type EqualityFn<T> = (a: T, b: T) => boolean
interface SelectorCreator {
  <
    T,
    S extends ReadonlyArray<Selector<any, any>>,
    Args extends ExtractSelectorsResult<S>
  >(
    selectors: [...S],
    combiner: (...results: Args) => T,
    equalityFn?: EqualityFn<T>
  ): OutputSelector<
    MergeTypes<ExtractSelectorsInput<S>>,
    T,
    (...results: Args) => T
  >

  <
    T,
    S extends ReadonlyArray<ParametricSelector<any, any, any>>,
    Args extends ExtractSelectorsResult<S>
  >(
    selectors: [...S],
    combiner: (...results: Args) => T,
    equalityFn?: EqualityFn<T>
  ): OutputParametricSelector<
    MergeTypes<ExtractSelectorsInput<S>>,
    MergeTypes<ExtractSelectorsProps<S>>,
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
