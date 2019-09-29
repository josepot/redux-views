// TypeScript Version: 3.0

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

/////////////////////////
/// createIdSelector ///
/////////////////////////

interface IdSelector<P> {
  (props: P, ...args: any[]): string
}

export function createIdSelector<P>(
  idSelector: IdSelector<P>
): ParametricSelector<{}, P, string>

//////////////////////
/// createSelector ///
//////////////////////

type EqualityFn<T> = (a: T, b: T) => boolean
interface SelectorCreator<TBase = any> {
  /* one selector */
  <S1, R1, T extends TBase>(
    selectors: [Selector<S1, R1>],
    combiner: (res1: R1) => T,
    equalityFn?: EqualityFn<T>
  ): OutputSelector<S1, T, (res1: R1) => T>

  <S1, P1, R1, T extends TBase>(
    selectors: [ParametricSelector<S1, P1, R1>],
    combiner: (res1: R1) => T,
    equalityFn?: EqualityFn<T>
  ): OutputParametricSelector<S1, P1, T, (res1: R1) => T>

  /* two selector */
  <S1, S2, R1, R2, T extends TBase>(
    selectors: [Selector<S1, R1>, Selector<S2, R2>],
    combiner: (res1: R1, res2: R2) => T,
    equalityFn?: EqualityFn<T>
  ): OutputSelector<S1 & S2, T, (res1: R1, res2: R2) => T>

  <S1, S2, P1, P2, R1, R2, T extends TBase>(
    selectors: [ParametricSelector<S1, P1, R1>, ParametricSelector<S2, P2, R2>],
    combiner: (res1: R1, res2: R2) => T,
    equalityFn?: EqualityFn<T>
  ): OutputParametricSelector<S1 & S2, P1 & P2, T, (res1: R1, res2: R2) => T>

  /* three selector */
  <S1, S2, S3, R1, R2, R3, T extends TBase>(
    selectors: [Selector<S1, R1>, Selector<S2, R2>, Selector<S3, R3>],
    combiner: (res1: R1, res2: R2, res3: R3) => T,
    equalityFn?: EqualityFn<T>
  ): OutputSelector<S1 & S2 & S3, T, (res1: R1, res2: R2, res3: R3) => T>

  <S1, S2, S3, P1, P2, P3, R1, R2, R3, T extends TBase>(
    selectors: [
      ParametricSelector<S1, P1, R1>,
      ParametricSelector<S2, P2, R2>,
      ParametricSelector<S3, P3, R3>
    ],
    combiner: (res1: R1, res2: R2, res3: R3) => T,
    equalityFn?: EqualityFn<T>
  ): OutputParametricSelector<
    S1 & S2 & S3,
    P1 & P2 & P3,
    T,
    (res1: R1, res2: R2, res3: R3) => T
  >

  /* any number of uniform selectors */
  <S, R, T extends TBase>(
    selectors: Selector<S, R>[],
    combiner: (...res: R[]) => T,
    equalityFn?: EqualityFn<T>
  ): OutputSelector<S, T, (...res: R[]) => T>
  <S, P, R, T extends TBase>(
    selectors: ParametricSelector<S, P, R>[],
    combiner: (...res: R[]) => T,
    equalityFn?: EqualityFn<T>
  ): OutputParametricSelector<S, P, T, (...res: R[]) => T>
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
