
import type { NavLink } from './nav-links'; 

export const staticSupplierLinks: NavLink[] = [
    { href: '/sales/dashboard', label: 'Sales Dashboard', iconName: 'BarChart3' },
    { href: '/products/manage', label: 'Manage Products', iconName: 'Package', subItems: [] },
    { href: '/suppliers/producers', label: 'Wine Producers', iconName: 'UsersRound' },
    { href: '/promotions', label: 'Promotions', iconName: 'TicketPercent'},
    { href: '/services/filtration', label: 'Filtration', iconName: 'Filter' },
];

export const adminLinks: NavLink[] = [
  { href: '/users', label: 'User Management', iconName: 'UsersRound' },
  { href: '/admin/catalog-importer', label: 'Catalog Importer', iconName: 'BookDown' },
  { href: '/admin/contracts', label: 'Contracts', iconName: 'FileText' },
  { href: '/admin/bulk-wine-market', label: 'Bulk Wine Market', iconName: 'Wine' },
  { href: '/settings', label: 'Settings', iconName: 'Settings' },
];
