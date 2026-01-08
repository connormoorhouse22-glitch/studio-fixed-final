
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

export default function ManageProductsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // This component runs on the client, so localStorage is available.
    const company = localStorage.getItem('userCompany');
    if (company) {
      // Create a URL-friendly slug from the plain text company name.
      const companySlug = company.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      // Immediately redirect to the supplier's specific product management page.
      router.replace(`/products/manage/${companySlug}/all`);
    } else {
        // If for some reason the company is not in localStorage, redirect to a safe page.
        // This might happen on first load or if localStorage is cleared.
        // A more robust solution might show a loading state until the company is confirmed.
        console.warn("Could not find userCompany in localStorage, redirecting to dashboard.");
        router.replace('/sales/dashboard');
    }
  }, [router]);

  // Display a loading state while redirecting to prevent a flash of unstyled content.
  const PageSkeleton = () => (
    <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
            <div>
                <Skeleton className="h-9 w-72 mb-2" />
                <Skeleton className="h-5 w-96" />
            </div>
            <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(4)].map((_, i) => (
                <Card key={i}>
                    <CardHeader className="p-0">
                        <Skeleton className="w-full h-48 rounded-t-lg" />
                    </CardHeader>
                    <CardContent className="p-4">
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full mt-1" />
                    </CardContent>
                    <CardContent className="flex items-center justify-between p-4 pt-0">
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-9 w-24" />
                    </CardContent>
                </Card>
            ))}
        </div>
    </div>
  );

  return <PageSkeleton />;
}
