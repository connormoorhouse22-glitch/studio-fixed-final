
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
import { signIn } from '@/lib/auth-actions';
import { logAuditEvent } from '@/lib/audit-log-actions';
import { getUserByEmail } from '@/lib/userActions';

export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const isAdminLogin = email === 'info@winespace.co.za' && password === 'connorM@22';
    
    if (isAdminLogin) {
        try {
            const adminUser = await getUserByEmail(email);

            if (!adminUser) {
                toast({
                    variant: 'destructive',
                    title: 'Login Error',
                    description: 'Admin user profile not found in database.',
                });
                setIsLoading(false);
                return;
            }

            await signIn({
                email: adminUser.email,
                role: adminUser.role,
                company: adminUser.company,
            });

            // Manually log the successful login event
            await logAuditEvent({
                actor: { email: adminUser.email, role: adminUser.role, company: adminUser.company },
                event: 'USER_LOGIN',
                entity: { type: 'USER', id: adminUser.email },
                details: {
                    summary: `Admin user (${adminUser.name}) logged in.`
                }
            });

            localStorage.setItem('userRole', adminUser.role);
            localStorage.setItem('userEmail', adminUser.email);
            localStorage.setItem('userCompany', adminUser.company);
            localStorage.setItem('userName', adminUser.name);

            router.push('/admin/dashboard');
            router.refresh();

        } catch (error) {
            console.error("Login process failed:", error);
            toast({
                variant: 'destructive',
                title: 'Login Error',
                description: error instanceof Error ? error.message : 'Failed to set up your session. Please try again.',
            });
            setIsLoading(false);
        }
    } else {
        toast({
            variant: 'destructive',
            title: 'Login Failed',
            description: 'Invalid email or password.',
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
            <CardTitle className="pt-2 text-3xl">Admin Portal</CardTitle>
            <CardDescription>Enter admin credentials to access the dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="space-y-2">
                 <Label htmlFor="password">Password</Label>
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
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
