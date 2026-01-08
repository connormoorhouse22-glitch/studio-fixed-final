
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getUserByEmail } from './user-actions';

export async function signIn(payload: { email: string; role: string; company: string }) {
  const user = await getUserByEmail(payload.email);
  
  if (!user || user.status !== 'Active') {
    throw new Error('Invalid email or password');
  }

  // Next.js 14 Stable: cookies() does NOT use await
  const cookieStore = cookies();
  cookieStore.set('userEmail', payload.email, { httpOnly: true, path: '/' });
  cookieStore.set('userRole', payload.role, { httpOnly: true, path: '/' });
  cookieStore.set('userCompany', payload.company, { httpOnly: true, path: '/' });

  if (payload.role === 'Admin') redirect('/admin/dashboard');
  if (payload.role === 'Producer') redirect('/producer/dashboard');
  redirect('/');
}

export async function signOut() {
  const cookieStore = cookies();
  cookieStore.delete('userEmail');
  cookieStore.delete('userRole');
  cookieStore.delete('userCompany');
}
