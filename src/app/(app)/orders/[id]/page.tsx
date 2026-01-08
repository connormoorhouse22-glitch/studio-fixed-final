
'use server';

import { getOrderById } from '@/lib/order-actions';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { cookies } from 'next/headers';
import { getProductById } from '@/lib/product-actions';
import { OrderDetailsClientWrapper } from './order-details-client-wrapper';


export default async function OrderDetailsPage({ params }: { params: { id: string } }) {
  const order = await getOrderById(params.id);
  const cookieStore = cookies();
  const userRole = cookieStore.get('userRole')?.value;

  if (!order) {
    notFound();
  }

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'Delivered':
        return 'default';
      case 'Pending':
        return 'secondary';
       case 'Processing':
        return 'outline';
      case 'Order Received':
        return 'outline';
      case 'Shipped':
        return 'default'; // Re-using default for demo, can be customized
      case 'Cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

   const getStatusClassName = (status: string) => {
    switch (status) {
      case 'Processing':
        return 'bg-blue-500 text-white';
      case 'Order Received':
        return 'bg-purple-500 text-white';
      case 'Shipped':
        return 'bg-yellow-400 text-black';
       case 'Delivered':
        return 'bg-green-500 text-white';
      case 'Pending':
        return 'bg-orange-500 text-white';
      default:
        return '';
    }
  }

  const renderProductInfo = (category?: string, unitsPerPallet?: number, quantity?: number) => {
    if (!category || !quantity) return null;
    
    let info = null;
    const categoryLower = category.toLowerCase();
    const isBottle = categoryLower.includes('bottle') || categoryLower.includes('bordeaux') || categoryLower.includes('burgundy') || categoryLower.includes('flute hock');
    const isScrewcap = categoryLower.includes('screwcap');
    const isCork = categoryLower.includes('cork');

    if (isBottle && unitsPerPallet) {
        const pallets = quantity / unitsPerPallet;
        info = `${pallets} pallet${pallets > 1 ? 's' : ''}`;
    } else if (isScrewcap || isCork) {
        const boxes = quantity / 1000;
        info = `${boxes} box${boxes > 1 ? 'es' : ''}`;
    }

    if (info) {
        return (
            <p className="text-xs text-muted-foreground">{info}</p>
        )
    }

    return null;
  }

  // Fetch product details for each item to get category etc.
  const itemsWithDetails = await Promise.all(
    order.items.map(async (item) => {
      const product = await getProductById(item.id);
      return {
        ...item,
        category: product?.category,
        unitsPerPallet: product?.unitsPerPallet
      };
    })
  );


  return (
    <div className="flex flex-col gap-8">
      <OrderDetailsClientWrapper order={order}>
        <Card id={order.id}>
            <CardHeader className="no-print">
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle>Order Details</CardTitle>
                    <CardDescription>Order #{order.orderNumber}</CardDescription>
                </div>
                <div className="text-right">
                    <p className="text-sm text-muted-foreground">Order Placed</p>
                    <p className="font-medium">{format(new Date(order.createdAt), 'PPP')}</p>
                </div>
            </div>
            </CardHeader>
            <CardContent>
                <Separator className="my-4" />
                <div className="grid grid-cols-3 gap-6 text-sm">
                    <div>
                        <h3 className="font-semibold mb-2">From</h3>
                        <p>{order.producerCompany}</p>
                        <p className="text-muted-foreground">{order.producerEmail}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2">To</h3>
                        <p>{order.supplierCompany}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2">Status</h3>
                        <Badge variant={getStatusVariant(order.status)} className={`${getStatusClassName(order.status)} no-print`}>{order.status}</Badge>
                         <p className="print-only">{order.status}</p>
                    </div>
                </div>
                {order.builtProductInfo && (
                    <>
                        <Separator className="my-4" />
                        <div className="text-sm">
                            <h3 className="font-semibold mb-2">Related Product Build</h3>
                            <p>This order is part of the build for <span className="font-medium">{order.builtProductInfo.name}</span> (ID: {order.builtProductInfo.id})</p>
                        </div>
                    </>
                )}

            <Separator className="my-4" />

            <h3 className="text-lg font-semibold mb-4">Order Items</h3>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-center">Quantity</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {itemsWithDetails.map((item) => (
                    <TableRow key={item.id}>
                    <TableCell>
                        <p className="font-medium">{item.name}</p>
                        {renderProductInfo(item.category, item.unitsPerPallet, item.quantity)}
                    </TableCell>
                    <TableCell className="text-center">{item.quantity.toLocaleString('en-US')}</TableCell>
                    <TableCell className="text-right">ZAR {item.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                    <TableCell className="text-right">ZAR {(item.price * item.quantity).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            </CardContent>
            <CardFooter>
                <div className="w-full flex justify-end">
                    <div className="text-right text-lg font-bold">
                        <span>Total Amount:</span>
                        <span className="ml-4">ZAR {order.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                </div>
            </CardFooter>
        </Card>
      </OrderDetailsClientWrapper>
    </div>
  );
}
