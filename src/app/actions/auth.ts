import { db } from '@/lib/firebase-admin';

export async function loginAdmin(email: string) {
  try {
    const cleanEmail = email.toLowerCase().trim();
    const userDoc = await db.collection('users').doc(cleanEmail).get();

    if (!userDoc.exists) {
      return { error: "Admin user profile not found in database." };
    }

    const userData = userDoc.data();
    if (userData?.role !== 'admin') {
      return { error: "Unauthorized: Admin role required." };
    }

    return { success: true, user: userData };
  } catch (error: any) {
    return { error: "Database connection error." };
  }
}
