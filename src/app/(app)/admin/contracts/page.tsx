
'use server';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getUsers } from '@/lib/userActions';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default async function ContractsListPage() {
  const users = await getUsers();
  const suppliers = users.filter((user) => user.role === 'Supplier');

  return (
    <div className="flex flex-col gap-8">
       <Card>
        <CardHeader>
            <CardTitle>Supplier Contracts</CardTitle>
            <CardDescription>Select a supplier to view and download their service agreement.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Supplier</TableHead>
                        <TableHead>Contact Person</TableHead>
                        <TableHead>
                            <span className="sr-only">Actions</span>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {suppliers.map((supplier) => (
                        <TableRow key={supplier.email}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={supplier.avatar} data-ai-hint="person face" />
                                        <AvatarFallback>{supplier.company.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium">{supplier.company}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                 <div>
                                    <div className="font-medium">{supplier.name}</div>
                                    <div className="text-sm text-muted-foreground">{supplier.email}</div>
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                                <Button asChild variant="outline">
                                    <Link href={`/admin/contracts/${encodeURIComponent(supplier.email)}`}>
                                        <FileText className="mr-2 h-4 w-4" />
                                        View Contract
                                    </Link>
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
       </Card>
    </div>
  );
}
