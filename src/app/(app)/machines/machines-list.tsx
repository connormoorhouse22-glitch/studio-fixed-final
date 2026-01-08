
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, Truck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { getMachines, type Machine } from '@/lib/machine-actions';
import { AddMachineDialog } from './add-machine-dialog';
import { EditMachineDialog } from './edit-machine-dialog';
import { DeleteMachineDialog } from './delete-machine-dialog';
import { Skeleton } from '@/components/ui/skeleton';

function MachinesListSkeleton() {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <Skeleton className="h-6 w-48 mb-2" />
                        <Skeleton className="h-4 w-72" />
                    </div>
                    <Skeleton className="h-10 w-32" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            </CardContent>
        </Card>
    );
}

export function MachinesList() {
    const [machines, setMachines] = useState<Machine[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [serviceProviderCompany, setServiceProviderCompany] = useState<string | null>(null);

    const fetchMachines = useCallback(async () => {
        const company = localStorage.getItem('userCompany');
        if (company) {
            setServiceProviderCompany(company);
            setIsLoading(true);
            const data = await getMachines(company);
            setMachines(data);
            setIsLoading(false);
        } else {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMachines();
    }, [fetchMachines]);
    
    const getStatusVariant = (status: Machine['status']) => {
        switch (status) {
            case 'Operational': return 'default';
            case 'Under Maintenance': return 'secondary';
            case 'Decommissioned': return 'destructive';
            default: return 'outline';
        }
    }
    
    const getStatusClassName = (status: string) => {
        switch (status) {
            case 'Operational': return 'bg-green-500';
            case 'Under Maintenance': return 'bg-yellow-500';
            default: return '';
        }
    }

    if (isLoading) {
        return <MachinesListSkeleton />;
    }

    if (!serviceProviderCompany) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Error</CardTitle>
                    <CardDescription>Could not identify your company. Please log in again.</CardDescription>
                </CardHeader>
            </Card>
        );
    }
    
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Your Machines</CardTitle>
                    <CardDescription>A list of all equipment registered to your company.</CardDescription>
                </div>
                <AddMachineDialog serviceProviderCompany={serviceProviderCompany} onSuccess={fetchMachines} />
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Operator</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="hidden md:table-cell">Specifications</TableHead>
                            <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {machines.length > 0 ? machines.map((machine) => (
                            <TableRow key={machine.id}>
                                <TableCell className="font-medium">{machine.name}</TableCell>
                                <TableCell>{machine.operatorName || 'N/A'}</TableCell>
                                <TableCell>{machine.type}</TableCell>
                                <TableCell>
                                    <Badge variant={getStatusVariant(machine.status)} className={getStatusClassName(machine.status)}>
                                        {machine.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="hidden md:table-cell max-w-sm truncate text-muted-foreground">{machine.specifications}</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                        <Button aria-haspopup="true" size="icon" variant="ghost">
                                            <MoreHorizontal className="h-4 w-4" />
                                            <span className="sr-only">Toggle menu</span>
                                        </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <EditMachineDialog machine={machine} onSuccess={fetchMachines} />
                                            <DropdownMenuSeparator />
                                            <DeleteMachineDialog machineId={machine.id} onSuccess={fetchMachines} />
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    <Truck className="mx-auto h-12 w-12" />
                                    <p className="mt-4">No machines have been added yet.</p>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
