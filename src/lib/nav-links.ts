// Do NOT import NavLink here. Define it here.
export type NavLink = {
  href: string;
  label: string;
  iconName?: string;
  role?: 'Producer' | 'Admin' | 'Supplier' | 'Mobile Service Provider' | 'Shared';
  subItems?: NavLink[];
};