
'use client';

import { useState } from 'react';
import {
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuItem,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import { updateOrderStatus } from '@/lib/order-actions';
import type { Order } from '@/lib/order-actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface UpdateStatusDropdownProps {
  order: Order;
}

export function UpdateStatusDropdown({ order }: UpdateStatusDropdownProps) {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const statuses: Order['status'][] = ['Pending', 'Quote Request', 'Order Received', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  const handleStatusUpdate = async (newStatus: Order['status']) => {
    if (newStatus === order.status) return;
    setIsUpdating(true);
    try {
      const result = await updateOrderStatus(order.id, newStatus);
      if (result.success) {
        toast({
          title: 'Status Updated',
          description: `Order ${order.id} has been marked as ${newStatus}.`,
        });
      } else {
        throw new Error(result.message || 'An unknown error occurred.');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error instanceof Error ? error.message : 'Could not update order status.',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger disabled={isUpdating}>
        {isUpdating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : null}
        <span>Update Status</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent>
          {statuses.map((status) => (
            <DropdownMenuItem
              key={status}
              onClick={() => handleStatusUpdate(status)}
              disabled={status === order.status || isUpdating}
            >
              {status}
            </DropdownMenuItem>
          ))}
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );
}

    