
'use server';

import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { initializeFirebase } from '@/firebase';
import { getUserByEmail } from '@/lib/user-actions';

export interface PasswordResetState {
  success: boolean;
  message: string;
}

export async function sendPasswordResetLink(
  prevState: PasswordResetState,
  formData: FormData
): Promise<PasswordResetState> {
  const email = formData.get('email') as string;

  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    return { success: false, message: 'Please enter a valid email address.' };
  }
  
  try {
    // This is a security best practice. We check if the user exists
    // but give a generic success message regardless, to prevent email enumeration.
    const userExists = await getUserByEmail(email);

    if (userExists) {
        // Initialize Firebase on the server to get the auth instance
        const { auth } = initializeFirebase();
        await sendPasswordResetEmail(auth, email);
    }
    
    // Always return a success message to prevent attackers from discovering registered emails.
    return { 
        success: true, 
        message: 'If an account exists for that email, a password reset link has been sent.' 
    };

  } catch (error) {
    console.error('Password reset error:', error);
    // In case of a true server error, we can inform the user.
    return { success: false, message: 'An internal error occurred. Please try again later.' };
  }
}
