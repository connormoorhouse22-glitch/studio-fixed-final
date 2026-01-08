
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { getPromotions, type Promotion } from '@/lib/promotion-actions';
import { getProducts, type Product } from '@/lib/product-actions';
import { Skeleton } from './ui/skeleton';
import { Badge } from './ui/badge';
import { TicketPercent } from 'lucide-react';
import { Separator } from './ui/separator';
import Autoplay from "embla-carousel-autoplay";

type EnrichedPromotion = Promotion & { product: Product | null };

const toSlug = (str: string) => str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-\/]/g, '');

const getProductUrl = (product: Product): string => {
  const mainCategorySlug = toSlug(product.category);
  const supplierSlug = toSlug(product.supplier);
  
  // This logic should mirror the navigation service to build correct URLs
  const wineAdditionKeywords = ['yeast', 'tannin', 'enzyme', 'nutrient', 'bacteria', 'stabilizing', 'fining', 'preservative', 'mannoprotein', 'nutrition', 'malolactic', 'agents', 'alternatives', 'sulfiting', 'zymaflore', 'actiflore', 'nobile', 'treatments'];
  const isWineAddition = wineAdditionKeywords.some(kw => product.category.toLowerCase().includes(kw));

  if (isWineAddition) {
    return `/products/wine-additions/${supplierSlug}/${mainCategorySlug}`;
  }

  // Fallback for Dry Goods
  const dryGoodsCategory = ['bottle', 'bordeaux', 'burgundy', 'capsule', 'carton', 'cork', 'label', 'screwcap'].find(c => product.category.toLowerCase().includes(c));
  const categorySlug = toSlug(dryGoodsCategory || product.category);
  const subCategorySlug = product.subCategory ? toSlug(product.subCategory) : mainCategorySlug;

  if (dryGoodsCategory === 'bottle') {
     return `/products/bottles/${supplierSlug}/${subCategorySlug}`;
  }

  return `/products/${categorySlug}/${supplierSlug}`;
};


export function SpecialOffersWidget() {
  const [promotions, setPromotions] = useState<EnrichedPromotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const plugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true, stopOnMouseEnter: true })
  );

  useEffect(() => {
    async function fetchPromotions() {
      setIsLoading(true);
      const [promoData, productData] = await Promise.all([
        getPromotions(),
        getProducts()
      ]);

      const featuredPromos = promoData.filter(p => p.isFeatured === true);

      const enriched = featuredPromos.map(promo => ({
        ...promo,
        product: productData.find(p => p.id === promo.productId) || null,
      }));
      
      setPromotions(enriched);
      setIsLoading(false);
    }
    fetchPromotions();
  }, []);

  if (isLoading) {
    return (
      <div className="p-2 space-y-2">
        <Skeleton className="h-6 w-3/4 mx-auto mb-2" />
        <Skeleton className="h-[150px] w-full" />
      </div>
    );
  }

  if (promotions.length === 0) {
    return null; // Don't render anything if there are no featured promotions
  }

  return (
    <div className="p-2 space-y-2 group-data-[collapsible=icon]:hidden">
        <h3 className="text-sm font-medium text-center text-sidebar-foreground/80">Special Offers</h3>
        <Separator className="bg-sidebar-border" />
        <Carousel
            opts={{
                align: "start",
                loop: true,
            }}
            plugins={[plugin.current]}
            className="w-full"
        >
            <CarouselContent>
                {promotions.map((promo) => (
                    <CarouselItem key={promo.id}>
                        <Link href={promo.product ? getProductUrl(promo.product) : '#'} className="block cursor-pointer">
                            <Card className="bg-sidebar-accent border-sidebar-border text-sidebar-accent-foreground overflow-hidden">
                            <CardContent className="p-2">
                                <div className="flex gap-3">
                                    <div className="w-20 h-20 relative flex-shrink-0">
                                        <Image
                                            src={promo.product?.image || 'https://picsum.photos/200'}
                                            alt={promo.productName}
                                            fill
                                            className="rounded-md object-cover"
                                            data-ai-hint={promo.product?.aiHint || 'product image'}
                                        />
                                    </div>
                                    <div className="relative flex flex-col justify-center overflow-hidden">
                                        <Badge variant="destructive" className="absolute top-1 right-1 flex items-center gap-1 text-xs px-1.5 py-0.5 h-auto">
                                            <TicketPercent className="h-3 w-3" />
                                            {promo.discountPercentage}% OFF
                                        </Badge>
                                        <p className="text-xs font-semibold truncate leading-tight">{promo.productName}</p>
                                        <p className="text-xs text-sidebar-foreground/70 truncate">from {promo.supplierCompany}</p>
                                    </div>
                                </div>
                            </CardContent>
                            </Card>
                        </Link>
                    </CarouselItem>
                ))}
            </CarouselContent>
        </Carousel>
    </div>
  );
}
