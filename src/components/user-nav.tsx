
'use client';

import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getUserByEmail } from '@/lib/user-actions';
import type { User } from '@/lib/users';
import { signOut } from '@/lib/auth-actions';
import { Skeleton } from './ui/skeleton';

export function UserNav() {
  const [user, setUser] = useState<User | null>(null);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // This effect ensures localStorage is only accessed on the client
    // after the initial render is complete, preventing hydration mismatch.
    setIsClient(true);
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
      getUserByEmail(userEmail).then(userData => {
        setUser(userData);
        if (userData) {
          // Store user name for other components to use
          localStorage.setItem('userName', userData.name);
        }
      });
    }
  }, []);

  const handleLogout = async () => {
    // Clear client-side storage
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userCompany');
    localStorage.removeItem('userName');

    // Clear server-side session (cookies)
    await signOut();
    
    // Redirect to home
    router.push('/');
  };

  // Render a placeholder on the server and during the initial client render
  // to avoid hydration errors.
  if (!isClient) {
    return <Skeleton className="h-10 w-10 rounded-full" />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.avatar || "https://picsum.photos/40/40"} alt="User avatar" data-ai-hint="person face" />
            <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.name || 'User'}</p>
            <p className="text-xs leading-none text-muted-foreground">{user?.email || 'user@example.com'}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/settings">Settings</Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
