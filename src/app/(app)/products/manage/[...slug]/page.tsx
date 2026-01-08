
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PlusCircle, Search, MoreVertical, Copy } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getProducts, duplicateProduct, type Product } from '@/lib/product-actions';
import { getPromotions, type Promotion } from '@/lib/promotion-actions';
import { Skeleton } from '@/components/ui/skeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { EditProductDialog } from '../edit-product-dialog';
import { DeleteProductDialog } from '../delete-product-dialog';
import { handleProductUpdate } from '../actions';
import { ProductCard } from '@/components/product-card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { wineAdditionsSuppliers, dryGoodsSuppliers, bottleSuppliers } from '@/lib/navigation-service';

// Helper to create a URL-friendly slug
const toSlug = (str: string) => str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

// Helper to un-slug and title-case the name
const unslug = (slug: string) => slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

export default function DynamicManageProductsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string[];

  const [products, setProducts] = useState<Product[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  const rawSupplierSlug = slug?.[0] || '';
  const supplierName = unslug(rawSupplierSlug);
  const activeTab = slug?.[1] || 'all';

  const [supplierCategories, setSupplierCategories] = useState<string[]>([]);

  useEffect(() => {
    // This consolidated logic correctly builds the category list for any supplier.
    const getCategoriesForSupplier = (name: string): string[] => {
        const categories = new Set<string>();
        const normalizedName = name.toLowerCase();

        // Check for bottle suppliers (e.g., Ardagh Glass, ACS)
        const correctBottleSupplierName = Object.keys(bottleSuppliers).find(s => s.toLowerCase() === normalizedName);
        if (correctBottleSupplierName) {
            bottleSuppliers[correctBottleSupplierName as keyof typeof bottleSuppliers].forEach(subCat => categories.add(subCat));
        }

        // Check for wine addition suppliers (e.g., Enartis, Laffort)
        const correctWineAdditionSupplierName = Object.keys(wineAdditionsSuppliers).find(s => s.toLowerCase() === normalizedName);
        if (correctWineAdditionSupplierName) {
            wineAdditionsSuppliers[correctWineAdditionSupplierName as keyof typeof wineAdditionsSuppliers].forEach(cat => categories.add(cat));
        }
        
        // Check for other dry goods suppliers
        for (const [category, suppliers] of Object.entries(dryGoodsSuppliers)) {
            if (suppliers.map(s => s.toLowerCase()).includes(normalizedName)) {
                categories.add(category);
            }
        }
        
        return Array.from(categories).sort();
    };
    
    setSupplierCategories(getCategoriesForSupplier(supplierName));
    setUserRole(localStorage.getItem('userRole'));
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supplierName]);

  const fetchData = async () => {
      setIsLoading(true);
      try {
        const [allProductsData, allPromotionsData] = await Promise.all([
          getProducts(supplierName),
          getPromotions(supplierName),
        ]);
        
        setProducts(allProductsData);
        setPromotions(allPromotionsData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
  };

  const onActionSuccess = () => {
    handleProductUpdate();
    fetchData();
  };

  const handleDuplicate = async (productId: string) => {
    await duplicateProduct(productId);
    onActionSuccess();
  }
  
  const isSupplier = userRole === 'Supplier';
  
  const subCategorySlug = activeTab === 'all' ? null : unslug(activeTab);

  const filteredProducts = subCategorySlug
    ? products.filter(p => {
        const isBottleSupplier = Object.keys(bottleSuppliers).map(s => s.toLowerCase()).includes(supplierName.toLowerCase());
        if (isBottleSupplier) {
            // For bottle suppliers, filter by the subCategory field
            return p.subCategory?.toLowerCase() === subCategorySlug.toLowerCase();
        }
        // For all other suppliers, filter by the main category field
        return p.category.toLowerCase() === subCategorySlug.toLowerCase();
    })
    : products;
  
  const pageTitle = `Manage: ${supplierName}`;
  const pageDescription = `Add, edit, or remove products from the ${supplierName} catalog.`;

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

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{pageTitle}</h2>
          <p className="text-muted-foreground">{pageDescription}</p>
        </div>
        {isSupplier && (
            <Button asChild>
            <Link href="/products/manage/new">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Product
            </Link>
            </Button>
        )}
      </div>

       <div className="flex items-center gap-4 border-b">
         <Tabs defaultValue={activeTab} className="w-full">
            <TabsList>
                <TabsTrigger value="all" asChild>
                    <Link href={`/products/manage/${rawSupplierSlug}/all`}>All Products</Link>
                </TabsTrigger>
                {supplierCategories.map(cat => (
                    <TabsTrigger key={cat} value={toSlug(cat)} asChild>
                       <Link href={`/products/manage/${rawSupplierSlug}/${toSlug(cat)}`}>{cat}</Link>
                    </TabsTrigger>
                ))}
            </TabsList>
         </Tabs>
        <div className="relative ml-auto flex-1 md:grow-0">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search..." className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"/>
        </div>
      </div>

      {isLoading ? (
         <PageSkeleton />
      ) : filteredProducts.length === 0 ? (
         <Card className="flex flex-col items-center justify-center py-20">
            <CardHeader>
                <CardTitle>No Products Found</CardTitle>
                <CardDescription>No products match this category. Try adding one!</CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild>
                    <Link href="/products/manage/new">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add a New Product
                    </Link>
                </Button>
            </CardContent>
        </Card>
      ) : (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredProducts.slice().reverse().map((product) => {
          const promotion = promotions.find(p => p.productId === product.id);
          return (
             <div key={product.id} className="relative">
              <ProductCard
                product={product}
                isSupplierView={isSupplier}
                promotion={promotion}
              />
               {isSupplier && (
                    <div className="absolute top-2 right-2 z-10">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="secondary" size="icon" className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <EditProductDialog product={product} onSuccess={onActionSuccess} />
                                <DropdownMenuItem onSelect={() => handleDuplicate(product.id)}>
                                <Copy className="mr-2 h-4 w-4" />
                                Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DeleteProductDialog product={product} onSuccess={onActionSuccess} />
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                 )}
            </div>
          )
        })}
      </div>
      )}
    </div>
  );
}
