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
  // $ExpectType OutputInstanceSelector<{ selectedContact: string; }, boolean>
  selector;

  // $ExpectType [() => void, () => void]
  selector.use();
}

if (isInstanceSelector(parametricSelector)) {
  // $ExpectType OutputParametricInstanceSelector<{ selectedContact: string; }, PropsA, boolean>
  parametricSelector;
}
