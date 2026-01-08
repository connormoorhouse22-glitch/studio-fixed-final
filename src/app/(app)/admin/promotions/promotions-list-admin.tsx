
'use client';

import { useOptimistic, useTransition } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { type Promotion, toggleFeaturedStatus } from '@/lib/promotion-actions';
import { Star, Loader2, TicketPercent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

function OptimisticStar({ promotion }: { promotion: Promotion }) {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();
    const [optimisticFeatured, toggleOptimistic] = useOptimistic(
        promotion.isFeatured,
        (state) => !state
    );
    
    const handleToggle = async () => {
        startTransition(async () => {
            toggleOptimistic(promotion.isFeatured);
            const result = await toggleFeaturedStatus(promotion.id, promotion.isFeatured || false);
            if (!result.success) {
                 toast({
                    variant: 'destructive',
                    title: 'Update Failed',
                    description: result.message || "Could not update the promotion's status."
                });
            }
        });
    };

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                     <Button variant="ghost" size="icon" onClick={handleToggle} disabled={isPending}>
                         {isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Star className={cn("h-4 w-4", optimisticFeatured ? "text-yellow-500 fill-yellow-400" : "text-muted-foreground")} />
                        )}
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{optimisticFeatured ? 'Un-feature from Sidebar' : 'Feature in Sidebar'}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}


export function PromotionsListAdmin({ promotions }: { promotions: Promotion[] }) {
    
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead className="text-center">Discount</TableHead>
                    <TableHead className="text-right">Created On</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {promotions.length > 0 ? promotions.slice().reverse().map((promo) => (
                    <TableRow key={promo.id}>
                        <TableCell className="font-medium">{promo.productName}</TableCell>
                        <TableCell>{promo.supplierCompany}</TableCell>
                        <TableCell className="text-center">
                            <span className="font-mono">{promo.discountPercentage}%</span>
                        </TableCell>
                        <TableCell className="text-right">
                            {format(new Date(promo.createdAt), 'PPP')}
                        </TableCell>
                        <TableCell className="text-center">
                           <OptimisticStar promotion={promo} />
                        </TableCell>
                    </TableRow>
                )) : (
                    <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                            <TicketPercent className="mx-auto h-12 w-12" />
                            <p className="mt-4">There are no active promotions on the platform.</p>
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}
