
'use client';

import { useEffect, useRef, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Landmark, Loader2, Send, UploadCloud, X } from 'lucide-react';
import { sendFxQuoteRequest } from './actions';

const initialState = { success: false, message: '' };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending Request...</>
      ) : (
        <><Send className="mr-2 h-4 w-4" /> Send for Quoting</>
      )}
    </Button>
  );
}

export default function FxPage() {
  const { toast } = useToast();
  const [state, formAction] = useFormState(sendFxQuoteRequest, initialState);
  const [files, setFiles] = useState<File[]>([]);
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast({ title: 'Request Sent', description: state.message });
        formRef.current?.reset();
        setFiles([]);
      } else {
        toast({ variant: 'destructive', title: 'Request Failed', description: state.message });
      }
    }
  }, [state, toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Foreign Exchange (Forex) Services</h2>
        <p className="text-muted-foreground">
          Competitive exchange rates and expert service in partnership with Shield Capital.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Streamline Your International Payments</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none text-foreground/80">
              <p>
                In partnership with Shield Capital, an authorised financial services provider (FSP No. 49382), WineSpace is pleased to offer our clients a complete forex solution. From competitive exchange rates and expert market guidance to offshore investment opportunities, we’ve got you covered.
              </p>
              <p>
                Our offering includes a range of services designed to help you save money on your foreign exchange payments and protect your business from currency market volatility. This includes spot transfers, forward exchange contracts (FECs), and market orders.
              </p>
              <ul>
                <li><strong>No international transfer fees on payments over R50,000.</strong></li>
                <li><strong>Bank-beating exchange rates</strong> and expert market guidance.</li>
                <li>Hedge against currency fluctuations with <strong>Forward Exchange Contracts (FECs)</strong>.</li>
                <li>Access to a user-friendly <strong>online payment platform</strong>.</li>
              </ul>
            </CardContent>
            <CardFooter>
                 <Image src="https://winespace.co.za/sitepad-data/uploads/2021/03/CS3876_Shield-Capital_Logo_Final.jpg" alt="Shield Capital Logo" width={200} height={51} />
            </CardFooter>
          </Card>
        </div>

        <Card className="sticky top-20">
          <CardHeader>
            <CardTitle>Request a Quote</CardTitle>
            <CardDescription>
              Upload your foreign invoice(s) below and we will get back to you with a competitive quote.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form ref={formRef} action={formAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invoices">Invoice(s)</Label>
                <Input
                  id="invoices"
                  name="invoices"
                  type="file"
                  multiple
                  required
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  className="pt-1.5"
                />
                 <p className="text-xs text-muted-foreground">You can select multiple files.</p>
              </div>

              {files.length > 0 && (
                <div className="space-y-2">
                    <p className="text-sm font-medium">Selected Files:</p>
                    <ul className="list-none space-y-1">
                        {files.map((file, index) => (
                            <li key={index} className="flex items-center justify-between text-sm text-muted-foreground bg-muted p-1.5 rounded-md">
                               <span className="truncate pr-2">{file.name}</span>
                               <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => removeFile(index)}>
                                    <X className="h-3 w-3" />
                               </Button>
                            </li>
                        ))}
                    </ul>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea id="notes" name="notes" placeholder="Any specific instructions or questions?" />
              </div>

              <SubmitButton />
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
