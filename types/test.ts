import { createSelector, InstanceSelector } from './index';

type State = string;

const selector: InstanceSelector<any, any> = ((state: State) => state) as any;
const selector2 = (state: State) => state;

const myNormalSelector = createSelector(
    selector2,
    selector2,
    state => 'foo'
);

const myMixedSelector = createSelector(
    selector2,
    selector,
    state => 'foo'
);

const myInstanceSelector = createSelector(
    selector,
    selector,
    state => 'foo'
);
