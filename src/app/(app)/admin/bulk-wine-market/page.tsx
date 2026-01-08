
'use server';

import { cookies } from 'next/headers';
import Link from 'next/link';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import { getBulkWineListings } from '@/lib/bulk-wine-actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { DeleteListingDialog } from '../../bulk-wine-market/delete-listing-dialog';

// This page is now a self-contained admin view for the bulk wine market.

export default async function AdminBulkWineMarketPage() {
  const listings = await getBulkWineListings();
  const cookieStore = cookies();
  const userRole = cookieStore.get('userRole')?.value;
  const isAdmin = userRole === 'Admin';

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Bulk Wine Market Management</h2>
          <p className="text-muted-foreground">
            Review and manage all producer listings.
          </p>
        </div>
        <Button asChild>
            <Link href="/bulk-wine-market/new">
              <PlusCircle className="mr-2 h-4 w-4" /> List Wine for Producer
            </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Listings</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producer</TableHead>
                <TableHead>Cultivar</TableHead>
                <TableHead>Vintage</TableHead>
                <TableHead className="text-right">Litres</TableHead>
                <TableHead className="text-right">Price / Litre</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>IPW</TableHead>
                <TableHead>WIETA</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listings.length > 0 ? listings.slice().reverse().map((listing) => (
                <TableRow key={listing.id} id={listing.id}>
                  <TableCell className="font-medium">{listing.producer}</TableCell>
                  <TableCell>{listing.cultivar}</TableCell>
                  <TableCell>{listing.vintage}</TableCell>
                  <TableCell className="text-right">{listing.litres.toLocaleString()}</TableCell>
                  <TableCell className="text-right">ZAR {listing.pricePerLitre.toFixed(2)}</TableCell>
                  <TableCell>{listing.region}</TableCell>
                  <TableCell>
                    <Badge variant={listing.ipw === 'Yes' ? 'default' : 'secondary'}>{listing.ipw}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={listing.wieta === 'Yes' ? 'default' : 'secondary'}>{listing.wieta}</Badge>
                  </TableCell>
                  <TableCell>
                     <div className="flex justify-end gap-2">
                        {isAdmin && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Toggle menu</span>
                                </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                    <Link href={`/bulk-wine-market/${listing.id}`}>View Details</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href={`/bulk-wine-market/edit/${listing.id}`}>Edit</Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DeleteListingDialog listingId={listing.id} asDropdownMenuItem />
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    No bulk wine listings found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
