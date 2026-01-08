
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { addUser, getUsers } from '@/lib/userActions';
import { Textarea } from '@/components/ui/textarea';
import type { User } from '@/lib/users';

// Simple hash function to create a consistent seed from a string
const getSeedFromEmail = (email: string) => {
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    const char = email.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [vatNumber, setVatNumber] = useState('');
  const [billingAddress, setBillingAddress] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !company || !email || !password || !role || !contactNumber || !billingAddress) {
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: 'Please fill out all required fields.',
      });
      return;
    }
    setIsLoading(true);

    try {
      const existingUsers = await getUsers();
      if (existingUsers.some(user => user.email === email)) {
        toast({
          variant: 'destructive',
          title: 'Registration Failed',
          description: 'This email is already registered.',
        });
        setIsLoading(false);
        return;
      }
      
      // All new registrations now require admin approval.
      const status = 'Pending Approval';

      const newUser: Omit<User, 'password' | 'lastLogin' | 'avatar'> = {
        name,
        company,
        email,
        role,
        status: status,
        pricingTiers: { default: 'Tier 1' }, // Explicitly set to most expensive tier
        contactNumber,
        vatNumber,
        billingAddress,
      };

      if (role === 'Mobile Service Provider') {
        newUser.services = ['Mobile Bottling', 'Mobile Labelling'];
      }

      const avatarSeed = getSeedFromEmail(email);

      await addUser({
        ...newUser,
        avatar: `https://picsum.photos/seed/${avatarSeed}/40/40`,
        lastLogin: 'Never',
      });
      
      toast({
        title: 'Registration Successful',
        description: "Your account is pending approval. You'll be notified via email once it's active."
      });

      // Redirect all new sign-ups to the homepage.
      router.push('/');

    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: 'An error occurred during registration.',
      });
    } finally {
      setIsLoading(false);
    }
  };

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
            <CardTitle className="pt-2 text-3xl">Create an Account</CardTitle>
            <CardDescription>Join the WineSpace network</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLoading}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="company">Company Name</Label>
                    <Input
                    id="company"
                    type="text"
                    placeholder="Your Winery or Company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    disabled={isLoading}
                    />
                </div>
              </div>

               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                    id="email"
                    type="email"
                    placeholder="name@yourcompany.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
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
                    />
                </div>
              </div>

               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="contactNumber">Contact Number</Label>
                    <Input
                    id="contactNumber"
                    type="tel"
                    placeholder="0821234567"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    disabled={isLoading}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="vatNumber">VAT Number (Optional)</Label>
                    <Input
                    id="vatNumber"
                    type="text"
                    placeholder="4001234567"
                    value={vatNumber}
                    onChange={(e) => setVatNumber(e.target.value)}
                    disabled={isLoading}
                    />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="billingAddress">Billing Address</Label>
                <Textarea
                    id='billingAddress'
                    placeholder='123 Main Street, Town, 1234'
                    value={billingAddress}
                    onChange={(e) => setBillingAddress(e.target.value)}
                    disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">I am a...</Label>
                <Select onValueChange={setRole} disabled={isLoading}>
                    <SelectTrigger id="role">
                        <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Producer">Producer</SelectItem>
                        <SelectItem value="Supplier">Supplier</SelectItem>
                        <SelectItem value="Mobile Service Provider">Mobile Service Provider</SelectItem>
                    </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" /> : 'Register'}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              Already have an account?{' '}
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
