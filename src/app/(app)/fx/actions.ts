
'use server';

import { cookies } from 'next/headers';
import nodemailer from 'nodemailer';
import { render } from '@react-email/components';
import { smtpConfig } from '@/lib/smtp-credentials';
import { FxQuoteRequestEmail } from './fx-quote-request-email';

interface FxQuoteResponse {
  success: boolean;
  message: string;
}

export async function sendFxQuoteRequest(
  prevState: FxQuoteResponse,
  formData: FormData
): Promise<FxQuoteResponse> {
  const cookieStore = cookies();
  const producerEmail = cookieStore.get('userEmail')?.value;
  const producerCompany = cookieStore.get('userCompany')?.value;

  if (!producerEmail || !producerCompany) {
    return { success: false, message: 'You must be logged in to submit a quote request.' };
  }

  const invoiceFiles = formData.getAll('invoices') as File[];
  const notes = formData.get('notes') as string;

  if (invoiceFiles.length === 0 || invoiceFiles.some(f => f.size === 0)) {
    return { success: false, message: 'Please upload at least one invoice file.' };
  }

  if (!smtpConfig.host || !smtpConfig.user || !smtpConfig.pass) {
    console.error('SMTP configuration is incomplete. Cannot send FX quote request.');
    return { success: false, message: 'The server is not configured to send emails. Please contact support directly.' };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.port === 465,
      auth: {
        user: smtpConfig.user,
        pass: smtpConfig.pass,
      },
    });

    const attachments = await Promise.all(
      invoiceFiles.map(async (file) => ({
        filename: file.name,
        content: Buffer.from(await file.arrayBuffer()),
      }))
    );

    const emailHtml = render(
      FxQuoteRequestEmail({
        producerCompany,
        producerEmail,
        notes,
        fileNames: attachments.map(a => a.filename),
      })
    );

    const options = {
      from: `"WineSpace FX Quotes" <${smtpConfig.user}>`,
      to: 'fx@winespace.co.za',
      replyTo: producerEmail,
      subject: `New Forex Quote Request from ${producerCompany}`,
      html: emailHtml,
      attachments,
    };

    await transporter.sendMail(options);
    return { success: true, message: 'Your forex quote request has been sent successfully!' };

  } catch (error) {
    console.error('Error sending FX quote request email:', error);
    return { success: false, message: 'An internal error occurred. Please try again later.' };
  }
}
