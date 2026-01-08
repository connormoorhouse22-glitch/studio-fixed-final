
'use server';

import { getProducts } from '@/lib/product-actions';
import { ProductCard } from '@/components/product-card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { cookies } from 'next/headers';
import { getUserByEmail } from '@/lib/user-actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { notFound } from 'next/navigation';
import { getPromotions } from '@/lib/promotion-actions';

// Helper to format slug parts into readable titles
function formatTitle(slug: string[]) {
  return slug.map(part => part.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())).join(' > ');
}

export default async function DynamicProductPage({ params }: { params: { slug: string[] } }) {
  const { slug } = params;

  if (!slug || slug.length === 0) {
    notFound();
  }
  
  const slugParts = slug.map(decodeURIComponent);
  const title = formatTitle(slugParts);

  const mainCategorySlug = slugParts[0];

  let allProducts = await getProducts();
  const allPromotions = await getPromotions();
  let products = allProducts;
  
  // Filtering logic based on URL structure
  if (slugParts.length === 1) { // e.g., /dry-goods or /wine-additions
      if (mainCategorySlug === 'dry-goods') {
        const dryGoodsCategories = ['bottles', 'screwcaps', 'corks', 'labels', 'cartons', 'bordeaux', 'burgundy', 'flute hock'];
        products = products.filter(p => dryGoodsCategories.some(cat => p.category.toLowerCase().includes(cat)));
      } else if (mainCategorySlug === 'wine-additions') {
         const wineAdditionSuppliers = ['enartis', 'laffort'];
         products = products.filter(p => wineAdditionSuppliers.includes(p.supplier.toLowerCase()));
      }
  } else if (slugParts.length === 2) { // e.g., /dry-goods/bottles or /wine-additions/enartis
      const secondPart = formatTitle([slugParts[1]]).toLowerCase();
      if (mainCategorySlug === 'wine-additions') {
        products = products.filter(p => p.supplier.toLowerCase() === secondPart);
      } else {
        products = products.filter(p => p.category.toLowerCase() === secondPart);
      }
  } else if (slugParts.length === 3) { // e.g., /dry-goods/bottles/ardagh-glass or /wine-additions/enartis/yeast
      const secondPart = formatTitle([slugParts[1]]).toLowerCase();
      const thirdPart = formatTitle([slugParts[2]]).toLowerCase();
      if (mainCategorySlug === 'wine-additions') {
         products = products.filter(p => 
          p.supplier.toLowerCase() === secondPart &&
          p.category.toLowerCase() === thirdPart
        );
      } else { // This is for /dry-goods/[category]/[supplier]
         products = products.filter(p => 
            p.category.toLowerCase() === secondPart &&
            p.supplier.toLowerCase() === thirdPart
        );
      }
  } else if (slugParts.length === 4) { // e.g., /dry-goods/bottles/ardagh-glass/bordeaux
       const supplierName = formatTitle([slugParts[2]]).toLowerCase();
       const subCategoryName = formatTitle([slugParts[3]]).toLowerCase();
       products = products.filter(p => 
          p.supplier.toLowerCase() === supplierName &&
          (p.category.toLowerCase() === 'bottles' || p.category.toLowerCase() === subCategoryName)
      );
  }


  const cookieStore = cookies();
  const userEmail = cookieStore.get('userEmail')?.value;
  const user = userEmail ? await getUserByEmail(userEmail) : null;
  
  const description = `Browse products for ${title}. Found ${products.length} items.`;

  return (
    <div className="flex flex-col gap-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search products..." className="pl-8" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.length > 0 ? (
          products.map((product) => {
            const pricingTier = user?.pricingTiers?.[product.supplier] || user?.pricingTiers?.default || 'Tier 1';
            const promotion = allPromotions.find(promo => promo.productId === product.id);
            return <ProductCard key={product.id} product={product} pricingTier={pricingTier} promotion={promotion} />;
          })
        ) : (
          <div className="col-span-full text-center text-muted-foreground py-10">
            <p>No products found for this selection.</p>
          </div>
        )}
      </div>
    </div>
  );
}
