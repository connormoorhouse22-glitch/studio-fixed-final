
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
import { logAuditEvent } from '@/lib/audit-log-actions';

export default function ProducerLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
        if (!email || !password) {
             toast({
                variant: 'destructive',
                title: 'Login Failed',
                description: 'Please enter your email and password.',
             });
             setIsLoading(false);
             return;
        }

        const user = await getUserByEmail(email);
        
        if (!user || user.role !== 'Producer') {
            toast({
                variant: 'destructive',
                title: 'Login Failed',
                description: 'No active producer account found with that email.',
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

        if (user.status === 'Active') {
             // In a real app, you would verify the password against a hash here.
             // For this prototype, we are proceeding based on the user's active status.

             // Use server action to set cookies
             await signIn({
                email: user.email,
                role: user.role,
                company: user.company,
             });

            await logAuditEvent({
                actor: { email: user.email, role: user.role, company: user.company },
                event: 'USER_LOGIN',
                entity: { type: 'USER', id: user.email },
                details: {
                    summary: `Producer (${user.name}) logged in.`
                }
            });
             
             // Also set localStorage for immediate client-side access
             localStorage.setItem('userRole', user.role);
             localStorage.setItem('userEmail', user.email);
             localStorage.setItem('userCompany', user.company);
             localStorage.setItem('userName', user.name);

             router.push('/producer/dashboard');
             router.refresh(); // Force a refresh to apply server-side context
        } else {
             toast({
                variant: 'destructive',
                title: 'Login Failed',
                description: 'Invalid credentials or account is not an active producer account.',
             });
             setIsLoading(false);
        }
    } catch (error) {
        console.error("Login Error:", error);
        toast({
            variant: 'destructive',
            title: 'Login Error',
            description: 'An unexpected error occurred. Please try again.',
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
            <CardTitle className="pt-2 text-3xl">Producer Portal</CardTitle>
            <CardDescription>Access your procurement dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@yourwinery.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
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
                  required
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
