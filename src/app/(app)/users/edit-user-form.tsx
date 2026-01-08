
'use client';

import { useEffect, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { updateUser, getUsers } from '@/lib/user-actions';
import type { User, UpdateUserResponse } from '@/lib/users';
import { DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, EyeOff } from 'lucide-react';

const initialState: UpdateUserResponse = {
  message: '',
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Saving...' : 'Save Changes'}
    </Button>
  );
}

export function EditUserForm({
  user,
  onSuccess,
}: {
  user: User;
  onSuccess: () => void;
}) {
  const [state, formAction] = useFormState(updateUser.bind(null, user.email), initialState);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);


  useEffect(() => {
    setCurrentUserRole(localStorage.getItem('userRole'));
    async function fetchUsers() {
      setIsLoadingUsers(true);
      const users = await getUsers();
      setAllUsers(users);
      setIsLoadingUsers(false);
    }
    fetchUsers();
  }, []);

  useEffect(() => {
    if (state.message === 'Success') {
      onSuccess();
    }
  }, [state, onSuccess]);

  const supplierCompanies = [...new Set(allUsers.filter(u => u.role === 'Supplier').map(u => u.company))].sort();
  const isAdmin = currentUserRole === 'Admin';


  const renderPreferredContacts = () => {
    if (user.role !== 'Producer') return null;

    if (isLoadingUsers) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      );
    }
    
    return (
      <>
        <Separator />
        <h3 className="text-md font-semibold">Preferred Supplier Contacts</h3>
        <div className="space-y-6">
          {supplierCompanies.map(supplierCompany => {
            const supplierContacts = allUsers.filter(u => u.company === supplierCompany);
            const selectedContacts = user.preferredSupplierContacts?.[supplierCompany] || [];
            
            return (
              <div key={supplierCompany} className="grid grid-cols-1 gap-4 rounded-lg border p-4">
                <Label className="font-semibold">{supplierCompany}</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {[0, 1, 2].map(index => {
                        const fieldName = `preferredContact_${supplierCompany}_${index}`;
                        const selectedContact = selectedContacts[index] || 'none';
                        return (
                            <div key={index} className="space-y-1">
                                 <Label htmlFor={fieldName} className="text-xs text-muted-foreground">Contact {index + 1}</Label>
                                <Select name={fieldName} defaultValue={selectedContact}>
                                <SelectTrigger id={fieldName}>
                                    <SelectValue placeholder="Select a contact..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">- None -</SelectItem>
                                    {supplierContacts.map(contact => (
                                    <SelectItem key={contact.email} value={contact.email}>
                                        {contact.name}
                                    </SelectItem>
                                    ))}
                                </SelectContent>
                                </Select>
                            </div>
                        )
                    })}
                </div>
              </div>
            )
          })}
        </div>
      </>
    )
  }

  return (
    <form action={formAction} className="space-y-4 max-h-[70vh] overflow-y-auto pr-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" name="name" defaultValue={user.name} />
        </div>
        <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input id="company" name="company" defaultValue={user.company} />
        </div>
      </div>
       <div className="space-y-2">
        <Label htmlFor="email">Email (cannot be changed)</Label>
        <Input id="email" name="email" defaultValue={user.email} disabled />
      </div>
      
       {isAdmin && (
         <>
          <Separator />
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password (Admin Override)</Label>
             <div className="relative">
                <Input
                    id="newPassword"
                    name="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter new password to override"
                />
                 <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                    >
                    {showPassword ? <EyeOff /> : <Eye />}
                </Button>
            </div>
          </div>
          <Separator />
        </>
      )}

      <div className="grid grid-cols-2 gap-4">
         <div className="space-y-2">
            <Label htmlFor="contactNumber">Contact Number</Label>
            <Input id="contactNumber" name="contactNumber" defaultValue={user.contactNumber} />
        </div>
        <div className="space-y-2">
            <Label htmlFor="vatNumber">VAT Number</Label>
            <Input id="vatNumber" name="vatNumber" defaultValue={user.vatNumber} />
        </div>
      </div>
       <div className="space-y-2">
            <Label htmlFor="billingAddress">Billing Address</Label>
            <Textarea id="billingAddress" name="billingAddress" defaultValue={user.billingAddress} />
        </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select name="role" defaultValue={user.role}>
            <SelectTrigger id="role">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Admin">Admin</SelectItem>
              <SelectItem value="Producer">Producer</SelectItem>
              <SelectItem value="Supplier">Supplier</SelectItem>
              <SelectItem value="Mobile Service Provider">Mobile Service Provider</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select name="status" defaultValue={user.status}>
            <SelectTrigger id="status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
              <SelectItem value="Pending Approval">Pending Approval</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {renderPreferredContacts()}

      {state.message && state.message !== 'Success' && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}
      <DialogFooter className="pt-4 border-t sticky bottom-0 bg-background">
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <SubmitButton />
      </DialogFooter>
    </form>
  );
}
