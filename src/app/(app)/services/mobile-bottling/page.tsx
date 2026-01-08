
'use server';

import { getSuppliersByService } from '@/lib/userActions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { Calendar } from 'lucide-react';

export default async function MobileBottlingPage() {
  const suppliers = await getSuppliersByService('Mobile Bottling');

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Mobile Bottling Suppliers</h2>
        <p className="text-muted-foreground">
          Book a date with one of our trusted mobile bottling partners.
        </p>
      </div>

      {suppliers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suppliers.map(supplier => (
            <Card key={supplier.email} className="flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={supplier.avatar} data-ai-hint="company logo" />
                    <AvatarFallback>{supplier.company.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{supplier.company}</CardTitle>
                    <CardDescription>Contact: {supplier.name}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground">
                    Provides on-site mobile bottling services. Check their calendar for availability and make a booking.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                    <Link href={`/services/book/${supplier.company}?service=Mobile Bottling`}>
                        <Calendar className="mr-2 h-4 w-4" />
                        View Availability & Book
                    </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center py-20">
            <CardHeader className="text-center">
                <CardTitle>No Suppliers Found</CardTitle>
                <CardDescription>
                There are currently no mobile bottling suppliers registered on the platform.
                </CardDescription>
            </CardHeader>
        </Card>
      )}
    </div>
  );
}

    