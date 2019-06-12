import { createCollectionSelector, OutputParametricSelector } from "redux-views";
import { getContactId, getContacts, getSelectedContactId, PropsA, PropsB, State, Contact } from "./test.types";

const areEqual = <T>(a: T, b: T) => a === b;

/////////////////////////////////
/// Doesn't accept primitives ///
/////////////////////////////////

createCollectionSelector(
  getSelectedContactId,
  getSelectedContactId,
  // $ExpectError
  areEqual
);

// Non-instance selectors
const getContact = createCollectionSelector(
  getContacts,
  getContactId,
  (contacts, contactId) => contacts[contactId]
);
// $ExpectType true
type CONTACT_IS_RIGHT = typeof getContact extends OutputParametricSelector<State, PropsA, Contact, any> ? true : false;
