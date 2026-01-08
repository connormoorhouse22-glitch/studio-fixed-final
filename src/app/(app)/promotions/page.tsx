'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreatePromotionForm } from './create-promotion-form';
import { getProducts, type Product } from '@/lib/product-actions';
import { getPromotions, type Promotion } from '@/lib/promotion-actions';
import { PromotionsList } from './promotions-list';
import { Skeleton } from '@/components/ui/skeleton';

export default function PromotionsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [supplierCompany, setSupplierCompany] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        const storedCompany = localStorage.getItem('userCompany');
        if (!storedCompany) {
            setError('Could not identify your user information. Please log in again.');
            setIsLoading(false);
            return;
        }
        setSupplierCompany(storedCompany);

        setIsLoading(true);
        setError(null);
        
        try {
            // Fetch products and promotions specifically for this supplier.
            const [productsData, promotionsData] = await Promise.all([
                getProducts(storedCompany),
                getPromotions(storedCompany)
            ]);
            setProducts(productsData);
            setPromotions(promotionsData);
        } catch (e) {
            setError('Failed to load supplier data. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Error</CardTitle>
                    <CardDescription>{error}</CardDescription>
                </CardHeader>
            </Card>
        );
    }
    
    if (isLoading || !supplierCompany) {
        return (
            <div className="flex flex-col gap-8">
                 <div>
                    <Skeleton className="h-9 w-72 mb-2" />
                    <Skeleton className="h-5 w-96" />
                </div>
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <Skeleton className="h-6 w-1/2 mb-2" />
                                <Skeleton className="h-4 w-3/4" />
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </CardContent>
                        </Card>
                    </div>
                    <div className="lg:col-span-2">
                         <Card>
                            <CardHeader>
                                 <Skeleton className="h-6 w-1/2 mb-2" />
                                <Skeleton className="h-4 w-3/4" />
                            </CardHeader>
                            <CardContent>
                               <div className="space-y-4">
                                  <Skeleton className="h-12 w-full" />
                                  <Skeleton className="h-12 w-full" />
                                  <Skeleton className="h-12 w-full" />
                               </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Manage Promotions</h2>
                <p className="text-muted-foreground">Create and manage discounts for your products.</p>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>Create New Promotion</CardTitle>
                            <CardDescription>Select a product and set a discount percentage.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <CreatePromotionForm 
                                products={products} 
                                supplierCompany={supplierCompany}
                                onPromotionCreated={fetchData} 
                            />
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Active Promotions</CardTitle>
                            <CardDescription>A list of your current product promotions.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <PromotionsList promotions={promotions} onUpdate={fetchData} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
