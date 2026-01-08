
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { File, Search, Package, ShoppingBasket, Users, Wine } from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { DialogTitle } from '@/components/ui/dialog';
import { Button } from './ui/button';
import { getSearchableData, type SearchableData } from '@/lib/search-service';

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<SearchableData | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      const searchableData = await getSearchableData();
      setData(searchableData);
    }
    fetchData();
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  if (!data) return null;

  return (
    <>
      <Button
        variant="outline"
        className="relative h-10 w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
        onClick={() => setOpen(true)}
      >
        <Search className="absolute left-2.5 top-2.5 h-4 w-4" />
        <span className="hidden lg:inline-flex">Search...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
         <DialogTitle className="sr-only">Global Search</DialogTitle>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          
          {data.users.length > 0 && (
            <CommandGroup heading="Users">
              {data.users.map((user) => (
                <CommandItem
                  key={user.email}
                  value={`User ${user.name} ${user.company} ${user.email}`}
                  onSelect={() => runCommand(() => router.push(`/users#${user.email}`))}
                >
                  <Users className="mr-2 h-4 w-4" />
                  <span>{user.name}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{user.company}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {data.products.length > 0 && (
             <CommandGroup heading="Products">
              {data.products.map((product) => (
                <CommandItem
                  key={product.id}
                  value={`Product ${product.name} ${product.supplier} ${product.description}`}
                  onSelect={() => runCommand(() => router.push(`/products/dry-goods/${product.category.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}/${product.supplier.toLowerCase().replace(/ /g, '-')}#${product.id}`))}
                >
                  <Package className="mr-2 h-4 w-4" />
                  <span>{product.name}</span>
                   <span className="ml-2 text-xs text-muted-foreground">by {product.supplier}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {data.orders.length > 0 && (
            <CommandGroup heading="Orders">
                {data.orders.map((order) => (
                    <CommandItem
                    key={order.id}
                    value={`Order ${order.orderNumber} ${order.producerCompany} ${order.supplierCompany}`}
                    onSelect={() => runCommand(() => router.push(`/orders/${order.id}#${order.id}`))}
                    >
                    <ShoppingBasket className="mr-2 h-4 w-4" />
                    <span>Order #{order.orderNumber}</span>
                     <span className="ml-2 text-xs text-muted-foreground">{order.producerCompany}</span>
                    </CommandItem>
                ))}
            </CommandGroup>
           )}

           {data.bulkListings.length > 0 && (
                <CommandGroup heading="Bulk Wine Market">
                    {data.bulkListings.map((listing) => (
                        <CommandItem
                        key={listing.id}
                        value={`Bulk ${listing.vintage} ${listing.cultivar} ${listing.producer}`}
                        onSelect={() => runCommand(() => router.push(`/bulk-wine-market#${listing.id}`))}
                        >
                        <Wine className="mr-2 h-4 w-4" />
                        <span>{listing.vintage} {listing.cultivar}</span>
                        <span className="ml-2 text-xs text-muted-foreground">from {listing.producer}</span>
                        </CommandItem>
                    ))}
                </CommandGroup>
           )}
           
        </CommandList>
      </CommandDialog>
    </>
  );
}
