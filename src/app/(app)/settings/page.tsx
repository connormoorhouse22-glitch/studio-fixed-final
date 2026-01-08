
'use server';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileSettings } from './profile-settings';
import { EmailSettings } from './email-settings.tsx';
import { cookies } from 'next/headers';
import { getUserByEmail } from '@/lib/userActions';


export default async function SettingsPage() {
  const userEmail = cookies().get('userEmail')?.value;
  const user = userEmail ? await getUserByEmail(userEmail) : null;


  return (
    <div className="mx-auto w-full max-w-4xl">
      <h2 className="text-3xl font-bold tracking-tight mb-4">Settings</h2>
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <ProfileSettings user={user} />
        </TabsContent>
         <TabsContent value="email">
            <EmailSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
