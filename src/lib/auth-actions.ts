'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * ARCHITECTURE FIX: Using the @ alias ensures the compiler finds the file
 * regardless of the 'workspace' ghost folder or Linux case-sensitivity.
 */
import { getUserByEmail } from '@/lib/userActions'; 

export async function signIn(payload: { email: string; role: string; company: string }) {
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
  redirect('/login/producer');
}