export interface Contact {
  name: string;
}

export interface Company {
  employees: Array<string>;
}

export interface State {
  contacts: {
    [key: string]: Contact
  };
  companies: {
    [key: string]: Company
  };
  selectedContact: string;
}

export interface PropsA {
  contactId: string;
}
export interface PropsB {
  companyId: string;
}

export const getContactId = (_: unknown, { contactId }: PropsA) => contactId;
export const getSelectedContactId = ({ selectedContact }: { selectedContact: State['selectedContact'] }) => selectedContact;
export const getContacts = ({ contacts }: { contacts: State['contacts'] }) => contacts;

export const getCompanyId = (_: unknown, { companyId }: PropsB) => companyId;
export const getCompanies = ({ companies }: { companies: State['companies'] }) => companies;

export const state: State = null as any;
