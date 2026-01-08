
'use client';

import Image from 'next/image';
import { Minus, Plus, ShoppingCart, Trash2, X, Loader2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/hooks/use-cart';
import { createOrdersFromCart } from '@/lib/order-actions';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function CartSheet({ children }: { children: React.ReactNode }) {
  const { cart, removeItem, updateItemQuantity, clearCart } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleQuantityUpdate = (productId: string, currentQuantity: number, change: number) => {
    const newQuantity = currentQuantity + change;
    updateItemQuantity(productId, newQuantity);
  };

  const handlePlaceOrder = async () => {
    const producerEmail = localStorage.getItem('userEmail');
    const producerCompany = localStorage.getItem('userCompany');

    if (!producerEmail || !producerCompany) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'Could not identify your user details. Please log in again.',
      });
      return;
    }

    if (cart.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Empty Cart',
        description: 'You cannot place an order with an empty cart.',
      });
      return;
    }

    setIsPlacingOrder(true);
    try {
      const result = await createOrdersFromCart({
        components: cart,
        producer: { email: producerEmail, company: producerCompany },
      });

      if (result.success) {
        toast({
          title: 'Orders Placed Successfully',
          description: `${result.ordersCreated} orders have been sent to the respective suppliers.`,
        });
        clearCart();
        router.refresh();
        router.push('/orders');
        setIsSheetOpen(false);
      } else {
        throw new Error(result.message || 'An unknown error occurred.');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to Place Order',
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      setIsPlacingOrder(false);
    }
  };


  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Shopping Cart</SheetTitle>
          <SheetDescription>
            Review your items before proceeding to checkout.
          </SheetDescription>
        </SheetHeader>
        <Separator />
        {cart.length > 0 ? (
          <>
            <div className="flex-1 overflow-y-auto pr-4">
              <div className="flex flex-col gap-4 py-4">
                {cart.map((item) => {
                    const isBottle = item.category === 'Bottles';
                    const isScrewcap = item.category === 'Screwcaps';

                    let displayQuantity = item.quantity;
                    let increment = 1;
                    let unitDescription = '';
                    
                    if (isBottle && item.unitsPerPallet) {
                        displayQuantity = item.quantity / item.unitsPerPallet;
                        increment = item.unitsPerPallet;
                        unitDescription = `(${item.unitsPerPallet.toLocaleString('en-US')} units/pallet)`;
                    } else if (isScrewcap) {
                        displayQuantity = item.quantity / 1000;
                        increment = 1000;
                        unitDescription = '(1000 units/box)';
                    }
                    
                    return (
                        <div key={item.id} className="flex items-start gap-4">
                            <Image
                            src={item.image}
                            alt={item.name}
                            width={64}
                            height={64}
                            className="rounded-md object-cover"
                            data-ai-hint={item.aiHint}
                            />
                            <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                                ZAR {item.price.toFixed(2)} / unit
                            </p>
                             {unitDescription && (
                                <p className="text-xs text-muted-foreground">
                                    {unitDescription}
                                </p>
                            )}
                            </div>
                            <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleQuantityUpdate(item.id, item.quantity, -increment)}
                            >
                                <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-10 text-center text-sm">
                                {displayQuantity}
                            </span>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleQuantityUpdate(item.id, item.quantity, increment)}
                            >
                                <Plus className="h-3 w-3" />
                            </Button>
                            </div>
                            <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => removeItem(item.id)}
                            >
                            <X className="h-4 w-4" />
                            </Button>
                        </div>
                    );
                })}
              </div>
            </div>
            <Separator />
            <SheetFooter className="mt-auto">
              <div className="w-full space-y-4">
                <div className="flex justify-between font-semibold">
                  <span>Subtotal</span>
                  <span>ZAR {total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                 <div className="flex gap-2">
                    <Button variant="outline" className="w-full" onClick={clearCart} disabled={isPlacingOrder}>
                        <Trash2 className="mr-2 h-4 w-4" /> Clear Cart
                    </Button>
                    <Button className="w-full" onClick={handlePlaceOrder} disabled={isPlacingOrder}>
                         {isPlacingOrder ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                         ) : (
                            'Place Order'
                         )}
                    </Button>
                </div>
              </div>
            </SheetFooter>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <ShoppingCart className="h-16 w-16 text-muted-foreground" />
            <p className="text-lg font-semibold">Your cart is empty</p>
            <p className="text-sm text-muted-foreground">
              Add some products to get started.
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
