
'use client';

import { useEffect, useOptimistic, useTransition } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { deleteOffender, type Offender, type OffenderActionResponse } from '@/lib/offender-actions';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2, ShieldAlert, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { EditOffenderDialog } from './edit-offender-dialog';


const initialState: OffenderActionResponse = {
  success: false,
  message: '',
};

function DeleteButton() {
    const { pending } = useFormStatus();
    return (
        <Button variant="ghost" size="icon" type="submit" disabled={pending} className="text-destructive hover:text-destructive">
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </Button>
    )
}

function DeleteForm({ offenderId, onDeleted }: { offenderId: string, onDeleted: () => void }) {
    const { toast } = useToast();
    const [state, formAction] = useFormState(deleteOffender, initialState);

     useEffect(() => {
        if (state.message) {
            if (state.success) {
                toast({ title: 'Success', description: state.message });
                onDeleted();
            } else {
                 toast({ variant: 'destructive', title: 'Error', description: state.message });
            }
        }
    }, [state, toast, onDeleted]);

    return (
        <form action={formAction}>
            <input type="hidden" name="offenderId" value={offenderId} />
            <DeleteButton />
        </form>
    )
}


interface OffenderListAdminProps {
    offenders: Offender[];
    onUpdate: () => void;
}

export function OffenderListAdmin({ offenders, onUpdate }: OffenderListAdminProps) {
    if (offenders.length === 0) {
        return (
            <div className="text-center text-muted-foreground py-10">
                <ShieldAlert className="mx-auto h-12 w-12" />
                <p className="mt-4">The Red Flag Zone is currently empty.</p>
            </div>
        )
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telephone</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Flagged By</TableHead>
                    <TableHead>Date Added</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {offenders.slice().reverse().map(item => (
                    <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.company}</TableCell>
                        <TableCell>{item.email}</TableCell>
                        <TableCell>{item.telephone}</TableCell>
                        <TableCell className="max-w-xs truncate">{item.reason}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{item.reportedBy}</TableCell>
                        <TableCell>{format(new Date(item.dateAdded), 'PPP')}</TableCell>
                        <TableCell className="text-right">
                           <div className="flex justify-end items-center">
                             <EditOffenderDialog offender={item} onSuccess={onUpdate} />
                             <DeleteForm offenderId={item.id} onDeleted={onUpdate} />
                           </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
