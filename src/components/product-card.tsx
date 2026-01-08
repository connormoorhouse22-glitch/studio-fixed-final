

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ShoppingCart, Minus, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { type Product } from '@/lib/product-actions';
import { Separator } from './ui/separator';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/lib/users';
import type { Promotion } from '@/lib/promotion-actions';
import { ProductCardQuoteForm } from './product-card-quote-form';

interface ProductCardProps {
  product: Product;
  pricingTier?: User['pricingTiers']['default'];
  promotion?: Promotion;
  isSupplierView?: boolean;
}

export function ProductCard({ product, pricingTier = 'Tier 1', promotion, isSupplierView = false }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const { toast } = useToast();

  const getPrice = (): number | undefined => {
    switch (pricingTier) {
      case 'Tier 6':
        return product.priceTier6 || product.priceTier5 || product.priceTier4 || product.priceTier3 || product.priceTier2 || product.price;
      case 'Tier 5':
        return product.priceTier5 || product.priceTier4 || product.priceTier3 || product.priceTier2 || product.price;
      case 'Tier 4':
        return product.priceTier4 || product.priceTier3 || product.priceTier2 || product.price;
      case 'Tier 3':
        return product.priceTier3 || product.priceTier2 || product.price;
      case 'Tier 2':
        return product.priceTier2 || product.price;
      case 'Tier 1':
      default:
        return product.price;
    }
  };

  const originalPrice = getPrice();
  let displayedPrice = originalPrice;
  if (promotion && typeof originalPrice === 'number') {
    displayedPrice = originalPrice * (1 - promotion.discountPercentage / 100);
  }

  const isPriceAvailable = typeof displayedPrice === 'number';
  // This flag will control if the "Add to Cart" functionality is shown.
  const isEnartisOrLaffort = product.supplier.toLowerCase() === 'laffort' || product.supplier.toLowerCase() === 'enartis';
  const showPurchaseControls = !isSupplierView && !isEnartisOrLaffort;
  const showContactMessage = !isSupplierView && isEnartisOrLaffort;

  const handleAddToCart = () => {
    if (!isPriceAvailable) {
      toast({
        variant: 'destructive',
        title: 'Cannot Add to Cart',
        description: 'This product does not have a price and cannot be purchased.',
      });
      return;
    }

    const isBottle =
      product.category === 'Bottles' ||
      product.category === 'Bordeaux' ||
      product.category === 'Burgundy' ||
      product.category === 'Flute Hock';
    const isScrewcap = product.category === 'Screwcaps';
    
    const isCork = product.category === 'Corks'; 
    const isLabel = product.category === 'Carton & Importer labels';

    const unitsPerPallet = product.unitsPerPallet || 1;
    const unitsPerBox = 1000;

    let cartItem: any;
    let description = '';

    const cartProduct = { ...product, price: displayedPrice };

    if (isBottle && unitsPerPallet > 1) {
      const palletsToAdd = quantity;
      const finalQuantity = palletsToAdd * unitsPerPallet;
      cartItem = { ...cartProduct, quantity: finalQuantity };
      description = `Added ${palletsToAdd} pallet(s) (${finalQuantity.toLocaleString('en-US')} units) of ${product.name} to cart.`;
    } else if (isScrewcap || isCork) {
        const boxesNeeded = quantity;
        const finalQuantity = boxesNeeded * unitsPerBox;
        cartItem = { ...cartProduct, quantity: finalQuantity };
        description = `Added ${boxesNeeded} box(es) (${finalQuantity.toLocaleString('en-US')} units) of ${product.name} to cart.`;
    } else if (isLabel) {
        cartItem = { ...cartProduct, quantity };
        description = `${quantity.toLocaleString('en-US')} x ${product.name} has been added.`
    }
    else {
      cartItem = { ...cartProduct, quantity };
      description = `${quantity.toLocaleString('en-US')} x ${product.name} has been added.`;
    }

    addItem(cartItem);

    toast({
      title: 'Item Added to Cart',
      description: description,
    });
  };


  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (value > 0) {
      setQuantity(value);
    } else {
      setQuantity(1);
    }
  };

  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const getUnitLabel = () => {
    const isBottle = product.category === 'Bottles' || product.category === 'Bordeaux' || product.category === 'Burgundy' || product.category === 'Flute Hock';
    const isScrewcap = product.category === 'Screwcaps';
    const isCork = product.category === 'Corks';
    const isLabel = product.category === 'Carton & Importer labels';

    if (isBottle && product.unitsPerPallet && product.unitsPerPallet > 1) return `Pallet(s)`;
    if (isScrewcap || isCork) return 'Box(es)';
    if (isLabel) return 'Roll(s)';
    return 'Units';
  };
  const unitLabel = getUnitLabel();

  const showInventory =
    product.supplier === 'Ardagh Glass' ||
    product.supplier === 'ACS Glass' ||
    product.category === 'Bottles' ||
    product.category === 'Bordeaux' ||
    product.category === 'Burgundy' ||
    product.category === 'Flute Hock';

  const isLabelProduct = product.category === 'Carton & Importer labels';
  
  return (
    <Card id={product.id} className="flex flex-col h-full transition-shadow duration-300">
      <CardHeader className="p-0 relative">
        <Image
          alt={product.name}
          className="rounded-t-lg object-cover"
          height={400}
          src={product.image || 'https://picsum.photos/600/400'}
          width={600}
          data-ai-hint={product.aiHint}
        />
        {promotion && (
            <Badge variant="destructive" className="absolute top-2 left-2 flex items-center gap-1 z-10">
                {promotion.discountPercentage}% OFF
            </Badge>
        )}
      </CardHeader>
      <CardContent className="flex-1 p-4">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold !font-body pr-2">{product.name}</CardTitle>
          <p className="text-xs text-right text-muted-foreground whitespace-nowrap">by {product.supplier}</p>
        </div>
        <CardDescription className="mt-2 text-sm h-12 overflow-hidden">{product.description}</CardDescription>
        
        {isLabelProduct && (product.labelSize || product.labelText) && (
            <>
                <Separator className="my-3" />
                <div className="text-xs text-muted-foreground space-y-1">
                    {product.labelSize && <p><strong>Size:</strong> {product.labelSize}</p>}
                    {product.labelText && <p><strong>Text:</strong> {product.labelText}</p>}
                </div>
            </>
        )}
        
        {showInventory && (product.stockOnHand != null || product.unitsPerPallet != null) && !isLabelProduct ? (
          <>
            <Separator className="my-3" />
            <div className="text-xs text-muted-foreground space-y-1">
              {product.stockOnHand != null && <p><strong>Stock on Hand:</strong> {product.stockOnHand.toLocaleString('en-US')} units</p>}
              {product.unitsPerPallet != null && <p><strong>Units per Pallet:</strong> {product.unitsPerPallet.toLocaleString('en-US')}</p>}
            </div>
          </>
        ) : null}
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-4 p-4 pt-0 mt-auto">
        {showPurchaseControls ? (
          <>
            <div className="w-full">
              <Separator className="mb-4" />
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold">
                      {isPriceAvailable ? `ZAR ${displayedPrice.toFixed(2)}` : 'Price not set'}
                    </span>
                    {promotion && <Badge variant="destructive">-{promotion.discountPercentage}%</Badge>}
                  </div>
                  {promotion && typeof originalPrice === 'number' && <p className="text-sm text-muted-foreground line-through">ZAR {originalPrice.toFixed(2)}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor={`quantity-${product.id}`} className="text-sm">
                    {unitLabel}
                  </Label>
                  <div className="flex items-center">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={decrementQuantity}>
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input id={`quantity-${product.id}`} type="number" min="1" className="h-8 w-16 text-center" value={quantity} onChange={handleQuantityChange} />
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={incrementQuantity}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <Button className="w-full" onClick={handleAddToCart} disabled={!isPriceAvailable}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart
            </Button>
          </>
        ) : isSupplierView ? (
          <div className="w-full pt-4">
            <Separator className="mb-4" />
            <div className="flex items-center justify-between">
              <div>
                <span className="text-lg font-bold">
                     {typeof product.price === 'number' ? `ZAR ${product.price.toFixed(2)}` : 'Contact for Price'}
                </span>
                <p className="text-xs text-muted-foreground">Tier 1 Price</p>
              </div>
            </div>
          </div>
        ) : showContactMessage ? (
          <div className="w-full pt-4">
             <Separator className="mb-4" />
             <p className="text-sm text-center text-muted-foreground">This product is available by quote. Please contact the supplier directly.</p>
          </div>
        ) : null}
      </CardFooter>
    </Card>
  );
}
