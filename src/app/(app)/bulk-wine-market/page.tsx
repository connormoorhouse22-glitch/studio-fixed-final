
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
import { DeleteListingDialog } from './delete-listing-dialog';
import { EnquiryButton } from './enquiry-button';

export default async function BulkWineMarketPage() {
  const listings = await getBulkWineListings();
  const cookieStore = cookies();
  const userRole = cookieStore.get('userRole')?.value;
  const userCompany = cookieStore.get('userCompany')?.value;
  const isAdmin = userRole === 'Admin';
  const isProducer = userRole === 'Producer';

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Bulk Wine Market</h2>
          <p className="text-muted-foreground">
            {isAdmin ? 'Review and manage all producer listings.' : 'Trade bulk wine with producers across the industry.'}
          </p>
        </div>
        {(isProducer || isAdmin) && (
          <Button asChild>
            <Link href="/bulk-wine-market/new">
              <PlusCircle className="mr-2 h-4 w-4" /> List Your Wine
            </Link>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Listings</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {isAdmin && <TableHead>Producer</TableHead>}
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
              {listings.length > 0 ? listings.slice().reverse().map((listing) => {
                const canManage = isAdmin || (isProducer && listing.producer === userCompany);
                return (
                <TableRow key={listing.id} id={listing.id}>
                  {isAdmin && <TableCell className="font-medium">{listing.producer}</TableCell>}
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
                        {canManage ? (
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
                        ) : isProducer ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <EnquiryButton listingId={listing.id} />
                            </DropdownMenuContent>
                        </DropdownMenu>
                        ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              )}) : (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 9 : 8} className="h-24 text-center">
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
