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

  /* two selectors */
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

  /* three selectors */
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

  /* four selectors */
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

  /* five selectors */
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

  /* six selectors */
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

  /* seven selectors */
  <S1, S2, S3, S4, S5, S6, S7, R1, R2, R3, R4, R5, R6, R7, T>(
    selectors: [
      Selector<S1, R1>,
      Selector<S2, R2>,
      Selector<S3, R3>,
      Selector<S4, R4>,
      Selector<S5, R5>,
      Selector<S6, R6>,
      Selector<S7, R7>
    ],
    combiner: (
      res1: R1,
      res2: R2,
      res3: R3,
      res4: R4,
      res5: R5,
      res6: R6,
      res7: R7
    ) => T
  ): OutputSelector<
    S1 & S2 & S3 & S4 & S5 & S6 & S7,
    T,
    (res1: R1, res2: R2, res3: R3, res4: R4, res5: R5, res6: R6, res7: R7) => T
  >

  <
    S1,
    S2,
    S3,
    S4,
    S5,
    S6,
    S7,
    P1,
    P2,
    P3,
    P4,
    P5,
    P6,
    P7,
    R1,
    R2,
    R3,
    R4,
    R5,
    R6,
    R7,
    T
  >(
    selectors: [
      ParametricSelector<S1, P1, R1>,
      ParametricSelector<S2, P2, R2>,
      ParametricSelector<S3, P3, R3>,
      ParametricSelector<S4, P4, R4>,
      ParametricSelector<S5, P5, R5>,
      ParametricSelector<S6, P6, R6>,
      ParametricSelector<S7, P7, R7>
    ],
    combiner: (
      res1: R1,
      res2: R2,
      res3: R3,
      res4: R4,
      res5: R5,
      res6: R6,
      res7: R7
    ) => T
  ): OutputParametricSelector<
    S1 & S2 & S3 & S4 & S5 & S6 & S7,
    P1 & P2 & P3 & P4 & P5 & P6 & P7,
    T,
    (res1: R1, res2: R2, res3: R3, res4: R4, res5: R5, res6: R6, res7: R7) => T
  >

  /* eight selectors */
  <S1, S2, S3, S4, S5, S6, S7, S8, R1, R2, R3, R4, R5, R6, R7, R8, T>(
    selectors: [
      Selector<S1, R1>,
      Selector<S2, R2>,
      Selector<S3, R3>,
      Selector<S4, R4>,
      Selector<S5, R5>,
      Selector<S6, R6>,
      Selector<S7, R7>,
      Selector<S8, R8>
    ],
    combiner: (
      res1: R1,
      res2: R2,
      res3: R3,
      res4: R4,
      res5: R5,
      res6: R6,
      res7: R7,
      res8: R8
    ) => T
  ): OutputSelector<
    S1 & S2 & S3 & S4 & S5 & S6 & S7 & S8,
    T,
    (
      res1: R1,
      res2: R2,
      res3: R3,
      res4: R4,
      res5: R5,
      res6: R6,
      res7: R7,
      res8: R8
    ) => T
  >

  <
    S1,
    S2,
    S3,
    S4,
    S5,
    S6,
    S7,
    S8,
    P1,
    P2,
    P3,
    P4,
    P5,
    P6,
    P7,
    P8,
    R1,
    R2,
    R3,
    R4,
    R5,
    R6,
    R7,
    R8,
    T
  >(
    selectors: [
      ParametricSelector<S1, P1, R1>,
      ParametricSelector<S2, P2, R2>,
      ParametricSelector<S3, P3, R3>,
      ParametricSelector<S4, P4, R4>,
      ParametricSelector<S5, P5, R5>,
      ParametricSelector<S6, P6, R6>,
      ParametricSelector<S7, P7, R7>,
      ParametricSelector<S8, P8, R8>
    ],
    combiner: (
      res1: R1,
      res2: R2,
      res3: R3,
      res4: R4,
      res5: R5,
      res6: R6,
      res7: R7,
      res8: R8
    ) => T
  ): OutputParametricSelector<
    S1 & S2 & S3 & S4 & S5 & S6 & S7 & S8,
    P1 & P2 & P3 & P4 & P5 & P6 & P7 & P8,
    T,
    (
      res1: R1,
      res2: R2,
      res3: R3,
      res4: R4,
      res5: R5,
      res6: R6,
      res7: R7,
      res8: R8
    ) => T
  >

  /* nine selectors */
  <S1, S2, S3, S4, S5, S6, S7, S8, S9, R1, R2, R3, R4, R5, R6, R7, R8, R9, T>(
    selectors: [
      Selector<S1, R1>,
      Selector<S2, R2>,
      Selector<S3, R3>,
      Selector<S4, R4>,
      Selector<S5, R5>,
      Selector<S6, R6>,
      Selector<S7, R7>,
      Selector<S8, R8>,
      Selector<S9, R9>
    ],
    combiner: (
      res1: R1,
      res2: R2,
      res3: R3,
      res4: R4,
      res5: R5,
      res6: R6,
      res7: R7,
      res8: R8,
      res9: R9
    ) => T
  ): OutputSelector<
    S1 & S2 & S3 & S4 & S5 & S6 & S7 & S8 & S9,
    T,
    (
      res1: R1,
      res2: R2,
      res3: R3,
      res4: R4,
      res5: R5,
      res6: R6,
      res7: R7,
      res8: R8,
      res9: R9
    ) => T
  >

  <
    S1,
    S2,
    S3,
    S4,
    S5,
    S6,
    S7,
    S8,
    S9,
    P1,
    P2,
    P3,
    P4,
    P5,
    P6,
    P7,
    P8,
    P9,
    R1,
    R2,
    R3,
    R4,
    R5,
    R6,
    R7,
    R8,
    R9,
    T
  >(
    selectors: [
      ParametricSelector<S1, P1, R1>,
      ParametricSelector<S2, P2, R2>,
      ParametricSelector<S3, P3, R3>,
      ParametricSelector<S4, P4, R4>,
      ParametricSelector<S5, P5, R5>,
      ParametricSelector<S6, P6, R6>,
      ParametricSelector<S7, P7, R7>,
      ParametricSelector<S8, P8, R8>,
      ParametricSelector<S9, P9, R9>
    ],
    combiner: (
      res1: R1,
      res2: R2,
      res3: R3,
      res4: R4,
      res5: R5,
      res6: R6,
      res7: R7,
      res8: R8,
      res9: R9
    ) => T
  ): OutputParametricSelector<
    S1 & S2 & S3 & S4 & S5 & S6 & S7 & S8 & S9,
    P1 & P2 & P3 & P4 & P5 & P6 & P7 & P8 & P9,
    T,
    (
      res1: R1,
      res2: R2,
      res3: R3,
      res4: R4,
      res5: R5,
      res6: R6,
      res7: R7,
      res8: R8,
      res9: R9
    ) => T
  >

  /* ten selectors */
  <
    S1,
    S2,
    S3,
    S4,
    S5,
    S6,
    S7,
    S8,
    S9,
    S10,
    R1,
    R2,
    R3,
    R4,
    R5,
    R6,
    R7,
    R8,
    R9,
    R10,
    T
  >(
    selectors: [
      Selector<S1, R1>,
      Selector<S2, R2>,
      Selector<S3, R3>,
      Selector<S4, R4>,
      Selector<S5, R5>,
      Selector<S6, R6>,
      Selector<S7, R7>,
      Selector<S8, R8>,
      Selector<S9, R9>,
      Selector<S10, R10>
    ],
    combiner: (
      res1: R1,
      res2: R2,
      res3: R3,
      res4: R4,
      res5: R5,
      res6: R6,
      res7: R7,
      res8: R8,
      res9: R9,
      res10: R10
    ) => T
  ): OutputSelector<
    S1 & S2 & S3 & S4 & S5 & S6 & S7 & S8 & S9 & S10,
    T,
    (
      res1: R1,
      res2: R2,
      res3: R3,
      res4: R4,
      res5: R5,
      res6: R6,
      res7: R7,
      res8: R8,
      res9: R9,
      res10: R10
    ) => T
  >

  <
    S1,
    S2,
    S3,
    S4,
    S5,
    S6,
    S7,
    S8,
    S9,
    S10,
    P1,
    P2,
    P3,
    P4,
    P5,
    P6,
    P7,
    P8,
    P9,
    P10,
    R1,
    R2,
    R3,
    R4,
    R5,
    R6,
    R7,
    R8,
    R9,
    R10,
    T
  >(
    selectors: [
      ParametricSelector<S1, P1, R1>,
      ParametricSelector<S2, P2, R2>,
      ParametricSelector<S3, P3, R3>,
      ParametricSelector<S4, P4, R4>,
      ParametricSelector<S5, P5, R5>,
      ParametricSelector<S6, P6, R6>,
      ParametricSelector<S7, P7, R7>,
      ParametricSelector<S8, P8, R8>,
      ParametricSelector<S9, P9, R9>,
      ParametricSelector<S10, P10, R10>
    ],
    combiner: (
      res1: R1,
      res2: R2,
      res3: R3,
      res4: R4,
      res5: R5,
      res6: R6,
      res7: R7,
      res8: R8,
      res9: R9,
      res10: R10
    ) => T
  ): OutputParametricSelector<
    S1 & S2 & S3 & S4 & S5 & S6 & S7 & S8 & S9 & S10,
    P1 & P2 & P3 & P4 & P5 & P6 & P7 & P8 & P9 & P10,
    T,
    (
      res1: R1,
      res2: R2,
      res3: R3,
      res4: R4,
      res5: R5,
      res6: R6,
      res7: R7,
      res8: R8,
      res9: R9,
      res10: R10
    ) => T
  >

  /* eleven selectors */
  <
    S1,
    S2,
    S3,
    S4,
    S5,
    S6,
    S7,
    S8,
    S9,
    S10,
    S11,
    R1,
    R2,
    R3,
    R4,
    R5,
    R6,
    R7,
    R8,
    R9,
    R10,
    R11,
    T
  >(
    selectors: [
      Selector<S1, R1>,
      Selector<S2, R2>,
      Selector<S3, R3>,
      Selector<S4, R4>,
      Selector<S5, R5>,
      Selector<S6, R6>,
      Selector<S7, R7>,
      Selector<S8, R8>,
      Selector<S9, R9>,
      Selector<S10, R10>,
      Selector<S11, R11>
    ],
    combiner: (
      res1: R1,
      res2: R2,
      res3: R3,
      res4: R4,
      res5: R5,
      res6: R6,
      res7: R7,
      res8: R8,
      res9: R9,
      res10: R10,
      res11: R11
    ) => T
  ): OutputSelector<
    S1 & S2 & S3 & S4 & S5 & S6 & S7 & S8 & S9 & S10 & S11,
    T,
    (
      res1: R1,
      res2: R2,
      res3: R3,
      res4: R4,
      res5: R5,
      res6: R6,
      res7: R7,
      res8: R8,
      res9: R9,
      res10: R10,
      res11: R11
    ) => T
  >

  <
    S1,
    S2,
    S3,
    S4,
    S5,
    S6,
    S7,
    S8,
    S9,
    S10,
    S11,
    P1,
    P2,
    P3,
    P4,
    P5,
    P6,
    P7,
    P8,
    P9,
    P10,
    P11,
    R1,
    R2,
    R3,
    R4,
    R5,
    R6,
    R7,
    R8,
    R9,
    R10,
    R11,
    T
  >(
    selectors: [
      ParametricSelector<S1, P1, R1>,
      ParametricSelector<S2, P2, R2>,
      ParametricSelector<S3, P3, R3>,
      ParametricSelector<S4, P4, R4>,
      ParametricSelector<S5, P5, R5>,
      ParametricSelector<S6, P6, R6>,
      ParametricSelector<S7, P7, R7>,
      ParametricSelector<S8, P8, R8>,
      ParametricSelector<S9, P9, R9>,
      ParametricSelector<S10, P10, R10>,
      ParametricSelector<S11, P11, R11>
    ],
    combiner: (
      res1: R1,
      res2: R2,
      res3: R3,
      res4: R4,
      res5: R5,
      res6: R6,
      res7: R7,
      res8: R8,
      res9: R9,
      res10: R10,
      res11: R11
    ) => T
  ): OutputParametricSelector<
    S1 & S2 & S3 & S4 & S5 & S6 & S7 & S8 & S9 & S10 & S11,
    P1 & P2 & P3 & P4 & P5 & P6 & P7 & P8 & P9 & P10 & P11,
    T,
    (
      res1: R1,
      res2: R2,
      res3: R3,
      res4: R4,
      res5: R5,
      res6: R6,
      res7: R7,
      res8: R8,
      res9: R9,
      res10: R10,
      res11: R11
    ) => T
  >

  /* twelve selectors */
  <
    S1,
    S2,
    S3,
    S4,
    S5,
    S6,
    S7,
    S8,
    S9,
    S10,
    S11,
    S12,
    R1,
    R2,
    R3,
    R4,
    R5,
    R6,
    R7,
    R8,
    R9,
    R10,
    R11,
    R12,
    T
  >(
    selectors: [
      Selector<S1, R1>,
      Selector<S2, R2>,
      Selector<S3, R3>,
      Selector<S4, R4>,
      Selector<S5, R5>,
      Selector<S6, R6>,
      Selector<S7, R7>,
      Selector<S8, R8>,
      Selector<S9, R9>,
      Selector<S10, R10>,
      Selector<S11, R11>,
      Selector<S12, R12>
    ],
    combiner: (
      res1: R1,
      res2: R2,
      res3: R3,
      res4: R4,
      res5: R5,
      res6: R6,
      res7: R7,
      res8: R8,
      res9: R9,
      res10: R10,
      res11: R11,
      res12: R12
    ) => T
  ): OutputSelector<
    S1 & S2 & S3 & S4 & S5 & S6 & S7 & S8 & S9 & S10 & S11 & S12,
    T,
    (
      res1: R1,
      res2: R2,
      res3: R3,
      res4: R4,
      res5: R5,
      res6: R6,
      res7: R7,
      res8: R8,
      res9: R9,
      res10: R10,
      res11: R11,
      res12: R12
    ) => T
  >

  <
    S1,
    S2,
    S3,
    S4,
    S5,
    S6,
    S7,
    S8,
    S9,
    S10,
    S11,
    S12,
    P1,
    P2,
    P3,
    P4,
    P5,
    P6,
    P7,
    P8,
    P9,
    P10,
    P11,
    P12,
    R1,
    R2,
    R3,
    R4,
    R5,
    R6,
    R7,
    R8,
    R9,
    R10,
    R11,
    R12,
    T
  >(
    selectors: [
      ParametricSelector<S1, P1, R1>,
      ParametricSelector<S2, P2, R2>,
      ParametricSelector<S3, P3, R3>,
      ParametricSelector<S4, P4, R4>,
      ParametricSelector<S5, P5, R5>,
      ParametricSelector<S6, P6, R6>,
      ParametricSelector<S7, P7, R7>,
      ParametricSelector<S8, P8, R8>,
      ParametricSelector<S9, P9, R9>,
      ParametricSelector<S10, P10, R10>,
      ParametricSelector<S11, P11, R11>,
      ParametricSelector<S12, P12, R12>
    ],
    combiner: (
      res1: R1,
      res2: R2,
      res3: R3,
      res4: R4,
      res5: R5,
      res6: R6,
      res7: R7,
      res8: R8,
      res9: R9,
      res10: R10,
      res11: R11,
      res12: R12
    ) => T
  ): OutputParametricSelector<
    S1 & S2 & S3 & S4 & S5 & S6 & S7 & S8 & S9 & S10 & S11 & S12,
    P1 & P2 & P3 & P4 & P5 & P6 & P7 & P8 & P9 & P10 & P11 & P12,
    T,
    (
      res1: R1,
      res2: R2,
      res3: R3,
      res4: R4,
      res5: R5,
      res6: R6,
      res7: R7,
      res8: R8,
      res9: R9,
      res10: R10,
      res11: R11,
      res12: R12
    ) => T
  >

  /* thirteen selectors */
  <
    S1,
    S2,
    S3,
    S4,
    S5,
    S6,
    S7,
    S8,
    S9,
    S10,
    S11,
    S12,
    S13,
    R1,
    R2,
    R3,
    R4,
    R5,
    R6,
    R7,
    R8,
    R9,
    R10,
    R11,
    R12,
    R13,
    T
  >(
    selectors: [
      Selector<S1, R1>,
      Selector<S2, R2>,
      Selector<S3, R3>,
      Selector<S4, R4>,
      Selector<S5, R5>,
      Selector<S6, R6>,
      Selector<S7, R7>,
      Selector<S8, R8>,
      Selector<S9, R9>,
      Selector<S10, R10>,
      Selector<S11, R11>,
      Selector<S12, R12>,
      Selector<S13, R13>
    ],
    combiner: (
      res1: R1,
      res2: R2,
      res3: R3,
      res4: R4,
      res5: R5,
      res6: R6,
      res7: R7,
      res8: R8,
      res9: R9,
      res10: R10,
      res11: R11,
      res12: R12,
      res13: R13
    ) => T
  ): OutputSelector<
    S1 & S2 & S3 & S4 & S5 & S6 & S7 & S8 & S9 & S10 & S11 & S12 & S13,
    T,
    (
      res1: R1,
      res2: R2,
      res3: R3,
      res4: R4,
      res5: R5,
      res6: R6,
      res7: R7,
      res8: R8,
      res9: R9,
      res10: R10,
      res11: R11,
      res12: R12,
      res13: R13
    ) => T
  >

  <
    S1,
    S2,
    S3,
    S4,
    S5,
    S6,
    S7,
    S8,
    S9,
    S10,
    S11,
    S12,
    S13,
    P1,
    P2,
    P3,
    P4,
    P5,
    P6,
    P7,
    P8,
    P9,
    P10,
    P11,
    P12,
    P13,
    R1,
    R2,
    R3,
    R4,
    R5,
    R6,
    R7,
    R8,
    R9,
    R10,
    R11,
    R12,
    R13,
    T
  >(
    selectors: [
      ParametricSelector<S1, P1, R1>,
      ParametricSelector<S2, P2, R2>,
      ParametricSelector<S3, P3, R3>,
      ParametricSelector<S4, P4, R4>,
      ParametricSelector<S5, P5, R5>,
      ParametricSelector<S6, P6, R6>,
      ParametricSelector<S7, P7, R7>,
      ParametricSelector<S8, P8, R8>,
      ParametricSelector<S9, P9, R9>,
      ParametricSelector<S10, P10, R10>,
      ParametricSelector<S11, P11, R11>,
      ParametricSelector<S12, P12, R12>,
      ParametricSelector<S13, P13, R13>
    ],
    combiner: (
      res1: R1,
      res2: R2,
      res3: R3,
      res4: R4,
      res5: R5,
      res6: R6,
      res7: R7,
      res8: R8,
      res9: R9,
      res10: R10,
      res11: R11,
      res12: R12,
      res13: R13
    ) => T
  ): OutputParametricSelector<
    S1 & S2 & S3 & S4 & S5 & S6 & S7 & S8 & S9 & S10 & S11 & S12 & S13,
    P1 & P2 & P3 & P4 & P5 & P6 & P7 & P8 & P9 & P10 & P11 & P12 & P13,
    T,
    (
      res1: R1,
      res2: R2,
      res3: R3,
      res4: R4,
      res5: R5,
      res6: R6,
      res7: R7,
      res8: R8,
      res9: R9,
      res10: R10,
      res11: R11,
      res12: R12,
      res13: R13
    ) => T
  >

  /* fourteen selectors */
  <
    S1,
    S2,
    S3,
    S4,
    S5,
    S6,
    S7,
    S8,
    S9,
    S10,
    S11,
    S12,
    S13,
    S14,
    R1,
    R2,
    R3,
    R4,
    R5,
    R6,
    R7,
    R8,
    R9,
    R10,
    R11,
    R12,
    R13,
    R14,
    T
  >(
    selectors: [
      Selector<S1, R1>,
      Selector<S2, R2>,
      Selector<S3, R3>,
      Selector<S4, R4>,
      Selector<S5, R5>,
      Selector<S6, R6>,
      Selector<S7, R7>,
      Selector<S8, R8>,
      Selector<S9, R9>,
      Selector<S10, R10>,
      Selector<S11, R11>,
      Selector<S12, R12>,
      Selector<S13, R13>,
      Selector<S14, R14>
    ],
    combiner: (
      res1: R1,
      res2: R2,
      res3: R3,
      res4: R4,
      res5: R5,
      res6: R6,
      res7: R7,
      res8: R8,
      res9: R9,
      res10: R10,
      res11: R11,
      res12: R12,
      res13: R13,
      res14: R14
    ) => T
  ): OutputSelector<
    S1 & S2 & S3 & S4 & S5 & S6 & S7 & S8 & S9 & S10 & S11 & S12 & S13 & S14,
    T,
    (
      res1: R1,
      res2: R2,
      res3: R3,
      res4: R4,
      res5: R5,
      res6: R6,
      res7: R7,
      res8: R8,
      res9: R9,
      res10: R10,
      res11: R11,
      res12: R12,
      res13: R13,
      res14: R14
    ) => T
  >

  <
    S1,
    S2,
    S3,
    S4,
    S5,
    S6,
    S7,
    S8,
    S9,
    S10,
    S11,
    S12,
    S13,
    S14,
    P1,
    P2,
    P3,
    P4,
    P5,
    P6,
    P7,
    P8,
    P9,
    P10,
    P11,
    P12,
    P13,
    P14,
    R1,
    R2,
    R3,
    R4,
    R5,
    R6,
    R7,
    R8,
    R9,
    R10,
    R11,
    R12,
    R13,
    R14,
    T
  >(
    selectors: [
      ParametricSelector<S1, P1, R1>,
      ParametricSelector<S2, P2, R2>,
      ParametricSelector<S3, P3, R3>,
      ParametricSelector<S4, P4, R4>,
      ParametricSelector<S5, P5, R5>,
      ParametricSelector<S6, P6, R6>,
      ParametricSelector<S7, P7, R7>,
      ParametricSelector<S8, P8, R8>,
      ParametricSelector<S9, P9, R9>,
      ParametricSelector<S10, P10, R10>,
      ParametricSelector<S11, P11, R11>,
      ParametricSelector<S12, P12, R12>,
      ParametricSelector<S13, P13, R13>,
      ParametricSelector<S14, P14, R14>
    ],
    combiner: (
      res1: R1,
      res2: R2,
      res3: R3,
      res4: R4,
      res5: R5,
      res6: R6,
      res7: R7,
      res8: R8,
      res9: R9,
      res10: R10,
      res11: R11,
      res12: R12,
      res13: R13,
      res14: R14
    ) => T
  ): OutputParametricSelector<
    S1 & S2 & S3 & S4 & S5 & S6 & S7 & S8 & S9 & S10 & S11 & S12 & S13 & S14,
    P1 & P2 & P3 & P4 & P5 & P6 & P7 & P8 & P9 & P10 & P11 & P12 & P13 & P14,
    T,
    (
      res1: R1,
      res2: R2,
      res3: R3,
      res4: R4,
      res5: R5,
      res6: R6,
      res7: R7,
      res8: R8,
      res9: R9,
      res10: R10,
      res11: R11,
      res12: R12,
      res13: R13,
      res14: R14
    ) => T
  >

  /* fifteen selectors */
  <
    S1,
    S2,
    S3,
    S4,
    S5,
    S6,
    S7,
    S8,
    S9,
    S10,
    S11,
    S12,
    S13,
    S14,
    S15,
    R1,
    R2,
    R3,
    R4,
    R5,
    R6,
    R7,
    R8,
    R9,
    R10,
    R11,
    R12,
    R13,
    R14,
    R15,
    T
  >(
    selectors: [
      Selector<S1, R1>,
      Selector<S2, R2>,
      Selector<S3, R3>,
      Selector<S4, R4>,
      Selector<S5, R5>,
      Selector<S6, R6>,
      Selector<S7, R7>,
      Selector<S8, R8>,
      Selector<S9, R9>,
      Selector<S10, R10>,
      Selector<S11, R11>,
      Selector<S12, R12>,
      Selector<S13, R13>,
      Selector<S14, R14>,
      Selector<S15, R15>
    ],
    combiner: (
      res1: R1,
      res2: R2,
      res3: R3,
      res4: R4,
      res5: R5,
      res6: R6,
      res7: R7,
      res8: R8,
      res9: R9,
      res10: R10,
      res11: R11,
      res12: R12,
      res13: R13,
      res14: R14,
      res15: R15
    ) => T
  ): OutputSelector<
    S1 &
      S2 &
      S3 &
      S4 &
      S5 &
      S6 &
      S7 &
      S8 &
      S9 &
      S10 &
      S11 &
      S12 &
      S13 &
      S14 &
      S15,
    T,
    (
      res1: R1,
      res2: R2,
      res3: R3,
      res4: R4,
      res5: R5,
      res6: R6,
      res7: R7,
      res8: R8,
      res9: R9,
      res10: R10,
      res11: R11,
      res12: R12,
      res13: R13,
      res14: R14,
      res15: R15
    ) => T
  >

  <
    S1,
    S2,
    S3,
    S4,
    S5,
    S6,
    S7,
    S8,
    S9,
    S10,
    S11,
    S12,
    S13,
    S14,
    S15,
    P1,
    P2,
    P3,
    P4,
    P5,
    P6,
    P7,
    P8,
    P9,
    P10,
    P11,
    P12,
    P13,
    P14,
    P15,
    R1,
    R2,
    R3,
    R4,
    R5,
    R6,
    R7,
    R8,
    R9,
    R10,
    R11,
    R12,
    R13,
    R14,
    R15,
    T
  >(
    selectors: [
      ParametricSelector<S1, P1, R1>,
      ParametricSelector<S2, P2, R2>,
      ParametricSelector<S3, P3, R3>,
      ParametricSelector<S4, P4, R4>,
      ParametricSelector<S5, P5, R5>,
      ParametricSelector<S6, P6, R6>,
      ParametricSelector<S7, P7, R7>,
      ParametricSelector<S8, P8, R8>,
      ParametricSelector<S9, P9, R9>,
      ParametricSelector<S10, P10, R10>,
      ParametricSelector<S11, P11, R11>,
      ParametricSelector<S12, P12, R12>,
      ParametricSelector<S13, P13, R13>,
      ParametricSelector<S14, P14, R14>,
      ParametricSelector<S15, P15, R15>
    ],
    combiner: (
      res1: R1,
      res2: R2,
      res3: R3,
      res4: R4,
      res5: R5,
      res6: R6,
      res7: R7,
      res8: R8,
      res9: R9,
      res10: R10,
      res11: R11,
      res12: R12,
      res13: R13,
      res14: R14,
      res15: R15
    ) => T
  ): OutputParametricSelector<
    S1 &
      S2 &
      S3 &
      S4 &
      S5 &
      S6 &
      S7 &
      S8 &
      S9 &
      S10 &
      S11 &
      S12 &
      S13 &
      S14 &
      S15,
    P1 &
      P2 &
      P3 &
      P4 &
      P5 &
      P6 &
      P7 &
      P8 &
      P9 &
      P10 &
      P11 &
      P12 &
      P13 &
      P14 &
      P15,
    T,
    (
      res1: R1,
      res2: R2,
      res3: R3,
      res4: R4,
      res5: R5,
      res6: R6,
      res7: R7,
      res8: R8,
      res9: R9,
      res10: R10,
      res11: R11,
      res12: R12,
      res13: R13,
      res14: R14,
      res15: R15
    ) => T
  >

  /* sixteen selectors */
  <
    S1,
    S2,
    S3,
    S4,
    S5,
    S6,
    S7,
    S8,
    S9,
    S10,
    S11,
    S12,
    S13,
    S14,
    S15,
    S16,
    R1,
    R2,
    R3,
    R4,
    R5,
    R6,
    R7,
    R8,
    R9,
    R10,
    R11,
    R12,
    R13,
    R14,
    R15,
    R16,
    T
  >(
    selectors: [
      Selector<S1, R1>,
      Selector<S2, R2>,
      Selector<S3, R3>,
      Selector<S4, R4>,
      Selector<S5, R5>,
      Selector<S6, R6>,
      Selector<S7, R7>,
      Selector<S8, R8>,
      Selector<S9, R9>,
      Selector<S10, R10>,
      Selector<S11, R11>,
      Selector<S12, R12>,
      Selector<S13, R13>,
      Selector<S14, R14>,
      Selector<S15, R15>,
      Selector<S16, R16>
    ],
    combiner: (
      res1: R1,
      res2: R2,
      res3: R3,
      res4: R4,
      res5: R5,
      res6: R6,
      res7: R7,
      res8: R8,
      res9: R9,
      res10: R10,
      res11: R11,
      res12: R12,
      res13: R13,
      res14: R14,
      res15: R15,
      res16: R16
    ) => T
  ): OutputSelector<
    S1 &
      S2 &
      S3 &
      S4 &
      S5 &
      S6 &
      S7 &
      S8 &
      S9 &
      S10 &
      S11 &
      S12 &
      S13 &
      S14 &
      S15 &
      S16,
    T,
    (
      res1: R1,
      res2: R2,
      res3: R3,
      res4: R4,
      res5: R5,
      res6: R6,
      res7: R7,
      res8: R8,
      res9: R9,
      res10: R10,
      res11: R11,
      res12: R12,
      res13: R13,
      res14: R14,
      res15: R15,
      res16: R16
    ) => T
  >

  <
    S1,
    S2,
    S3,
    S4,
    S5,
    S6,
    S7,
    S8,
    S9,
    S10,
    S11,
    S12,
    S13,
    S14,
    S15,
    S16,
    P1,
    P2,
    P3,
    P4,
    P5,
    P6,
    P7,
    P8,
    P9,
    P10,
    P11,
    P12,
    P13,
    P14,
    P15,
    P16,
    R1,
    R2,
    R3,
    R4,
    R5,
    R6,
    R7,
    R8,
    R9,
    R10,
    R11,
    R12,
    R13,
    R14,
    R15,
    R16,
    T
  >(
    selectors: [
      ParametricSelector<S1, P1, R1>,
      ParametricSelector<S2, P2, R2>,
      ParametricSelector<S3, P3, R3>,
      ParametricSelector<S4, P4, R4>,
      ParametricSelector<S5, P5, R5>,
      ParametricSelector<S6, P6, R6>,
      ParametricSelector<S7, P7, R7>,
      ParametricSelector<S8, P8, R8>,
      ParametricSelector<S9, P9, R9>,
      ParametricSelector<S10, P10, R10>,
      ParametricSelector<S11, P11, R11>,
      ParametricSelector<S12, P12, R12>,
      ParametricSelector<S13, P13, R13>,
      ParametricSelector<S14, P14, R14>,
      ParametricSelector<S15, P15, R15>,
      ParametricSelector<S16, P16, R16>
    ],
    combiner: (
      res1: R1,
      res2: R2,
      res3: R3,
      res4: R4,
      res5: R5,
      res6: R6,
      res7: R7,
      res8: R8,
      res9: R9,
      res10: R10,
      res11: R11,
      res12: R12,
      res13: R13,
      res14: R14,
      res15: R15,
      res16: R16
    ) => T
  ): OutputParametricSelector<
    S1 &
      S2 &
      S3 &
      S4 &
      S5 &
      S6 &
      S7 &
      S8 &
      S9 &
      S10 &
      S11 &
      S12 &
      S13 &
      S14 &
      S15 &
      S16,
    P1 &
      P2 &
      P3 &
      P4 &
      P5 &
      P6 &
      P7 &
      P8 &
      P9 &
      P10 &
      P11 &
      P12 &
      P13 &
      P14 &
      P15 &
      P16,
    T,
    (
      res1: R1,
      res2: R2,
      res3: R3,
      res4: R4,
      res5: R5,
      res6: R6,
      res7: R7,
      res8: R8,
      res9: R9,
      res10: R10,
      res11: R11,
      res12: R12,
      res13: R13,
      res14: R14,
      res15: R15,
      res16: R16
    ) => T
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
