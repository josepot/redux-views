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

type EqualityFn<T> = (a: T, b: T) => boolean
interface SelectorCreator {
  /* one selector */
  <S1, R1, T>(
    selectors: [Selector<S1, R1>],
    combiner: (res1: R1) => T,
    equalityFn?: EqualityFn<T>
  ): OutputSelector<S1, T, (res1: R1) => T>

  <S1, P1, R1, T>(
    selectors: [ParametricSelector<S1, P1, R1>],
    combiner: (res1: R1) => T,
    equalityFn?: EqualityFn<T>
  ): OutputParametricSelector<S1, P1, T, (res1: R1) => T>

  /* two selector */
  <S1, S2, R1, R2, T>(
    selectors: [Selector<S1, R1>, Selector<S2, R2>],
    combiner: (res1: R1, res2: R2) => T,
    equalityFn?: EqualityFn<T>
  ): OutputSelector<S1 & S2, T, (res1: R1, res2: R2) => T>

  <S1, S2, P1, P2, R1, R2, T>(
    selectors: [ParametricSelector<S1, P1, R1>, ParametricSelector<S2, P2, R2>],
    combiner: (res1: R1, res2: R2) => T,
    equalityFn?: EqualityFn<T>
  ): OutputParametricSelector<S1 & S2, P1 & P2, T, (res1: R1, res2: R2) => T>

  /* three selector */
  <S1, S2, S3, R1, R2, R3, T>(
    selectors: [Selector<S1, R1>, Selector<S2, R2>, Selector<S3, R3>],
    combiner: (res1: R1, res2: R2, res3: R3) => T,
    equalityFn?: EqualityFn<T>
  ): OutputSelector<S1 & S2 & S3, T, (res1: R1, res2: R2, res3: R3) => T>

  <S1, S2, S3, P1, P2, P3, R1, R2, R3, T>(
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

  /* four selector */
  <S1, S2, S3, S4, R1, R2, R3, R4, T>(
    selectors: [
      Selector<S1, R1>,
      Selector<S2, R2>,
      Selector<S3, R3>,
      Selector<S4, R4>
    ],
    combiner: (res1: R1, res2: R2, res3: R3, res4: R4) => T
  ): OutputSelector<
    S1 & S2 & S3 & S4,
    T,
    (res1: R1, res2: R2, res3: R3, res4: R4) => T
  >

  <S1, S2, S3, S4, P1, P2, P3, P4, R1, R2, R3, R4, T>(
    selectors: [
      ParametricSelector<S1, P1, R1>,
      ParametricSelector<S2, P2, R2>,
      ParametricSelector<S3, P3, R3>,
      ParametricSelector<S4, P4, R4>
    ],
    combiner: (res1: R1, res2: R2, res3: R3, res4: R4) => T
  ): OutputParametricSelector<
    S1 & S2 & S3 & S4,
    P1 & P2 & P3 & P4,
    T,
    (res1: R1, res2: R2, res3: R3, res4: R4) => T
  >

  /* five selector */
  <S1, S2, S3, S4, S5, R1, R2, R3, R4, R5, T>(
    selectors: [
      Selector<S1, R1>,
      Selector<S2, R2>,
      Selector<S3, R3>,
      Selector<S4, R4>,
      Selector<S5, R5>
    ],
    combiner: (res1: R1, res2: R2, res3: R3, res4: R4, res5: R5) => T
  ): OutputSelector<
    S1 & S2 & S3 & S4 & S5,
    T,
    (res1: R1, res2: R2, res3: R3, res4: R4, res5: R5) => T
  >

  <S1, S2, S3, S4, S5, P1, P2, P3, P4, P5, R1, R2, R3, R4, R5, T>(
    selectors: [
      ParametricSelector<S1, P1, R1>,
      ParametricSelector<S2, P2, R2>,
      ParametricSelector<S3, P3, R3>,
      ParametricSelector<S4, P4, R4>,
      ParametricSelector<S5, P5, R5>
    ],
    combiner: (res1: R1, res2: R2, res3: R3, res4: R4, res5: R5) => T
  ): OutputParametricSelector<
    S1 & S2 & S3 & S4 & S5,
    P1 & P2 & P3 & P4 & P5,
    T,
    (res1: R1, res2: R2, res3: R3, res4: R4, res5: R5) => T
  >

  /* six selector */
  <S1, S2, S3, S4, S5, S6, R1, R2, R3, R4, R5, R6, T>(
    selectors: [
      Selector<S1, R1>,
      Selector<S2, R2>,
      Selector<S3, R3>,
      Selector<S4, R4>,
      Selector<S5, R5>,
      Selector<S6, R6>
    ],
    combiner: (res1: R1, res2: R2, res3: R3, res4: R4, res5: R5, res6: R6) => T
  ): OutputSelector<
    S1 & S2 & S3 & S4 & S5 & S6,
    T,
    (res1: R1, res2: R2, res3: R3, res4: R4, res5: R5, res6: R6) => T
  >

  <S1, S2, S3, S4, S5, S6, P1, P2, P3, P4, P5, P6, R1, R2, R3, R4, R5, R6, T>(
    selectors: [
      ParametricSelector<S1, P1, R1>,
      ParametricSelector<S2, P2, R2>,
      ParametricSelector<S3, P3, R3>,
      ParametricSelector<S4, P4, R4>,
      ParametricSelector<S5, P5, R5>,
      ParametricSelector<S6, P6, R6>
    ],
    combiner: (res1: R1, res2: R2, res3: R3, res4: R4, res5: R5, res6: R6) => T
  ): OutputParametricSelector<
    S1 & S2 & S3 & S4 & S5 & S6,
    P1 & P2 & P3 & P4 & P5 & P6,
    T,
    (res1: R1, res2: R2, res3: R3, res4: R4, res5: R5, res6: R6) => T
  >

  /* any number of uniform selectors */
  <S, R, T>(
    selectors: Selector<S, R>[],
    combiner: (...res: R[]) => T,
    equalityFn?: EqualityFn<T>
  ): OutputSelector<S, T, (...res: R[]) => T>
  <S, P, R, T>(
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
