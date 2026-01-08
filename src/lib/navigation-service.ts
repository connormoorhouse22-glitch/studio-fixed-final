
'use server';

import type { NavLink as BaseNavLink } from './nav-links';
import { getUsers } from './user-actions';
import { bottleSuppliers, dryGoodsSuppliers, wineAdditionsSuppliers } from './constants';

// Helper to create a URL-friendly slug
const toSlug = (str: string) =>
  str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-\/]/g, '');

export type NavLink = BaseNavLink & {
  contactEmail?: string;
  subCategoryContext?: string;
  parentLabel?: string;
};

// Main function to generate navigation links
export async function generateNavLinks(): Promise<NavLink[]> {
  const allUsers = await getUsers();
  const userEmailMap = new Map<string, string>();
  allUsers.forEach(u => userEmailMap.set(u.company, u.email));

  // --- Base Dashboards ---
  const producerDashboard: NavLink = {
      href: '/producer/dashboard',
      label: 'Procurement Dashboard',
      iconName: 'LayoutDashboard',
      role: 'Producer',
  };

  const adminDashboard: NavLink = {
      href: '/admin/dashboard',
      label: 'Platform Pulse',
      iconName: 'Activity',
      role: 'Admin',
  };

  // --- Shared & Producer Links ---
  const producerAndSharedLinks: NavLink[] = [
    producerDashboard,
    {
      href: '/products/dry-goods/all',
      label: 'Dry Goods',
      iconName: 'Package',
      role: 'Producer',
      subItems: [
        { href: '/products/dry-goods/all', label: 'All Dry Goods' },
        { 
            href: '/products/dry-goods/bottles/all', 
            label: 'Bottles',
            subItems: [
                { href: '/products/dry-goods/bottles/all', label: 'All Bottles' },
                ...Object.entries(bottleSuppliers).map(([supplier, subCategories]) => ({
                    href: `/products/dry-goods/bottles/${toSlug(supplier)}/all`,
                    label: supplier,
                    contactEmail: userEmailMap.get(supplier),
                    subCategoryContext: 'Bottles',
                    subItems: subCategories.map(subCategory => ({
                        href: `/products/dry-goods/bottles/${toSlug(supplier)}/${toSlug(subCategory)}`,
                        label: subCategory,
                        parentLabel: supplier,
                        contactEmail: userEmailMap.get(supplier),
                        subCategoryContext: subCategory,
                    })),
                })),
            ]
        },
        ...Object.entries(dryGoodsSuppliers).map(([category, suppliers]) => ({
            href: `/products/dry-goods/${toSlug(category)}/all`,
            label: category,
            subItems: suppliers.sort().map(supplier => ({
                href: `/products/dry-goods/${toSlug(category)}/${toSlug(supplier)}`,
                label: supplier,
                parentLabel: supplier,
                contactEmail: userEmailMap.get(supplier),
                subCategoryContext: category,
            })),
        })),
      ]
    },
    {
      href: '/products/wine-additions/all',
      label: 'Wine Additions',
      iconName: 'FlaskConical',
      role: 'Producer',
      subItems: [
        { href: '/products/wine-additions/all', label: 'All Wine Additions' },
        ...Object.entries(wineAdditionsSuppliers).map(([supplier, categories]) => ({
          href: `/products/wine-additions/${toSlug(supplier)}/all`,
          label: supplier,
          contactEmail: userEmailMap.get(supplier),
          subItems: categories.sort().map(category => ({
              href: `/products/wine-additions/${toSlug(supplier)}/${toSlug(category)}`,
              label: category,
              parentLabel: supplier,
              contactEmail: userEmailMap.get(supplier),
          })),
        })),
      ],
    },
    {
      href: '#',
      label: 'Mobile Services',
      iconName: 'Truck',
      role: 'Producer',
      subItems: [
        { href: '/services/mobile-bottling', label: 'Mobile Bottling' },
        { href: '/services/mobile-labelling', label: 'Mobile Labelling' },
      ],
    },
      {
        href: '#',
        label: 'Product Build',
        iconName: 'Hammer',
        role: 'Producer',
        subItems: [
          { href: '/products/build', label: 'Build a New Product' },
          { href: '/products/build/completed', label: 'View Completed Products' },
        ],
      },
      { href: '/bulk-wine-market', label: 'Bulk Wine Market', iconName: 'Wine', role: 'Producer' },
      { href: '/inventory', label: 'Dry Goods Inventory', iconName: 'Boxes', role: 'Producer' },
      {
        href: '#',
        label: 'Cellar Operations',
        iconName: 'Building',
        role: 'Producer',
        subItems: [
          { href: '/cellar-ops/vessels', label: 'Manage Vessels' },
          { href: '/cellar-ops/inventory', label: 'Additions Inventory' },
          { href: '/cellar-ops/activity-log', label: 'Activity Log' },
        ],
      },
      {
        href: '/qr-codes/request',
        label: 'QR Codes',
        iconName: 'ScanLine',
        role: 'Producer',
      },
      {
        href: '#',
        label: 'SAWIS',
        iconName: 'ClipboardList',
        role: 'Producer',
        subItems: [
          { href: '/sawis/returns', label: 'SAWIS 5,6,7 Return' },
          { href: '/sawis/delivery-records', label: 'Delivery Records' },
          { href: '/sawis/history', label: 'Return History' },
        ],
      },
      { href: '/diary', label: 'Diary', iconName: 'BookUser', role: 'Shared' },
      { href: '/suppliers', label: 'Suppliers', iconName: 'Building2', role: 'Producer' },
       {
        href: '/quotes',
        label: 'Quotes',
        iconName: 'FileText',
        role: 'Producer',
        subItems: [
            { href: '/quotes/request', label: 'Request a New Quote' },
            { href: '/quotes', label: 'My Quote Requests' },
        ]
       },
       {
        href: '#',
        label: 'Calculators',
        iconName: 'Calculator',
        role: 'Producer',
        subItems: [
            { href: '/calculators/so2-additions', label: 'SO₂ Additions' },
        ]
       },
       { href: '/fx', label: 'Forex', iconName: 'Landmark', role: 'Producer' },
       { href: '/red-flag-zone', label: 'Red Flag Zone', iconName: 'ShieldAlert', role: 'Shared' }
  ];

  // --- Links for 'Supplier' and 'Mobile Service Provider' roles ---
  const supplierServiceProviderLinks: NavLink[] = [
    { href: '/sales/dashboard', label: 'Sales Dashboard', iconName: 'BarChart3', role: 'Supplier' },
    { href: '/products/manage', label: 'Manage Products', iconName: 'Package', role: 'Supplier' },
    { href: '/suppliers/producers', label: 'Wine Producers', iconName: 'UsersRound', role: 'Supplier' },
    { href: '/promotions', label: 'Promotions', iconName: 'TicketPercent', role: 'Supplier' },
    {
      href: '/suppliers/orders',
      label: 'Orders',
      iconName: 'ShoppingBasket',
      role: 'Supplier',
      subItems: [
        { href: '/suppliers/orders', label: 'All Incoming Orders' },
        { href: '/quotes/requests', label: 'Incoming Quote Requests' },
      ]
    },
    { href: '/bookings/calendar', label: 'Bookings Calendar', iconName: 'CalendarDays', role: 'Mobile Service Provider' },
    { href: '/machines', label: 'Machines', iconName: 'Truck', role: 'Mobile Service Provider' },
    { href: '/services/filtration', label: 'Filtration Setup', iconName: 'Filter', role: 'Mobile Service Provider' }
  ];


  // --- Admin Specific Links ---
   const adminSpecificLinks: NavLink[] = [
    adminDashboard,
    { href: '/admin/all-orders', label: 'All Orders', iconName: 'ShoppingBasket' },
    { href: '/admin/audit-log', label: 'Audit Log', iconName: 'History' },
    { href: '/users', label: 'User Management', iconName: 'UsersRound' },
    { href: '/admin/sawis-analytics', label: 'SAWIS Analytics', iconName: 'BarChart' },
    { href: '/admin/catalog-importer', label: 'Catalog Importer', iconName: 'BookDown' },
    { href: '/admin/contracts', label: 'Contracts', iconName: 'FileText' },
    { href: '/admin/red-flag-zone', label: 'Red Flag Zone', iconName: 'ShieldAlert' },
    { href: '/admin/bulk-wine-market', label: 'Bulk Wine Market', iconName: 'Wine' },
    { href: '/admin/promotions', label: 'Promotions', iconName: 'TicketPercent' },
    { href: '/admin/calendar-demo', label: 'Calendar Demo', iconName: 'Beaker' },
    { href: '/admin/firestore-status', label: 'Firestore Status', iconName: 'Database' },
    { href: '/upload', label: 'Upload Media', iconName: 'Upload' },
    { href: '/settings', label: 'Settings', iconName: 'Settings' },
  ];
  
  // Combine all links for the final output
  const finalLinks: NavLink[] = [
    ...producerAndSharedLinks,
    ...supplierServiceProviderLinks,
    ...adminSpecificLinks.map(l => ({ ...l, role: 'Admin' as const })),
  ];
  
  return finalLinks;
}

export type { BaseNavLink };
