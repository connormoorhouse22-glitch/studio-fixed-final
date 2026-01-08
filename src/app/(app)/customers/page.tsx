import { MoreHorizontal } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function CustomersPage() {
  const customers = [
    {
      name: 'Liam Johnson',
      email: 'liam@example.com',
      avatar: 'https://picsum.photos/40/40?random=1',
      type: 'Lead',
      date: '2023-06-23',
    },
    {
      name: 'Olivia Smith',
      email: 'olivia@example.com',
      avatar: 'https://picsum.photos/40/40?random=2',
      type: 'Customer',
      date: '2023-06-24',
    },
    {
      name: 'Noah Williams',
      email: 'noah@example.com',
      avatar: 'https://picsum.photos/40/40?random=3',
      type: 'Customer',
      date: '2023-06-25',
    },
    {
      name: 'Emma Brown',
      email: 'emma@example.com',
      avatar: 'https://picsum.photos/40/40?random=4',
      type: 'Lead',
      date: '2023-06-26',
    },
    {
      name: 'Oliver Jones',
      email: 'oliver@example.com',
      avatar: 'https://picsum.photos/40/40?random=5',
      type: 'Customer',
      date: '2023-06-27',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customers</CardTitle>
        <CardDescription>Manage your customers and view their sales history.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden w-[100px] sm:table-cell">
                <span className="sr-only">Avatar</span>
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Signed up</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.email}>
                <TableCell className="hidden sm:table-cell">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={customer.avatar} data-ai-hint="person face" />
                    <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="font-medium">
                  <div className="font-medium">{customer.name}</div>
                  <div className="text-sm text-muted-foreground">{customer.email}</div>
                </TableCell>
                <TableCell>
                  <Badge variant={customer.type === 'Customer' ? 'default' : 'secondary'}>{customer.type}</Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">{customer.date}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>View details</DropdownMenuItem>
                      <DropdownMenuItem>Contact</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
