
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Grape, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getUserByEmail } from '@/lib/userActions';
import { signIn } from '@/lib/auth-actions';

export default function SupplierLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
        const user = await getUserByEmail(email);

        if (!user || (user.role !== 'Supplier' && user.role !== 'Mobile Service Provider')) {
            toast({
                variant: 'destructive',
                title: 'Login Failed',
                description: 'No active supplier account found with that email.',
            });
            setIsLoading(false);
            return;
        }

        if (user.status === 'Pending Approval') {
            toast({
                variant: 'destructive',
                title: 'Login Failed',
                description: 'Your account is still pending approval from an administrator.',
            });
            setIsLoading(false);
            return;
        }
        
        if (user.status !== 'Active') {
             toast({
                variant: 'destructive',
                title: 'Login Failed',
                description: 'Your account is not active. Please contact support.',
             });
             setIsLoading(false);
             return;
        }

        // In a real app, you'd also verify the password here.
        // For this prototype, we'll proceed if the account is active.

        // Set secure server-side cookies via a server action
        await signIn({
            email: user.email,
            role: user.role,
            company: user.company,
        });

        // Set localStorage for immediate client-side access.
        // This MUST store the plain text company name for redirects to work.
        localStorage.setItem('userRole', user.role);
        localStorage.setItem('userCompany', user.company);
        localStorage.setItem('userEmail', user.email);
        localStorage.setItem('userName', user.name);


        if (user.role === 'Mobile Service Provider') {
          router.push('/bookings/calendar');
        } else {
          // A successful supplier login should go to the manage products page by default.
          // The redirect component at /products/manage will handle the rest.
          router.push('/products/manage');
        }
        // This is a crucial step to ensure the layout re-renders with the new user context
        router.refresh();

    } catch (error) {
        console.error('Login error:', error);
        toast({
            variant: 'destructive',
            title: 'Login Error',
            description: 'An error occurred during login. Please try again.',
        });
        setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <div className="absolute top-4 left-4">
          <Button variant="outline" asChild>
            <Link href="/">
              Back to Home
            </Link>
          </Button>
        </div>
      <div className="w-full max-w-md">
        <Card className="shadow-2xl">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto inline-block rounded-lg bg-primary p-3 text-primary-foreground">
              <Grape className="h-6 w-6" />
            </div>
            <CardTitle className="pt-2 text-3xl">Supplier Portal</CardTitle>
            <CardDescription>Manage your products and orders</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@yoursupplies.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="ml-auto inline-block text-sm text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" /> : 'Login'}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="underline text-muted-foreground hover:text-primary">
                Register
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
