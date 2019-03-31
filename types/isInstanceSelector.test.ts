import { createSelector, isInstanceSelector } from "redux-views";
import { getSelectedContactId, getContactId } from "./test.types";

const areEqual = <T>(a: T, b: T) => a === b;

const selector = createSelector(
  getSelectedContactId,
  getSelectedContactId,
  areEqual
);

const parametricSelector = createSelector(
  getSelectedContactId,
  getContactId,
  areEqual
);

if (isInstanceSelector(selector)) {
  // $ExpectType OutputInstanceSelector<{ selectedContact: string; }, boolean, (res1: string, res2: string) => boolean>
  selector;

  // $ExpectType () => void
  selector.use('id1');
}

if (isInstanceSelector(parametricSelector)) {
  // $ExpectType OutputParametricInstanceSelector<{ selectedContact: string; }, PropsA, boolean, (res1: string, res2: string) => boolean>
  parametricSelector;
}
