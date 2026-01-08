
'use server';

import Link from 'next/link';
import { MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getOrders, updateOrderStatus } from '@/lib/order-actions';
import type { Order } from '@/lib/order-actions';
import { cookies } from 'next/headers';
import { format } from 'date-fns';
import { UpdateStatusDropdown } from '@/app/(app)/orders/update-status-dropdown';
import { cn } from '@/lib/utils';
import { getUserByCompany } from '@/lib/userActions';
import { ResendNotificationButton } from '@/app/(app)/orders/resend-notification-button';
import { ConfirmDeliveryButton } from '@/app/(app)/orders/confirm-delivery-button';
import { DeleteOrderDialog } from './delete-order-dialog';

// Auto-update logic
async function checkAndAutoUpdateOrders() {
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    let currentOrders = await getOrders({ userRole: 'Admin' });
    let needsRefetch = false;
    
    for (const order of currentOrders) {
        if (order.status === 'Shipped' && order.shippedAt && new Date(order.shippedAt) <= fourteenDaysAgo) {
            await updateOrderStatus(order.id, 'Delivered');
            needsRefetch = true;
        }
    }
    
    if (needsRefetch) {
       return getOrders({ userRole: 'Admin' });
    }
    
    return currentOrders;
}


export default async function AdminAllOrdersPage() {
  const userRole = cookies().get('userRole')?.value;
  const userCompany = cookies().get('userCompany')?.value;
  const userEmail = cookies().get('userEmail')?.value;

  const orders: Order[] = await checkAndAutoUpdateOrders();
  const pageTitle = "All Orders";
  const pageDescription = `A list of all orders on the platform, totaling ${orders.length} orders from all wine producers.`;
  

  // Pre-fetch supplier contact info if user is a producer
  const supplierEmails = new Map<string, string>();
  if (userRole === 'Producer' || userRole === 'Admin') {
    const supplierCompanies = [...new Set(orders.map(o => o.supplierCompany))];
    for (const company of supplierCompanies) {
        const supplierUser = await getUserByCompany(company);
        if (supplierUser) {
            supplierEmails.set(company, supplierUser.email);
        }
    }
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
       case 'Quote Request':
        return 'outline';
      case 'Shipped':
        return 'default'; // Re-using default for demo, can be customized
      case 'Cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusClassName = (status: string, active: boolean = false) => {
    const baseClasses = "data-[state=active]:text-white ";
    switch (status) {
      case 'Processing':
        return active ? 'bg-blue-500 text-white' : baseClasses + 'data-[state=active]:bg-blue-500';
      case 'Order Received':
        return active ? 'bg-purple-500 text-white' : baseClasses + 'data-[state=active]:bg-purple-500';
      case 'Shipped':
        return active ? 'bg-yellow-400 text-black' : "data-[state=active]:text-black data-[state=active]:bg-yellow-400";
       case 'Delivered':
        return active ? 'bg-green-500 text-white' : baseClasses + 'data-[state=active]:bg-green-500';
      case 'Pending':
        return active ? 'bg-orange-500 text-white' : baseClasses + 'data-[state=active]:bg-orange-500';
      case 'Quote Request':
        return active ? 'bg-teal-500 text-white' : baseClasses + 'data-[state=active]:bg-teal-500';
      case 'Cancelled':
        return active ? 'bg-red-500 text-white' : baseClasses + 'data-[state=active]:bg-red-500';
      default:
        return '';
    }
  }


  const renderTable = (filteredOrders: Order[]) => (
    <Card>
      <CardHeader>
        <CardTitle>{pageTitle}</CardTitle>
        <CardDescription>{pageDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Producer</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length > 0 ? filteredOrders.slice().reverse().map((order) => {
                const contactEmail = userRole === 'Producer' ? supplierEmails.get(order.supplierCompany) : order.producerEmail;
                return (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.orderNumber}</TableCell>
                <TableCell>
                  <div className="font-medium">{order.producerCompany}</div>
                  <div className="text-sm text-muted-foreground">{order.producerEmail}</div>
                </TableCell>
                <TableCell>{order.supplierCompany}</TableCell>
                <TableCell>
                   <Badge variant={getStatusVariant(order.status)} className={cn(getStatusClassName(order.status, true))}>{order.status}</Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">{format(new Date(order.createdAt), 'PPP')}</TableCell>
                <TableCell className="text-right">ZAR {order.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                <TableCell>
                   <div className="flex items-center justify-end gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                            <Link href={`/orders/${order.id}`}>View Details</Link>
                        </DropdownMenuItem>
                        <UpdateStatusDropdown order={order} />
                        <DropdownMenuItem asChild disabled={!contactEmail}>
                            <a href={`mailto:${contactEmail}`}>
                                Contact
                            </a>
                        </DropdownMenuItem>
                         <DropdownMenuSeparator />
                         <ResendNotificationButton orderId={order.id} />
                         <DropdownMenuSeparator />
                         <DeleteOrderDialog orderId={order.id} orderNumber={order.orderNumber} />
                        </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            )}) : (
                <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                        No orders found.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  return (
    <Tabs defaultValue="all">
      <div className="flex items-center">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending" className={cn(getStatusClassName('Pending'))}>Pending</TabsTrigger>
          <TabsTrigger value="quote-request" className={cn(getStatusClassName('Quote Request'))}>Quote Requests</TabsTrigger>
          <TabsTrigger value="order-received" className={cn(getStatusClassName('Order Received'))}>Order Received</TabsTrigger>
          <TabsTrigger value="processing" className={cn(getStatusClassName('Processing'))}>Processing</TabsTrigger>
          <TabsTrigger value="shipped" className={cn(getStatusClassName('Shipped'))}>Shipped</TabsTrigger>
          <TabsTrigger value="delivered" className={cn(getStatusClassName('Delivered'))}>Delivered</TabsTrigger>
          <TabsTrigger value="cancelled" className={cn(getStatusClassName('Cancelled'))}>Cancelled</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="all">{renderTable(orders)}</TabsContent>
      <TabsContent value="pending">{renderTable(orders.filter(o => o.status === 'Pending'))}</TabsContent>
      <TabsContent value="quote-request">{renderTable(orders.filter(o => o.status === 'Quote Request'))}</TabsContent>
      <TabsContent value="order-received">{renderTable(orders.filter(o => o.status === 'Order Received'))}</TabsContent>
      <TabsContent value="processing">{renderTable(orders.filter(o => o.status === 'Processing'))}</TabsContent>
      <TabsContent value="shipped">{renderTable(orders.filter(o => o.status === 'Shipped'))}</TabsContent>
      <TabsContent value="delivered">{renderTable(orders.filter(o => o.status === 'Delivered'))}</TabsContent>
      <TabsContent value="cancelled">{renderTable(orders.filter(o => o.status === 'Cancelled'))}</TabsContent>
    </Tabs>
  );
}
