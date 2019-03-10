// TypeScript Version: 3.0

export type Selector<S, R> = (state: S) => R;
export type ParametricSelector<S, P, R> = (state: S, props: P, ...args: any[]) => R;

interface InstanceProps<S> {
  keySelector: Selector<S, string>;
}
interface OutputProps {
  recomputations: () => number;
}
type OutputInstanceProps<S> = OutputProps & {
  use: () => [() => void, () => void],
  getCache: () => Map<string, any>
};
interface ParametricInstanceProps<S, P> {
  keySelector: ParametricSelector<S, P, string>;
}
export { };

export type OutputSelector<S, R> = Selector<S, R> & OutputProps;
export type InstanceSelector<S, R> = Selector<S, R> & InstanceProps<S>;
export type OutputInstanceSelector<S, R> = Selector<S, R> & OutputProps & OutputInstanceProps<S> & InstanceProps<S>;

export type OutputParametricSelector<S, P, R> = ParametricSelector<S, P, R> & OutputProps;
export type ParametricInstanceSelector<S, P, R> = ParametricSelector<S, P, R> & ParametricInstanceProps<S, P>;
export type OutputParametricInstanceSelector<S, P, R> = ParametricSelector<S, P, R> & OutputInstanceProps<S> & ParametricInstanceProps<S, P>;

export type MaybeInstanceSelector<S, R> = Selector<S, R> | InstanceSelector<S, R>;
export type MaybeParametricInstanceSelector<S, P, R> = ParametricSelector<S, P, R> | ParametricInstanceSelector<S, P, R>;

/* homogeneous selector parameter types */

/* one selector */
export function createSelector<S, R1, T>(
  selector: InstanceSelector<S, R1>,
  combiner: (res: R1) => T,
): OutputInstanceSelector<S, T>;

export function createSelector<S, R1, T>(
  selector: Selector<S, R1>,
  combiner: (res: R1) => T,
): OutputSelector<S, T>;

export function createSelector<S, P, R1, T>(
  selector: ParametricInstanceSelector<S, P, R1>,
  combiner: (res: R1) => T,
): OutputParametricInstanceSelector<S, P, T>;

export function createSelector<S, P, R1, T>(
  selector: ParametricSelector<S, P, R1>,
  combiner: (res: R1) => T,
): OutputParametricSelector<S, P, T>;

/* two selectors */
export function createSelector<S, R1, R2, T>(
  selector1: InstanceSelector<S, R1>,
  selector2: MaybeInstanceSelector<S, R2>,
  combiner: (res1: R1, res2: R2) => T,
): OutputInstanceSelector<S, T>;
export function createSelector<S, R1, R2, T>(
  selector1: MaybeInstanceSelector<S, R1>,
  selector2: InstanceSelector<S, R2>,
  combiner: (res1: R1, res2: R2) => T,
): OutputInstanceSelector<S, T>;

export function createSelector<S, R1, R2, T>(
  selector1: Selector<S, R1>,
  selector2: Selector<S, R2>,
  combiner: (res1: R1, res2: R2) => T,
): OutputSelector<S, T>;

export function createSelector<S, P, R1, R2, T>(
  selector1: ParametricInstanceSelector<S, P, R1>,
  selector2: MaybeParametricInstanceSelector<S, P, R2>,
  combiner: (res1: R1, res2: R2) => T,
): OutputParametricInstanceSelector<S, P, T>;
export function createSelector<S, P, R1, R2, T>(
  selector1: MaybeParametricInstanceSelector<S, P, R1>,
  selector2: ParametricInstanceSelector<S, P, R2>,
  combiner: (res1: R1, res2: R2) => T,
): OutputParametricInstanceSelector<S, P, T>;

export function createSelector<S, P, R1, R2, T>(
  selector1: ParametricSelector<S, P, R1>,
  selector2: ParametricSelector<S, P, R2>,
  combiner: (res1: R1, res2: R2) => T,
): OutputParametricSelector<S, P, T>;

/* three selectors */
export function createSelector<S, R1, R2, R3, T>(
  selector1: InstanceSelector<S, R1>,
  selector2: MaybeInstanceSelector<S, R2>,
  selector3: MaybeInstanceSelector<S, R3>,
  combiner: (res1: R1, res2: R2, res3: R3) => T,
): OutputInstanceSelector<S, T>;
export function createSelector<S, R1, R2, R3, T>(
  selector1: MaybeInstanceSelector<S, R1>,
  selector2: InstanceSelector<S, R2>,
  selector3: MaybeInstanceSelector<S, R3>,
  combiner: (res1: R1, res2: R2, res3: R3) => T,
): OutputInstanceSelector<S, T>;
export function createSelector<S, R1, R2, R3, T>(
  selector1: MaybeInstanceSelector<S, R1>,
  selector2: MaybeInstanceSelector<S, R2>,
  selector3: InstanceSelector<S, R3>,
  combiner: (res1: R1, res2: R2, res3: R3) => T,
): OutputInstanceSelector<S, T>;

export function createSelector<S, R1, R2, R3, T>(
  selector1: Selector<S, R1>,
  selector2: Selector<S, R2>,
  selector3: Selector<S, R3>,
  combiner: (res1: R1, res2: R2, res3: R3) => T,
): OutputSelector<S, T>;

export function createSelector<S, P, R1, R2, R3, T>(
  selector1: ParametricInstanceSelector<S, P, R1>,
  selector2: MaybeParametricInstanceSelector<S, P, R2>,
  selector3: MaybeParametricInstanceSelector<S, P, R3>,
  combiner: (res1: R1, res2: R2, res3: R3) => T,
): OutputParametricInstanceSelector<S, P, T>;
export function createSelector<S, P, R1, R2, R3, T>(
  selector1: MaybeParametricInstanceSelector<S, P, R1>,
  selector2: ParametricInstanceSelector<S, P, R2>,
  selector3: MaybeParametricInstanceSelector<S, P, R3>,
  combiner: (res1: R1, res2: R2, res3: R3) => T,
): OutputParametricInstanceSelector<S, P, T>;
export function createSelector<S, P, R1, R2, R3, T>(
  selector1: MaybeParametricInstanceSelector<S, P, R1>,
  selector2: MaybeParametricInstanceSelector<S, P, R2>,
  selector3: ParametricInstanceSelector<S, P, R3>,
  combiner: (res1: R1, res2: R2, res3: R3) => T,
): OutputParametricInstanceSelector<S, P, T>;

export function createSelector<S, P, R1, R2, R3, T>(
  selector1: ParametricSelector<S, P, R1>,
  selector2: ParametricSelector<S, P, R2>,
  selector3: ParametricSelector<S, P, R3>,
  combiner: (res1: R1, res2: R2, res3: R3) => T,
): OutputParametricSelector<S, P, T>;

/* array argument */

/* one selector */
export function createSelector<S, R1, T>(
  selectors: [Selector<S, R1>],
  combiner: (res: R1) => T,
): OutputSelector<S, T>;
export function createSelector<S, P, R1, T>(
  selectors: [ParametricSelector<S, P, R1>],
  combiner: (res: R1) => T,
): OutputParametricSelector<S, P, T>;

/* two selectors */
export function createSelector<S, R1, R2, T>(
  selectors: [Selector<S, R1>,
              Selector<S, R2>],
  combiner: (res1: R1, res2: R2) => T,
): OutputSelector<S, T>;
export function createSelector<S, P, R1, R2, T>(
  selectors: [ParametricSelector<S, P, R1>,
              ParametricSelector<S, P, R2>],
  combiner: (res1: R1, res2: R2) => T,
): OutputParametricSelector<S, P, T>;

/* three selectors */
export function createSelector<S, R1, R2, R3, T>(
  selectors: [Selector<S, R1>,
              Selector<S, R2>,
              Selector<S, R3>],
  combiner: (res1: R1, res2: R2, res3: R3) => T,
): OutputSelector<S, T>;
export function createSelector<S, P, R1, R2, R3, T>(
  selectors: [ParametricSelector<S, P, R1>,
              ParametricSelector<S, P, R2>,
              ParametricSelector<S, P, R3>],
  combiner: (res1: R1, res2: R2, res3: R3) => T,
): OutputParametricSelector<S, P, T>;

/* heterogeneous selector parameter types */

/* one selector */
export function createSelector<S1, R1, T>(
  selector1: InstanceSelector<S1, R1>,
  combiner: (res1: R1) => T,
): OutputInstanceSelector<S1, T>;

export function createSelector<S1, R1, T>(
  selector1: Selector<S1, R1>,
  combiner: (res1: R1) => T,
): OutputSelector<S1, T>;

export function createSelector<S1, P1, R1, T>(
  selector1: ParametricInstanceSelector<S1, P1, R1>,
  combiner: (res1: R1) => T,
): OutputParametricInstanceSelector<S1, P1, T>;

export function createSelector<S1, P1, R1, T>(
  selector1: ParametricSelector<S1, P1, R1>,
  combiner: (res1: R1) => T,
): OutputParametricSelector<S1, P1, T>;

/* two selector */
export function createSelector<S1, S2, R1, R2, T>(
  selector1: InstanceSelector<S1, R1>,
  selector2: MaybeInstanceSelector<S2, R2>,
  combiner: (res1: R1, res2: R2) => T,
): OutputInstanceSelector<S1 & S2, T>;
export function createSelector<S1, S2, R1, R2, T>(
  selector1: MaybeInstanceSelector<S1, R1>,
  selector2: InstanceSelector<S2, R2>,
  combiner: (res1: R1, res2: R2) => T,
): OutputInstanceSelector<S1 & S2, T>;

export function createSelector<S1, S2, R1, R2, T>(
  selector1: Selector<S1, R1>,
  selector2: Selector<S2, R2>,
  combiner: (res1: R1, res2: R2) => T,
): OutputSelector<S1 & S2, T>;

export function createSelector<S1, S2, P1, P2, R1, R2, T>(
  selector1: ParametricInstanceSelector<S1, P1, R1>,
  selector2: MaybeParametricInstanceSelector<S2, P2, R2>,
  combiner: (res1: R1, res2: R2) => T,
): OutputParametricInstanceSelector<S1 & S2, P1 & P2, T>;
export function createSelector<S1, S2, P1, P2, R1, R2, T>(
  selector1: MaybeParametricInstanceSelector<S1, P1, R1>,
  selector2: ParametricInstanceSelector<S2, P2, R2>,
  combiner: (res1: R1, res2: R2) => T,
): OutputParametricInstanceSelector<S1 & S2, P1 & P2, T>;

export function createSelector<S1, S2, P1, P2, R1, R2, T>(
  selector1: ParametricSelector<S1, P1, R1>,
  selector2: ParametricSelector<S2, P2, R2>,
  combiner: (res1: R1, res2: R2) => T,
): OutputParametricSelector<S1 & S2, P1 & P2, T>;

/* three selector */
export function createSelector<S1, S2, S3, R1, R2, R3, T>(
  selector1: InstanceSelector<S1, R1>,
  selector2: MaybeInstanceSelector<S2, R2>,
  selector3: MaybeInstanceSelector<S3, R3>,
  combiner: (res1: R1, res2: R2, res3: R3) => T,
): OutputInstanceSelector<S1 & S2 & S3, T>;
export function createSelector<S1, S2, S3, R1, R2, R3, T>(
  selector1: MaybeInstanceSelector<S1, R1>,
  selector2: InstanceSelector<S2, R2>,
  selector3: MaybeInstanceSelector<S3, R3>,
  combiner: (res1: R1, res2: R2, res3: R3) => T,
): OutputInstanceSelector<S1 & S2 & S3, T>;
export function createSelector<S1, S2, S3, R1, R2, R3, T>(
  selector1: MaybeInstanceSelector<S1, R1>,
  selector2: MaybeInstanceSelector<S2, R2>,
  selector3: InstanceSelector<S3, R3>,
  combiner: (res1: R1, res2: R2, res3: R3) => T,
): OutputInstanceSelector<S1 & S2 & S3, T>;

export function createSelector<S1, S2, S3, R1, R2, R3, T>(
  selector1: Selector<S1, R1>,
  selector2: Selector<S2, R2>,
  selector3: Selector<S3, R3>,
  combiner: (res1: R1, res2: R2, res3: R3) => T,
): OutputSelector<S1 & S2 & S3, T>;

export function createSelector<S1, S2, S3, P1, P2, P3, R1, R2, R3, T>(
  selector1: ParametricInstanceSelector<S1, P1, R1>,
  selector2: MaybeParametricInstanceSelector<S2, P2, R2>,
  selector3: MaybeParametricInstanceSelector<S3, P3, R3>,
  combiner: (res1: R1, res2: R2, res3: R3) => T,
): OutputParametricInstanceSelector<S1 & S2 & S3, P1 & P2 & P3, T>;
export function createSelector<S1, S2, S3, P1, P2, P3, R1, R2, R3, T>(
  selector1: MaybeParametricInstanceSelector<S1, P1, R1>,
  selector2: ParametricInstanceSelector<S2, P2, R2>,
  selector3: MaybeParametricInstanceSelector<S3, P3, R3>,
  combiner: (res1: R1, res2: R2, res3: R3) => T,
): OutputParametricInstanceSelector<S1 & S2 & S3, P1 & P2 & P3, T>;
export function createSelector<S1, S2, S3, P1, P2, P3, R1, R2, R3, T>(
  selector1: MaybeParametricInstanceSelector<S1, P1, R1>,
  selector2: MaybeParametricInstanceSelector<S2, P2, R2>,
  selector3: ParametricInstanceSelector<S3, P3, R3>,
  combiner: (res1: R1, res2: R2, res3: R3) => T,
): OutputParametricInstanceSelector<S1 & S2 & S3, P1 & P2 & P3, T>;

export function createSelector<S1, S2, S3, P1, P2, P3, R1, R2, R3, T>(
  selector1: ParametricSelector<S1, P1, R1>,
  selector2: ParametricSelector<S2, P2, R2>,
  selector3: ParametricSelector<S3, P3, R3>,
  combiner: (res1: R1, res2: R2, res3: R3) => T,
): OutputParametricSelector<S1 & S2 & S3, P1 & P2 & P3, T>;

/* array argument */

/* one selector */
export function createSelector<S1, R1, T>(
  selectors: [Selector<S1, R1>],
  combiner: (res1: R1) => T,
): OutputSelector<S1, T>;
export function createSelector<S1, P1, R1, T>(
  selectors: [ParametricSelector<S1, P1, R1>],
  combiner: (res1: R1) => T,
): OutputParametricSelector<S1, P1, T>;

/* two selector */
export function createSelector<S1, S2, R1, R2, T>(
  selectors: [Selector<S1, R1>, Selector<S2, R2>],
  combiner: (res1: R1, res2: R2) => T,
): OutputSelector<S1 & S2, T>;
export function createSelector<S1, S2, P1, P2, R1, R2, T>(
  selectors: [ParametricSelector<S1, P1, R1>, ParametricSelector<S2, P2, R2>],
  combiner: (res1: R1, res2: R2) => T,
): OutputParametricSelector<S1 & S2, P1 & P2, T>;

/* three selector */
export function createSelector<S1, S2, S3, R1, R2, R3, T>(
  selectors: [Selector<S1, R1>, Selector<S2, R2>, Selector<S3, R3>],
  combiner: (res1: R1, res2: R2, res3: R3) => T,
): OutputSelector<S1 & S2 & S3, T>;
export function createSelector<S1, S2, S3, P1, P2, P3, R1, R2, R3, T>(
  selectors: [ParametricSelector<S1, P1, R1>, ParametricSelector<S2, P2, R2>, ParametricSelector<S3, P3, R3>],
  combiner: (res1: R1, res2: R2, res3: R3) => T,
): OutputParametricSelector<S1 & S2 & S3, P1 & P2 & P3, T>;

/* any number of uniform selectors */
export function createSelector<S, R, T>(
  selectors: InstanceSelector<S, R>[],
  combiner: (...res: R[]) => T,
): OutputInstanceSelector<S, T>;
export function createSelector<S, R, T>(
  selectors: Selector<S, R>[],
  combiner: (...res: R[]) => T,
): OutputSelector<S, T>;
export function createSelector<S, P, R, T>(
  selectors: ParametricInstanceSelector<S, P, R>[],
  combiner: (...res: R[]) => T,
): OutputParametricInstanceSelector<S, P, T>;
export function createSelector<S, P, R, T>(
  selectors: ParametricSelector<S, P, R>[],
  combiner: (...res: R[]) => T,
): OutputParametricSelector<S, P, T>;

export function createStructuredSelector<S, T>(
  selectors: {[K in keyof T]: InstanceSelector<S, T[K]>},
): OutputInstanceSelector<S, T>;
export function createStructuredSelector<S, T>(
  selectors: {[K in keyof T]: Selector<S, T[K]>},
): OutputSelector<S, T>;

export function createStructuredSelector<S, P, T>(
  selectors: {[K in keyof T]: ParametricInstanceSelector<S, P, T[K]>},
): ParametricInstanceSelector<S, P, T>;
export function createStructuredSelector<S, P, T>(
  selectors: {[K in keyof T]: ParametricSelector<S, P, T[K]>},
): ParametricSelector<S, P, T>;
