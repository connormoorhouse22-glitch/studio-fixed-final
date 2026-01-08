
'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getUsers } from '@/lib/userActions';
import { EditTierDialog } from './edit-tier-dialog';

async function handleTierUpdate() {
    'use server';
    revalidatePath('/suppliers/producers');
}


export default async function ProducersPage() {
  const cookieStore = cookies();
  // Correctly decode the company name to handle spaces and special characters.
  const supplierCompany = cookieStore.get('userCompany')?.value ? decodeURIComponent(cookieStore.get('userCompany')!.value) : undefined;


  if (!supplierCompany) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Error</CardTitle>
                <CardDescription>Could not identify the logged-in supplier. Please try logging in again.</CardDescription>
            </CardHeader>
        </Card>
    )
  }
  
  const users = await getUsers();
  const producers = users.filter((user) => user.role === 'Producer');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wine Producers</CardTitle>
        <CardDescription>Manage your pricing tiers for producer customers.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producer</TableHead>
              <TableHead>Your Assigned Pricing Tier</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {producers.map((producer) => {
              const assignedTier = producer.pricingTiers?.[supplierCompany] || producer.pricingTiers?.default || 'Tier 1';
              return (
              <TableRow key={producer.email}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={producer.avatar} data-ai-hint="person face" />
                      <AvatarFallback>{producer.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{producer.company}</div>
                      <div className="text-sm text-muted-foreground">{producer.name}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                    <Badge variant="secondary">{assignedTier}</Badge>
                </TableCell>
                <TableCell className="text-right">
                    <EditTierDialog user={producer} supplierCompany={supplierCompany} onSuccess={handleTierUpdate} />
                </TableCell>
              </TableRow>
            )})}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
