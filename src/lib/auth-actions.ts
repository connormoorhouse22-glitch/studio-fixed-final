'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * CRITICAL: This import MUST match the new filename userActions.ts exactly.
 * This breaks the Linux build cache that was causing the "Module not found" error.
 */
import { getUserByEmail } from './userActions'; 

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