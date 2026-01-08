
'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { getAllSawisReturns, type SawisReturn, deleteSawisReturn } from '@/lib/sawis-actions';
import { format } from 'date-fns';
import { Eye, Trash2, Loader2 } from 'lucide-react';
import { getUserByEmail } from '@/lib/userActions';
import { useEffect, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

const initialState = { success: false, message: '' };

function DeleteButton() {
    const { pending } = useFormStatus();
    return (
        <Button variant="ghost" size="icon" type="submit" disabled={pending} className="text-destructive h-8 w-8">
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </Button>
    )
}

function DeleteForm({ returnId, onDeleted }: { returnId: string, onDeleted: () => void }) {
    const { toast } = useToast();
    const deleteReturnWithId = deleteSawisReturn.bind(null, returnId);
    const [state, formAction] = useFormState(deleteReturnWithId, initialState);

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
            <AlertDialogAction asChild>
                 <DeleteButton />
            </AlertDialogAction>
        </form>
    )
}


export default function SawisHistoryPage() {
    const [returns, setReturns] = useState<SawisReturn[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        setIsLoading(true);
        const producerEmail = localStorage.getItem('userEmail');
        if (producerEmail) {
            const allReturns = await getAllSawisReturns();
            const user = await getUserByEmail(producerEmail);
            const userReturns = user?.role === 'Admin' ? allReturns : allReturns.filter(r => r.producerEmail === producerEmail);
            setReturns(userReturns);
        }
        setIsLoading(false);
    }

    useEffect(() => {
        fetchData();
    }, []);


    return (
        <div className="flex flex-col gap-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">SAWIS Return History</h2>
                <p className="text-muted-foreground">A record of all your past monthly SAWIS submissions.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Submitted Returns</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Month of Return</TableHead>
                                <TableHead>Date Submitted</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {returns.length > 0 ? returns.map(r => (
                                <TableRow key={r.id}>
                                    <TableCell className="font-medium">{r.month}</TableCell>
                                    <TableCell>{format(new Date(r.createdAt), 'PPP')}</TableCell>
                                    <TableCell className="text-right">
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={`/sawis/history/${r.id}`}>
                                                <Eye className="mr-2 h-4 w-4" />
                                                View
                                            </Link>
                                        </Button>
                                         <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="text-destructive h-8 w-8 ml-2"><Trash2 className="h-4 w-4" /></Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>This will permanently delete the return for {r.month}.</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <DeleteForm returnId={r.id} onDeleted={fetchData} />
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center">
                                        No past returns found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
