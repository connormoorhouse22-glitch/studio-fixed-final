
export type User = {
  name: string;
  email: string;
  company: string;
  role: string;
  status: string;
  avatar: string;
  lastLogin: string;
  isOnline?: boolean;
  lastSeen?: string;
  pricingTiers: { [supplierCompany: string]: 'Tier 1' | 'Tier 2' | 'Tier 3' | 'Tier 4' | 'Tier 5' | 'Tier 6' };
  preferredSupplierContacts?: { [supplierCompany: string]: string[] }; // Maps supplier company to a list of contact emails
  billingAddress: string;
  vatNumber?: string;
  contactNumber: string;
  services?: ('Mobile Bottling' | 'Mobile Labelling' | 'Meeting Room')[];
  filtrationOptions?: string[];
  signatureUrl?: string;
};

export interface UpdateUserResponse {
  message: string;
}
