
'use server';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Box, Beaker } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { type WineryVessel } from '@/lib/cellar-actions';
import { Badge } from '@/components/ui/badge';

export async function VesselsList({ vessels }: { vessels: WineryVessel[] }) {

    if (vessels.length === 0) {
        return (
            <div className="text-center text-muted-foreground py-10">
                <Beaker className="mx-auto h-12 w-12" />
                <p className="mt-4">You have not defined any vessels yet.</p>
                <p className="text-sm">Click "Add Vessel" to set up your cellar tanks and barrels.</p>
            </div>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Name / Code</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Capacity / Size</TableHead>
                    <TableHead>Current Contents</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {vessels.map(vessel => (
                    <TableRow key={vessel.id}>
                        <TableCell className="font-medium">{vessel.name}</TableCell>
                        <TableCell>
                            <Badge variant={vessel.type === 'SS-Tank' ? 'default' : 'secondary'}>{vessel.type}</Badge>
                        </TableCell>
                        <TableCell>
                            {vessel.capacityLitres.toLocaleString()} L
                            {vessel.type === 'Barrel Group' && ` (${vessel.barrelCount || 0} barrels)`}
                        </TableCell>
                        <TableCell>{vessel.currentContents}</TableCell>
                        <TableCell className="text-right">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem disabled>Edit</DropdownMenuItem>
                                    <DropdownMenuItem disabled className="text-destructive">Delete</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
