import { createCollectionSelector, OutputParametricSelector } from "redux-views";
import { Contact, getContactId, getContacts, getSelectedContactId, PropsA, State } from "./test.types";

const areEqual = <T>(a: T, b: T) => a === b;

// Doesn't accept primitives
createCollectionSelector(
  getSelectedContactId,
  getSelectedContactId,
  // $ExpectError
  areEqual
);

// Accepts arrays
createCollectionSelector(
  getSelectedContactId,
  getSelectedContactId,
  (id1, id2) => [id1, id2]
);

// The selector yields the correct types
const getContact = createCollectionSelector(
  getContacts,
  getContactId,
  (contacts, contactId) => contacts[contactId]
);
// $ExpectType true
type CONTACT_IS_RIGHT = typeof getContact extends OutputParametricSelector<State, PropsA, Contact, any> ? true : false;
