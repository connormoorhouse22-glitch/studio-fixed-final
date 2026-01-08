
'use server';

import { notFound } from 'next/navigation';
import { getUserByCompany } from '@/lib/userActions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AtSign, Building, Phone, User as UserIcon, Hash, MapPin, BadgePercent } from 'lucide-react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

// Helper to reverse slug to original company name
function unslug(slug: string) {
    return slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

export default async function SupplierProfilePage({ params }: { params: { slug: string } }) {
  const companyName = unslug(params.slug);
  const supplier = await getUserByCompany(companyName);

  if (!supplier) {
    notFound();
  }

  const getTierForDisplay = (tierValue?: string) => {
    if (!tierValue) return { label: 'Not Set', variant: 'secondary' as const };
    return { label: tierValue, variant: 'secondary' as const };
  };

  const defaultTier = getTierForDisplay(supplier.pricingTiers?.default);


  return (
    <div className="flex flex-col gap-8">
      <div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/suppliers">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to All Suppliers
          </Link>
        </Button>
      </div>

      <Card className="max-w-4xl mx-auto w-full">
        <CardHeader className="flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 mb-4 border-2 border-primary">
                <AvatarImage src={supplier.avatar} data-ai-hint="company logo" />
                <AvatarFallback>{supplier.company.charAt(0)}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-3xl">{supplier.company}</CardTitle>
            <CardDescription>Supplier Profile & Contact Information</CardDescription>
        </CardHeader>
        <CardContent>
            <Separator className="my-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Contact Details</h3>
                    <div className="space-y-3 text-muted-foreground">
                        <div className="flex items-center gap-4"><UserIcon className="h-5 w-5 text-primary" /><span><strong>Contact Person:</strong> {supplier.name}</span></div>
                        <div className="flex items-center gap-4"><AtSign className="h-5 w-5 text-primary" /><span><strong>Email:</strong> <a href={`mailto:${supplier.email}`} className="text-primary underline">{supplier.email}</a></span></div>
                        <div className="flex items-center gap-4"><Phone className="h-5 w-5 text-primary" /><span><strong>Phone:</strong> {supplier.contactNumber || 'Not provided'}</span></div>
                    </div>
                </div>
                 <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Company Information</h3>
                    <div className="space-y-3 text-muted-foreground">
                        <div className="flex items-start gap-4"><MapPin className="h-5 w-5 text-primary mt-1" />
                            <div>
                                <strong>Billing Address:</strong>
                                <p className="whitespace-pre-wrap">{supplier.billingAddress || 'Not provided'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4"><Hash className="h-5 w-5 text-primary" /><span><strong>VAT Number:</strong> {supplier.vatNumber || 'Not provided'}</span></div>
                    </div>
                </div>
            </div>
             <Separator className="my-6" />
             <div className="text-center">
                <h3 className="font-semibold text-lg mb-2">Default Pricing Tier</h3>
                 <Badge variant={defaultTier.variant} className="text-base px-4 py-1">{defaultTier.label}</Badge>
                 <p className="text-xs text-muted-foreground mt-2">This is the default pricing tier for producers who have not been assigned a specific tier by this supplier.</p>
             </div>
        </CardContent>
      </Card>
    </div>
  );
}
