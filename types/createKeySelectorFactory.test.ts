import { createKeyedSelectorFactory, KeyedSelectorFactory, InstanceSelector, ParametricInstanceSelector } from "redux-views";
import { getContacts, getSelectedContactId, getContactId, state, State, Contact, PropsA } from "./test.types";

const contactSelectorFactory = createKeyedSelectorFactory(
  getContacts,
  (contacts, key) => contacts[key]
);
// $ExpectType true
type CSF_IS_RIGHT = typeof contactSelectorFactory extends KeyedSelectorFactory<State, Contact> ? true : false;

export const getSelectedContact = contactSelectorFactory(getSelectedContactId);
// $ExpectType true
type GSC_IS_RIGHT = typeof getSelectedContact extends InstanceSelector<State, Contact> ? true : false;

export const getContactById = contactSelectorFactory(getContactId);
// $ExpectType true
type GCBID_IS_RIGHT = typeof getContactById extends ParametricInstanceSelector<State, PropsA, Contact> ? true : false;

// $ExpectType Contact
const contact = getSelectedContact(state);
