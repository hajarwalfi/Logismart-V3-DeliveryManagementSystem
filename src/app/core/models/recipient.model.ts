export interface Recipient {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
}

export interface RecipientCreate {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
}
