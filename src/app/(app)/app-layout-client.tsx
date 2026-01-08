'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, ShoppingCart, MessageSquare, LayoutDashboard, Package, UsersRound, TicketPercent, ShoppingBasket, Truck, Hammer, Wine, Boxes, Building, ScanLine, ClipboardList, BookUser, Building2, FileText, Calculator, Landmark, ShieldAlert, Activity, History, Users, Database, Beaker, Filter, CalendarDays, BarChart3, Upload, Settings, BookDown, FlaskConical } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import * as Icons from 'lucide-react';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarSeparator,
  SidebarInset,
  SidebarMenuSub,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import { UserNav } from '@/components/user-nav';
import { Logo } from '@/components/logo';
import { generateNavLinks, type NavLink } from '@/lib/navigation-service';
import { cn } from '@/lib/utils';
import { CartSheet } from '@/components/cart-sheet';
import { useCart, CartProvider } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { LiveClock } from '@/components/live-clock';
import { SpecialOffersWidget } from '@/components/promotions-sidebar-widget';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { PresenceUpdater } from '@/components/presence-updater';
import { GlobalSearch } from '@/components/global-search';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const getIcon = (name?: string): React.ComponentType | null => {
  if (!name) return null;
  const Icon = (Icons as any)[name];
  return Icon || null;
};

function isLinkActive(link: NavLink, pathname: string): boolean {
  if (link.href && link.href !== '#' && pathname.startsWith(link.href)) {
    return true;
  }
  if (link.subItems && link.subItems.length > 0) {
    return link.subItems.some(subItem => isLinkActive(subItem, pathname));
  }
  return false;
}

const generateMailtoLink = (email: string, producerName: string | null, supplierName: string) => {
  const subject = `Procurement via WineSpace SA Platform`;
  const producer = producerName || 'A Wine Producer';
  const emailTemplates = [
    `Dear ${supplierName},\n\nOur company will now be exclusively using the WineSpace SA platform for sourcing. Please contact info@winespace.co.za to onboard.\n\nKind regards,\n\n${producer}`
  ];
  const body = emailTemplates[0];
  return `mailto:${email}?cc=info@winespace.co.za&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userCompany, setUserCompany] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [navLinks, setNavLinks] = useState<NavLink[]>([]);
  const { cart } = useCart();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setUserRole(localStorage.getItem('userRole'));
    setUserCompany(localStorage.getItem('userCompany'));
    setUserName(localStorage.getItem('userName'));
    async function buildNav() {
        const links = await generateNavLinks();
        setNavLinks(links);
    }
    buildNav();
  }, []);

  const renderNavLinks = (links: NavLink[], isSubMenu = false) => {
    return links.map((link, index) => {
       const isActive = isLinkActive(link, pathname);
       const Icon = getIcon(link.iconName);
       const uniqueKey = `${link.href}-${link.label}-${index}`;
       
      if (link.subItems && link.subItems.length > 0) {
        return (
          <SidebarMenuItem key={uniqueKey} asChild>
            <Collapsible>
              <CollapsibleTrigger asChild>
                    <SidebarMenuButton variant="ghost" className="!justify-between" isActive={isActive}>
                        <div className="flex items-center gap-2">
                            {Icon && <Icon className="h-4 w-4" />}
                            <span>{link.label}</span>
                        </div>
                        <ChevronDown className="h-4 w-4" />
                    </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>{renderNavLinks(link.subItems, true)}</SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>
          </SidebarMenuItem>
        );
      }
      
      return (
        <SidebarMenuItem key={uniqueKey}>
          <SidebarMenuButton asChild isActive={isActive}>
            <Link href={link.href || '#'}>
              {Icon && <Icon className="h-4 w-4" />}
              <span>{link.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    });
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar className="border-r">
        <SidebarHeader><Logo /></SidebarHeader>
        {userRole === 'Producer' && <SpecialOffersWidget />}
        <SidebarContent>
          <div className="px-6 py-4">
              <p className="text-lg font-bold">{userCompany || 'WineSpace'}</p>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{userRole} Portal</p>
          </div>
          <SidebarSeparator />
          <SidebarMenu>
            {renderNavLinks(navLinks.filter(l => l.role === userRole || l.role === 'Shared'))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/95 px-8 backdrop-blur">
          <GlobalSearch />
          <div className="flex items-center gap-4">
             {userRole === 'Producer' && (
              <CartSheet>
                  <Button variant="outline" size="icon" className="relative">
                      <ShoppingCart className="h-5 w-5" />
                      {cart.length > 0 && (
                          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                              {cart.length}
                          </span>
                      )}
                  </Button>
              </CartSheet>
            )}
            {isClient && <UserNav />}
          </div>
        </header>

        {/* MAIN CONTENT CENTERING FIX */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl p-6 md:p-12">
            {children}
          </div>
        </main>
        <LiveClock />
      </div>
    </div>
  );
}

export function AppLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <FirebaseClientProvider>
        <PresenceUpdater />
        <CartProvider>
            <SidebarProvider>
                <AppLayoutContent>{children}</AppLayoutContent>
            </SidebarProvider>
        </CartProvider>
    </FirebaseClientProvider>
  );
}