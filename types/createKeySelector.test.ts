import { createKeySelector } from "redux-views";
import { getSelectedContactId, getContactId } from "./test.types";

// $ExpectType InstanceSelector<{ selectedContact: string; }, string>
export const selectedContactIdSelector = createKeySelector(getSelectedContactId);

// $ExpectType ParametricInstanceSelector<unknown, PropsA, string>
export const contactIdSelector = createKeySelector(getContactId);
