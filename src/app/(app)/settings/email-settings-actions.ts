
'use server';

import { promises as fs } from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';
import nodemailer from 'nodemailer';
import { smtpConfig } from '@/lib/smtp-credentials';

const filePath = path.join(process.cwd(), 'src/lib/smtp-credentials.ts');

export async function updateSmtpPassword(
    prevState: { success: boolean, message: string },
    formData: FormData
): Promise<{ success: boolean; message: string }> {

    const password = formData.get('password') as string;

    if (!password) {
        return { success: false, message: 'Password cannot be empty.' };
    }

    try {
        const currentContent = await fs.readFile(filePath, 'utf8');

        // This is a simple regex replacement, but it's effective for this specific file structure.
        // It avoids having to parse the file as JS/TS.
        const newContent = currentContent.replace(
            /pass: ".*"/,
            `pass: "${password}"`
        );

        if (newContent === currentContent) {
             return { success: false, message: 'Could not find the password field to update in the configuration file.' };
        }

        await fs.writeFile(filePath, newContent, 'utf8');

        // Revalidate the settings page to reflect the change (e.g., show the "Configuration Complete" message)
        revalidatePath('/settings');

        return { success: true, message: 'SMTP password updated successfully. Live email sending is now configured.' };
    } catch (error) {
        console.error('Failed to update SMTP password:', error);
        return { success: false, message: 'An internal error occurred while saving the password.' };
    }
}


export async function sendTestEmail(
  prevState: { success: boolean, message: string }
): Promise<{ success: boolean; message: string }> {

  if (!smtpConfig.host || !smtpConfig.user || !smtpConfig.pass || smtpConfig.pass === 'YOUR_PASSWORD_HERE') {
    return { success: false, message: 'SMTP configuration is incomplete. Please save a password first.' };
  }

  const transporter = nodemailer.createTransport({
    host: smtpConfig.host,
    port: smtpConfig.port,
    secure: smtpConfig.port === 465,
    auth: {
      user: smtpConfig.user,
      pass: smtpConfig.pass,
    },
  });

  const options = {
    from: `"WineSpace System Test" <${smtpConfig.user}>`,
    to: 'info@winespace.co.za',
    subject: 'WineSpace SMTP Test Email',
    text: 'This is a test email to confirm that your SMTP settings are configured correctly.',
  };

  try {
    await transporter.sendMail(options);
    return { success: true, message: 'Test email sent successfully to info@winespace.co.za!' };
  } catch (error) {
    console.error('Error sending test email:', error);
    const errorMessage = error instanceof Error ? `Connection failed: ${error.message}` : 'An unknown error occurred.';
    return { success: false, message: errorMessage };
  }
}
