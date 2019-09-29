import { createSelector, OutputParametricSelector } from 'redux-views'
import {
  getSelectedContactId,
  getContactId,
  getContacts,
  getCompanies,
  getCompanyId,
  State,
  PropsA,
  PropsB
} from './test.types'
import { contactIdSelector } from './createIdSelector.test'

const areEqual = <T>(a: T, b: T) => a === b

//////////////////////////////
/// Homogenous state/props ///
//////////////////////////////

// $ExpectType OutputSelector<{ selectedContact: string; }, boolean, (res1: string, res2: string) => boolean>
createSelector(
  [getSelectedContactId, getSelectedContactId],
  areEqual
)

// $ExpectType OutputParametricSelector<{ selectedContact: string; }, PropsA, boolean, (res1: string, res2: string) => boolean>
createSelector(
  [getSelectedContactId, getContactId],
  areEqual
)

// $ExpectType OutputParametricSelector<{ selectedContact: string; }, PropsA, boolean, (res1: string, res2: string) => boolean>
createSelector(
  [getSelectedContactId, contactIdSelector],
  areEqual
)

////////////////////////////////
/// Heterogenous state/props ///
////////////////////////////////

// Non-instance selectors
const getContact = createSelector(
  [getContacts, getContactId],
  (contacts, contactId) => contacts[contactId]
)
const getCompany = createSelector(
  [getCompanies, getCompanyId],
  (company, companyId) => company[companyId]
)

const companyHasContact = createSelector(
  [getContact, getCompany],
  (contact, company) => company.employees.indexOf(contact.name) >= 0
)
// $ExpectType true
type CHC_IS_RIGHT = typeof companyHasContact extends OutputParametricSelector<
  State,
  PropsA & PropsB,
  boolean,
  any
>
  ? true
  : false
