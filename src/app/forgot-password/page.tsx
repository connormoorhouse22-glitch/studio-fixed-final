
'use client';

import { useEffect, useRef } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import { Grape, Loader2, Send } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { sendPasswordResetLink, type PasswordResetState } from './actions';

const initialState: PasswordResetState = {
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
      {pending ? 'Sending...' : 'Send Reset Link'}
    </Button>
  );
}

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [state, formAction] = useFormState(sendPasswordResetLink, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.success ? 'Request Sent' : 'Request Failed',
        description: state.message,
        variant: state.success ? 'default' : 'destructive',
      });
      if (state.success) {
        formRef.current?.reset();
      }
    }
  }, [state, toast]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="absolute top-4 left-4">
        <Button variant="outline" asChild>
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
      <div className="w-full max-w-md">
        <Card className="shadow-2xl">
          <CardHeader className="space-y-1 text-center">
             <div className="mx-auto inline-block rounded-lg bg-primary p-3 text-primary-foreground">
              <Grape className="h-6 w-6" />
            </div>
            <CardTitle className="pt-2 text-3xl">Forgot Password</CardTitle>
            <CardDescription>
              Enter your email and we'll send you a link to reset your password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form ref={formRef} action={formAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@yourcompany.com"
                  required
                />
              </div>
              <SubmitButton />
            </form>
             <div className="mt-4 text-center text-sm">
                Remembered your password?{' '}
                <Link href="/login/producer" className="underline text-muted-foreground hover:text-primary">
                    Log in
                </Link>
             </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
