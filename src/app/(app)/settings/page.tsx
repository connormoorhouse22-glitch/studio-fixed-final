'use server';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// Profile remains commented out since the file is physically missing from the folder
// import { ProfileSettings } from './profile-settings';
import { EmailSettings } from './email-settings-v2';
import { cookies } from 'next/headers';
import { getUserByEmail } from '@/lib/userActions';


export default async function SettingsPage() {
  const userEmail = cookies().get('userEmail')?.value;
  const user = userEmail ? await getUserByEmail(userEmail) : null;


  return (
    <div className="mx-auto w-full max-w-4xl">
      <h2 className="text-3xl font-bold tracking-tight mb-4">Settings</h2>
      <Tabs defaultValue="email" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <div className="p-4 border rounded-md">Profile settings coming soon.</div>
        </TabsContent>
         <TabsContent value="email">
            <EmailSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}