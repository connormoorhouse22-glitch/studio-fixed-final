
'use client';

import { useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Promotion } from '@/lib/promotion-actions';
import { deletePromotion, type PromotionResponse } from '@/lib/promotion-actions';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2, TicketPercent } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';


const initialState: PromotionResponse = {
  success: false,
  message: '',
};

function DeleteButton() {
    const { pending } = useFormStatus();
    return (
        <Button variant="ghost" size="icon" type="submit" disabled={pending}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-destructive" />}
        </Button>
    )
}

function DeleteForm({ promotionId, onDeleted }: { promotionId: string, onDeleted: () => void }) {
    const { toast } = useToast();
    const [state, formAction] = useFormState(deletePromotion, initialState);

     useEffect(() => {
        if (state.message) {
            if (state.success) {
                toast({
                    title: 'Success',
                    description: state.message,
                });
                onDeleted();
            } else {
                 toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: state.message,
                });
            }
        }
    }, [state, toast, onDeleted]);

    return (
        <form action={formAction}>
            <input type="hidden" name="promotionId" value={promotionId} />
            <DeleteButton />
        </form>
    )
}


interface PromotionsListProps {
    promotions: Promotion[];
    onUpdate: () => void;
}

export function PromotionsList({ promotions, onUpdate }: PromotionsListProps) {
    if (promotions.length === 0) {
        return (
            <div className="text-center text-muted-foreground py-10">
                <TicketPercent className="mx-auto h-12 w-12" />
                <p className="mt-4">You have no active promotions.</p>
            </div>
        )
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-center">Discount</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {promotions.slice().reverse().map(promo => (
                    <TableRow key={promo.id}>
                        <TableCell className="font-medium">{promo.productName}</TableCell>
                        <TableCell className="text-center font-mono">{promo.discountPercentage}%</TableCell>
                        <TableCell className="text-right">
                           <DeleteForm promotionId={promo.id} onDeleted={onUpdate} />
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
