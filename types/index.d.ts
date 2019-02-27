// TypeScript Version: 2.9

/// rereducer
type ReducerLikeFunction<TS, TA, TRet> = (state: TS, action: TA, ...others: any[]) => TRet;
export type Reducer<TS, TA> = (state: TS, action: TA, ...others: any[]) => TS;
type MatcherFunction<TS, TA> = ReducerLikeFunction<TS, TA, boolean>;
type AdvancedRuleDef<TS, TA> = [Matcher<TS, TA>, Reducer<TS, TA>];
type Matcher<TS, TA> = string | MatcherFunction<TS, TA> | MatcherArray<TS, TA>;
interface MatcherArray<TS, TA> extends Array<Matcher<TS, TA>> { }

type SelectWithType<TA, TAType> = TA extends { type: TAType } ? TA : never;
interface ActionWithType {
  type: any;
}
interface ActionWithPayload<P> extends ActionWithType {
  payload: P;
}
export type ActionTypeRuleDef<TS, TA extends ActionWithType> = TA extends { type: infer TAType }
  ? [TAType, Reducer<TS, SelectWithType<TA, TAType>>]
  : AdvancedRuleDef<TS, TA>;

export type RuleDef<TS, TA extends ActionWithType> =
  | ActionTypeRuleDef<TS, TA>
  | AdvancedRuleDef<TS, TA>;

declare function rereducer<TS, TA extends ActionWithType>(initialValue: TS, ...ruleDefs: Array<RuleDef<TS, TA>>): Reducer<TS, TA>;

export default rereducer;

/// assocReducer
type TemplateType<TS, TA, TO> = {
  [K in keyof TO]: TO[K] | ReducerLikeFunction<TS, TA, TO[K]>
};
export function assocReducer<TO, TS extends { [key: string]: TO }, TA>(
  keyGetter: ReducerLikeFunction<TS, TA, string>,
  template: TemplateType<TS, TA, TO> | ReducerLikeFunction<TS, TA, TO>
): Reducer<TS, TA>;

/// subReducer
/* Note: Reducer is of type `unknown | Reducer<unknown, TA>`, but as we don't have unknown because the test runner
 * doesn't support TS3.0 yet, we have to replace this for any, and `any | [...]` is `any`.
 */
type Getter<TS, TA> = string | ReducerLikeFunction<TS, TA, string>;
export function subReducer<TS, TA>(getters: Getter<TS, TA> | Array<Getter<TS, TA>>, reducer: any): Reducer<TS, TA>;

/// concatReducer
export function concatReducer<TS extends any[] | string, TA>(getter: Reducer<TS, TA>): Reducer<TS, TA>;

/// mergeReducer
export function mergeReducer<TS, TA>(reducer: Partial<TS> | ReducerLikeFunction<TS, TA, Partial<TS>>): Reducer<TS, TA>;

/// isType
export function isType<TA extends ActionWithType>(x: TA['type']): MatcherFunction<any, TA>;

/// payload
export function payload(...path: string[]): ReducerLikeFunction<any, ActionWithPayload<any>, any>;

/// getPayload
export function getPayload<TP>(state: any, action: ActionWithPayload<TP>): TP;
