
'use server';

import { render } from '@react-email/components';
import { ContactFormNotificationEmail } from '@/components/emails/contact-form-notification';
import { smtpConfig } from '@/lib/smtp-credentials';
import nodemailer from 'nodemailer';

export interface ContactFormState {
  success: boolean;
  message: string;
}

export async function sendContactEmail(
  prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const name = formData.get('name') as string;
  const fromEmail = formData.get('email') as string;
  const subject = formData.get('subject') as string;
  const message = formData.get('message') as string;

  if (!name || !fromEmail || !subject || !message) {
    return { success: false, message: 'Please fill out all fields.' };
  }

  if (!smtpConfig.host || !smtpConfig.user || !smtpConfig.pass) {
    console.error('SMTP configuration is incomplete. Cannot send contact email.');
    return { success: false, message: 'The server is not configured to send emails. Please contact support directly.' };
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

  const emailHtml = render(
    ContactFormNotificationEmail({ name, fromEmail, subject, message })
  );

  const options = {
    from: `"${name}" <${fromEmail}>`,
    to: 'info@winespace.co.za',
    subject: `New Contact Form Submission: ${subject}`,
    html: emailHtml,
    replyTo: fromEmail,
  };

  try {
    await transporter.sendMail(options);
    return { success: true, message: 'Your message has been sent successfully!' };
  } catch (error) {
    console.error('Error sending contact email:', error);
    return { success: false, message: 'An internal error occurred. Please try again later.' };
  }
}
