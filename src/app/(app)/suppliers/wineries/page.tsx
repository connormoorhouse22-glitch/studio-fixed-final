
'use server';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getUsers } from '@/lib/user-actions';

export default async function WineriesPage() {
  const users = await getUsers();
  const producers = users.filter((user) => user.role === 'Producer');

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wineries</CardTitle>
        <CardDescription>A list of all wine producers on the platform.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden lg:table-cell">Contact</TableHead>
              <TableHead className="hidden lg:table-cell">Billing Address</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {producers.map((producer) => (
              <TableRow key={producer.email}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={producer.avatar} data-ai-hint="person face" />
                      <AvatarFallback>{producer.company.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{producer.company}</div>
                      <div className="text-sm text-muted-foreground">{producer.name}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(producer.status)}>{producer.status}</Badge>
                </TableCell>
                 <TableCell className="hidden lg:table-cell">
                    <div className="font-medium">{producer.email}</div>
                    <div className="text-sm text-muted-foreground">{producer.contactNumber}</div>
                 </TableCell>
                 <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{producer.billingAddress}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
