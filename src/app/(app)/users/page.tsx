
'use server';

import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getUsers, approveUser } from '@/lib/user-actions';
import { ApproveUserButton } from './approve-user-button';
import { DeleteUserDialog } from './delete-user-dialog';
import { EditUserDialog } from './edit-user-dialog';
import { revalidatePath } from 'next/cache';
import { InviteUserDialog } from './invite/invite-user-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { formatDistanceToNowStrict, isValid } from 'date-fns';

async function handleUserUpdate() {
    'use server';
    revalidatePath('/users');
}

export default async function UsersPage() {
  const users = await getUsers();

  const getRoleVariant = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'default';
      case 'Producer':
        return 'secondary';
      case 'Supplier':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
        case 'Active':
            return 'default';
        case 'Pending Approval':
            return 'secondary';
        case 'Inactive':
            return 'destructive'
        default:
            return 'outline'
    }
  }

  const isUserOnline = (lastSeen?: string) => {
    if (!lastSeen) return false;
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return new Date(lastSeen) > fiveMinutesAgo;
  };
  
  const getLastSeenText = (lastSeen?: string) => {
    if (!lastSeen || !isValid(new Date(lastSeen))) {
        return 'Offline';
    }
    const isOnline = isUserOnline(lastSeen);
    const timeAgo = formatDistanceToNowStrict(new Date(lastSeen));
    return isOnline ? `Online (last seen ${timeAgo} ago)` : `Offline (last seen ${timeAgo} ago)`;
  };


  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Manage user accounts, roles, and permissions.</CardDescription>
        </div>
        <InviteUserDialog onSuccess={handleUserUpdate} />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden lg:table-cell">Default Tier</TableHead>
              <TableHead className="hidden lg:table-cell">Contact</TableHead>
              <TableHead className="hidden lg:table-cell">Billing Address</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const isOnline = isUserOnline(user.lastSeen);
              return (
              <TableRow key={user.email} id={user.email}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                        <Avatar className="h-9 w-9">
                            <AvatarImage src={user.avatar} data-ai-hint="person face" />
                            <AvatarFallback>{user.name?.charAt(0) || user.company?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                     <span className={cn(
                                        "absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-background",
                                        isOnline ? "bg-green-500" : "bg-gray-400"
                                     )} />
                                </TooltipTrigger>
                                <TooltipContent>
                                    {getLastSeenText(user.lastSeen)}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{user.company}</TableCell>
                <TableCell>
                  <Badge variant={getRoleVariant(user.role)}>{user.role}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(user.status)}>{user.status}</Badge>
                </TableCell>
                 <TableCell className="hidden lg:table-cell">{user.pricingTiers?.default || 'Tier 1'}</TableCell>
                 <TableCell className="hidden lg:table-cell">
                    <div className="font-medium">{user.contactNumber}</div>
                    {user.vatNumber && <div className="text-sm text-muted-foreground">VAT: {user.vatNumber}</div>}
                 </TableCell>
                 <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{user.billingAddress}</TableCell>
                <TableCell>
                   <div className="flex items-center justify-end gap-2">
                    {user.status === 'Pending Approval' && (
                        <form action={approveUser.bind(null, user.email)}>
                            <ApproveUserButton />
                        </form>
                    )}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <EditUserDialog user={user} onSuccess={handleUserUpdate} />
                        <DropdownMenuSeparator />
                        <DeleteUserDialog user={user} onSuccess={handleUserUpdate} />
                        </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            )})}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
