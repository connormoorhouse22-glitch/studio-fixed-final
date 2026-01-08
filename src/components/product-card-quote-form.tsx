
'use client';

import { useEffect, useRef, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { createQuoteForCork } from '@/lib/order-actions';
import { Loader2, Send } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Product } from '@/lib/product-actions';
import { Separator } from './ui/separator';

const initialState = {
  success: false,
  message: '',
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Send className="mr-2 h-4 w-4" />
      )}
      {pending ? 'Submitting...' : 'Request Quote'}
    </Button>
  );
}

export function ProductCardQuoteForm({ product }: { product: Product }) {
  const { toast } = useToast();
  const router = useRouter();
  const [state, formAction] = useFormState(createQuoteForCork, initialState);
  const [quantity, setQuantity] = useState(1000);
  const artworkFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast({
          title: 'Quote Request Sent!',
          description: state.message,
        });
        router.push('/orders');
      } else {
        toast({
          variant: 'destructive',
          title: 'Submission Failed',
          description: state.message,
        });
      }
    }
  }, [state, toast, router]);

  return (
    <form action={formAction} className="w-full space-y-4">
      <input type="hidden" name="productId" value={product.id} />
      <input type="hidden" name="productName" value={product.name} />
      <input type="hidden" name="supplier" value={product.supplier} />
      
      <Separator className="mb-4" />

      <p className="text-sm font-medium text-center">Request a quote for custom artwork on this cork.</p>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`quantity-${product.id}`}>Quantity (Units)</Label>
          <Input
            id={`quantity-${product.id}`}
            name="quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
            min="1"
            required
          />
        </div>
        <div className="space-y-2">
            <Label htmlFor={`corkVintage-${product.id}`}>Vintage</Label>
            <Input id={`corkVintage-${product.id}`} name="corkVintage" placeholder="e.g. 2024" required />
        </div>
      </div>
       <div className="space-y-2">
            <Label htmlFor={`corkVintageInCircle-${product.id}`}>Vintage in Circle</Label>
            <Select name="corkVintageInCircle" required>
                <SelectTrigger id={`corkVintageInCircle-${product.id}`}>
                    <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                </SelectContent>
            </Select>
        </div>
        <div className="space-y-2">
            <Label htmlFor={`artworkProof-${product.id}`}>Artwork Proof</Label>
            <Input id={`artworkProof-${product.id}`} name="artworkProof" type="file" ref={artworkFileRef} required />
        </div>
      <SubmitButton />
    </form>
  );
}
