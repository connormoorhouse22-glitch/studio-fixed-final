
'use server';

import { notFound } from 'next/navigation';
import { getBulkWineListings } from '@/lib/bulk-wine-actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Droplets, MapPin, Tag, User, Verified, Hash, Info, Mail } from 'lucide-react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cookies } from 'next/headers';

export default async function BulkWineListingDetailsPage({ params }: { params: { id: string } }) {
  const listings = await getBulkWineListings();
  const listing = listings.find(l => l.id === params.id);
  const userRole = cookies().get('userRole')?.value;
  const isAdmin = userRole === 'Admin';

  if (!listing) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/bulk-wine-market">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Market
          </Link>
        </Button>
      </div>

      <Card className="max-w-4xl mx-auto w-full">
        <CardHeader>
          <CardTitle className="text-2xl">{listing.vintage} {listing.cultivar}</CardTitle>
          <CardDescription>Bulk Wine Listing Details</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h3 className="font-semibold text-lg mb-4">Wine Information</h3>
                    <div className="space-y-3 text-muted-foreground">
                        <div className="flex items-center gap-3"><Tag className="h-5 w-5 text-primary" /><span><strong>Cultivar:</strong> {listing.cultivar}</span></div>
                        <div className="flex items-center gap-3"><Calendar className="h-5 w-5 text-primary" /><span><strong>Vintage:</strong> {listing.vintage}</span></div>
                        <div className="flex items-center gap-3"><MapPin className="h-5 w-5 text-primary" /><span><strong>Region:</strong> {listing.region}</span></div>
                        <div className="flex items-center gap-3"><Droplets className="h-5 w-5 text-primary" /><span><strong>Litres Available:</strong> {listing.litres.toLocaleString()} L</span></div>
                         <div className="flex items-center gap-3"><Hash className="h-5 w-5 text-primary" /><span><strong>Price per Litre:</strong> ZAR {listing.pricePerLitre.toFixed(2)}</span></div>
                    </div>
                </div>
                <div>
                    <h3 className="font-semibold text-lg mb-4">Producer Information</h3>
                    <div className="space-y-3 text-muted-foreground">
                        {isAdmin && (
                            <>
                                <div className="flex items-center gap-3"><User className="h-5 w-5 text-primary" /><span><strong>Producer:</strong> {listing.producer}</span></div>
                                <div className="flex items-center gap-3"><Mail className="h-5 w-5 text-primary" /><span><strong>Contact:</strong> {listing.contact}</span></div>
                            </>
                        )}
                        <div className="flex items-center gap-3">
                            <Verified className="h-5 w-5 text-primary" />
                            <strong>Certifications:</strong>
                            <div className="flex gap-2">
                                <Badge variant={listing.ipw === 'Yes' ? 'default' : 'secondary'}>IPW: {listing.ipw}</Badge>
                                <Badge variant={listing.wieta === 'Yes' ? 'default' : 'secondary'}>WIETA: {listing.wieta}</Badge>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Separator className="my-6" />
            <div className="text-center">
                 <p className="text-sm text-muted-foreground">Listing ID: {listing.id}</p>
                 <p className="text-sm text-muted-foreground">Listed on: {format(new Date(listing.createdAt), 'PPP')}</p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
