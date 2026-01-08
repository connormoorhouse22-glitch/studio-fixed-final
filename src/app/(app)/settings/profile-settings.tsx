
'use client';

import { useEffect, useRef, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateUser } from '@/lib/userActions';
import type { User, UpdateUserResponse } from '@/lib/users';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

const initialState: UpdateUserResponse = { message: '' };

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 'Save Changes'}
        </Button>
    )
}

export function ProfileSettings({ user }: { user: User | null }) {
    const { toast } = useToast();
    const [state, formAction] = useFormState(updateUser.bind(null, user?.email || ''), initialState);
    const [signaturePreview, setSignaturePreview] = useState<string | null>(user?.signatureUrl || null);

    useEffect(() => {
        if (state.message) {
            toast({
                title: state.message === 'Success' ? 'Profile Updated' : 'Update Failed',
                description: state.message === 'Success' ? 'Your profile has been updated.' : state.message,
                variant: state.message === 'Success' ? 'default' : 'destructive',
            });
        }
    }, [state, toast]);

    const handleSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSignaturePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    if (!user) {
        return <p>Loading user profile...</p>;
    }

    return (
        <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Update your personal and company information.</CardDescription>
            </CardHeader>
            <CardContent>
                <form action={formAction} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" name="name" defaultValue={user.name} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email (cannot be changed)</Label>
                        <Input id="email" type="email" defaultValue={user.email} disabled />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="signature">Signature</Label>
                        <Input id="signature" name="signature" type="file" accept="image/png, image/jpeg" onChange={handleSignatureChange} />
                        <p className="text-xs text-muted-foreground">Upload an image of your signature (PNG with transparent background is recommended).</p>
                        {signaturePreview && (
                             <div className="mt-2 p-4 border rounded-md max-w-xs">
                                <Image src={signaturePreview} alt="Signature preview" width={200} height={100} style={{ objectFit: 'contain' }} />
                             </div>
                        )}
                    </div>
                    <SubmitButton />
                </form>
            </CardContent>
        </Card>
    )
}
