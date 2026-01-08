
'use server';

import nodemailer from 'nodemailer';
import { render } from '@react-email/components';
import { SupplierOrderNotificationEmail } from '@/components/emails/supplier-order-notification';
import { LabelSubmissionNotificationEmail } from '@/components/emails/label-submission-notification';
import { ProducerWelcomeEmail } from '@/components/emails/producer-welcome-email';
import { SupplierWelcomeEmail } from '@/components/emails/supplier-welcome-email';
import { AdminNewUserNotificationEmail } from '@/components/emails/admin-new-user-notification';
import { BookingRequestNotificationEmail } from '@/components/emails/booking-request-notification';
import { BookingStatusUpdateEmail } from '@/components/emails/booking-status-update-email';
import { BulkWineEnquiryInternalEmail } from '@/components/emails/bulk-wine-enquiry-internal';
import { BulkWineEnquiryConfirmationEmail } from '@/components/emails/bulk-wine-enquiry-confirmation';
import { QrCodeRequestEmail } from '@/components/emails/qr-code-request-email';
import { QrCodeProducerConfirmationEmail } from '@/components/emails/qr-code-producer-confirmation';
import { SawisReturnNotificationEmail } from '@/components/emails/sawis-return-notification';
import { DeliveryRecordNotificationEmail } from '@/components/emails/delivery-record-notification';
import type { Order } from './order-actions';
import { getOrderById } from './order-actions';
import type { Booking } from './booking-actions';
import { getUserByCompany, getUserByEmail } from './user-actions';
import { smtpConfig } from './smtp-credentials';
import type { User } from './users';
import { getProductById } from './product-actions';
import { getBulkWineListingById, type BulkWineListing } from './bulk-wine-actions';
import { cookies } from 'next/headers';
import type { QrCodeRequest } from '@/app/(app)/qr-codes/request/actions';
import type { Sawis5Row, Sawis7OverleafContainerData, Sawis7OverleafPriceData, Sawis7Row } from '@/app/(app)/sawis/returns/form';
import type { DeliveryRecord } from './delivery-record-actions';


interface LabelQuoteEmailProps {
  to: string;
  from: string;
  fromCompany: string;
  frontQuantity: string;
  backQuantity: string;
  notes: string;
  finishes: string;
  artwork: {
    filename: string;
    content: Buffer;
  };
}

interface QrCodeEmailProps {
  producer: User;
  requests: QrCodeRequest[];
  attachments: {
    filename: string;
    content: Buffer;
  }[];
  orderNumber: string;
}

export interface SawisReturnEmailProps {
    producer: User;
    recipientEmail: string;
    month: string;
    attachments: {
        filename: string;
        content: Buffer;
    }[];
    submitterName: string;
    submissionDate: string;
    sawis5Opening: Sawis7Row;
    sawis5Rows: Sawis5Row[];
    // Productions and Additions
    productionTotals: Sawis7Row;
    fortificationTotals: Sawis7Row;
    additionsTotals: Sawis7Row;
    transferInTotals: Sawis7Row;
    surplusTotals: Sawis7Row;
    allAdditions: Sawis7Row;
    // Disposals and Utilizations
    bulkNonDutyTotals: Sawis7Row;
    bulkDutyTotals: Sawis7Row;
    packagedNonDutyTotals: Sawis7Row;
    packagedDutyTotals: Sawis7Row;
    exportTotals: Sawis7Row;
    bottlingTotals: Sawis7Row;
    transferOutTotals: Sawis7Row;
    leesDestroyedTotals: Sawis7Row;
    deficiencyTotals: Sawis7Row;
    allDisposals: Sawis7Row;
    // Balances
    closingBalance: Sawis7Row;
    overleafPriceData: Sawis7OverleafPriceData;
    overleafContainerData: Sawis7OverleafContainerData;
}

interface DeliveryRecordEmailProps {
  producer: User;
  record: DeliveryRecord;
  recipientEmail: string;
}

export async function sendDeliveryRecordEmail(props: DeliveryRecordEmailProps) {
  if (!smtpConfig.host || !smtpConfig.port || !smtpConfig.user || !smtpConfig.pass) {
    console.error('SMTP configuration is incomplete. Cannot send delivery record email.');
    throw new Error('SMTP configuration is incomplete on the server.');
  }

  const transporter = nodemailer.createTransport({
    host: smtpConfig.host,
    port: smtpConfig.port,
    secure: smtpConfig.port === 465,
    auth: { user: smtpConfig.user, pass: smtpConfig.pass },
  });

  const emailHtml = render(DeliveryRecordNotificationEmail(props));
  
  const attachments = [];
  const fs = require('fs').promises;
  const path = require('path');

  // Helper to safely read a file and push it to attachments
  const attachFile = async (filePath: string | undefined, defaultFilename: string) => {
    if (!filePath) return;
    try {
        const fullPath = path.join(process.cwd(), 'public', filePath);
        const buffer = await fs.readFile(fullPath);
        attachments.push({
            filename: defaultFilename,
            content: buffer,
        });
    } catch (e) {
        console.error(`Could not attach file from path: ${filePath}`, e);
    }
  };

  await attachFile(props.record.consignorSignaturePath, `consignor-signature-${props.record.deliveryRecordNo}.png`);
  await attachFile(props.record.driverSignaturePath, `driver-signature-${props.record.deliveryRecordNo}.png`);

  const options = {
    from: `"WineSpace Deliveries" <${smtpConfig.user}>`,
    to: props.recipientEmail,
    subject: `Delivery Record from ${props.producer.company}: #${props.record.deliveryRecordNo}`,
    html: emailHtml,
    attachments,
  };

  await transporter.sendMail(options);
}


export async function sendSawisReturnEmail(props: SawisReturnEmailProps) {
    if (!smtpConfig.host || !smtpConfig.port || !smtpConfig.user || !smtpConfig.pass) {
        console.error('SMTP configuration is incomplete. Cannot send SAWIS return.');
        throw new Error('SMTP configuration is incomplete on the server.');
    }

    const transporter = nodemailer.createTransport({
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.port === 465,
        auth: { user: smtpConfig.user, pass: smtpConfig.pass },
    });

    const emailHtml = render(SawisReturnNotificationEmail(props));

    const options = {
        from: `"WineSpace SAWIS Returns" <${smtpConfig.user}>`,
        to: props.recipientEmail,
        cc: props.producer.email, // CC the producer for their records
        subject: `SAWIS Return for ${props.month} from ${props.producer.company}`,
        html: emailHtml,
        attachments: props.attachments,
    };

    await transporter.sendMail(options);
}


export async function sendQrCodeRequestEmail(props: QrCodeEmailProps) {
  if (!smtpConfig.host || !smtpConfig.port || !smtpConfig.user || !smtpConfig.pass) {
    console.error('SMTP configuration is incomplete. Cannot send email.');
    throw new Error('SMTP configuration is incomplete on the server.');
  }

  const transporter = nodemailer.createTransport({
    host: smtpConfig.host,
    port: smtpConfig.port,
    secure: smtpConfig.port === 465,
    auth: { user: smtpConfig.user, pass: smtpConfig.pass },
  });

  // 1. Internal Notification
  const internalEmailHtml = render(QrCodeRequestEmail({
      producer: props.producer,
      requests: props.requests,
      orderNumber: props.orderNumber,
  }));

  const internalOptions = {
    from: `"WineSpace QR Codes" <${smtpConfig.user}>`,
    to: 'info@winespace.co.za',
    subject: `New QR Code Request (${props.orderNumber}) from ${props.producer.company}`,
    html: internalEmailHtml,
    replyTo: props.producer.email,
    attachments: props.attachments,
  };

  // 2. Producer Confirmation
  const producerEmailHtml = render(QrCodeProducerConfirmationEmail({
      requests: props.requests,
      orderNumber: props.orderNumber,
  }));

  const producerOptions = {
    from: `"WineSpace QR Codes" <${smtpConfig.user}>`,
    to: props.producer.email,
    subject: `Your WineSpace QR Code Request #${props.orderNumber} has been received`,
    html: producerEmailHtml,
  };

  // Send both emails
  await Promise.all([
    transporter.sendMail(internalOptions),
    transporter.sendMail(producerOptions)
  ]);
}


export async function sendLabelQuoteEmail(props: LabelQuoteEmailProps) {
  if (!smtpConfig.host || !smtpConfig.port || !smtpConfig.user || !smtpConfig.pass) {
    console.error('SMTP configuration is incomplete. Cannot send email.');
    return { success: false, message: 'SMTP configuration is incomplete on the server.' };
  }

  const transporter = nodemailer.createTransport({
    host: smtpConfig.host,
    port: smtpConfig.port,
    secure: smtpConfig.port === 465, // true for 465, false for other ports
    auth: {
      user: smtpConfig.user,
      pass: smtpConfig.pass,
    },
  });

  const emailHtml = render(
    LabelSubmissionNotificationEmail({
      frontQuantity: props.frontQuantity,
      backQuantity: props.backQuantity,
      notes: props.notes,
      finishes: props.finishes,
      fromEmail: props.from,
      fromCompany: props.fromCompany,
    })
  );

  const options = {
    from: `"WineSpace Label Orders" <${smtpConfig.user}>`,
    to: props.to,
    subject: `New Label Production Request from - ${props.fromCompany}`,
    html: emailHtml,
    attachments: [
      {
        filename: props.artwork.filename,
        content: props.artwork.content,
      },
    ],
  };

  try {
    const info = await transporter.sendMail(options);
    console.log(`Email sent successfully: ${info.messageId}`);
    return { success: true, data: { messageId: info.messageId } };
  } catch (error) {
    console.error('Error sending email:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, message: `Failed to send email: ${errorMessage}` };
  }
}

export async function sendOrderNotificationEmail(to: string, order: Order, attachment?: { filename: string; content: Buffer }) {

  if (!smtpConfig.host || !smtpConfig.port || !smtpConfig.user || !smtpConfig.pass) {
    console.error('SMTP configuration is incomplete. Cannot send email.');
    return { success: false, message: 'SMTP configuration is incomplete on the server.' };
  }

  const transporter = nodemailer.createTransport({
    host: smtpConfig.host,
    port: smtpConfig.port,
    secure: smtpConfig.port === 465, // true for 465, false for other ports
    auth: {
      user: smtpConfig.user,
      pass: smtpConfig.pass,
    },
  });

  // Enrich order items with product details for the email template
  const enrichedItems = await Promise.all(
    order.items.map(async (item) => {
      // For quote requests, the item ID is not a real product, so we can skip fetching
      if (item.id.startsWith('quote-')) {
        return item;
      }
      const product = await getProductById(item.id);
      return {
        ...item,
        category: product?.category,
        subCategory: product?.subCategory,
        unitsPerPallet: product?.unitsPerPallet,
      };
    })
  );

  const enrichedOrder = { ...order, items: enrichedItems };

  const emailHtml = render(SupplierOrderNotificationEmail({ order: enrichedOrder }));

  const subject = order.status === 'Quote Request' 
    ? `Quote Request: ${order.orderNumber} from ${order.producerCompany}`
    : `New Order Received: ${order.orderNumber} from ${order.producerCompany}`;

  const attachments = [];
  if (attachment) {
    attachments.push(attachment);
  }

  const options = {
    from: `"WineSpace Orders" <${smtpConfig.user}>`,
    to,
    subject,
    html: emailHtml,
    attachments,
  };

  try {
    const info = await transporter.sendMail(options);
    console.log(`Email sent successfully: ${info.messageId}`);
    return { success: true, data: { messageId: info.messageId } };
  } catch (error) {
    console.error('Error sending email:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, message: `Failed to send email: ${errorMessage}` };
  }
}


export async function resendOrderNotification(
  orderId: string,
  prevState: { success: boolean; message: string }
): Promise<{ success: boolean; message: string }> {
  try {
    const order = await getOrderById(orderId);
    if (!order) {
      return { success: false, message: 'Order not found.' };
    }

    const producerUser = await getUserByEmail(order.producerEmail);
    const preferredContacts = producerUser?.preferredSupplierContacts?.[order.supplierCompany] || [];
    const validPreferredContacts = preferredContacts.filter(c => c && c !== 'none');

    let recipientEmails: string[] = [];

    if (validPreferredContacts.length > 0) {
        recipientEmails = validPreferredContacts;
    } else {
        const supplierUser = await getUserByCompany(order.supplierCompany);
        if (supplierUser?.email) {
            recipientEmails.push(supplierUser.email);
        }
    }
    
    if (recipientEmails.length === 0) {
      return { success: false, message: `No contact email could be found for supplier ${order.supplierCompany}.` };
    }


    console.log(`Attempting to resend notification for order ${orderId} to ${recipientEmails.join(', ')}`);
    const results = await Promise.all(
        recipientEmails.map(email => sendOrderNotificationEmail(email, order))
    );

    const failures = results.filter(r => !r.success);
    if (failures.length > 0) {
      return { success: false, message: `Failed to send to: ${failures.map(f => f.message).join(', ')}` };
    }

    return { success: true, message: `Email successfully sent to ${recipientEmails.join(', ')}.` };

  } catch (error) {
    console.error('Error resending order notification:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { success: false, message: errorMessage };
  }
}

export async function sendProducerWelcomeEmail(user: User) {
  if (!smtpConfig.host || !smtpConfig.port || !smtpConfig.user || !smtpConfig.pass) {
    console.error('SMTP configuration is incomplete. Cannot send welcome email.');
    return { success: false, message: 'SMTP configuration is incomplete on the server.' };
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

  const emailHtml = render(ProducerWelcomeEmail({ user }));

  const options = {
    from: `"The WineSpace Team" <${smtpConfig.user}>`,
    to: user.email,
    subject: `Welcome to WineSpace - Your Account is Active!`,
    html: emailHtml,
  };

  try {
    const info = await transporter.sendMail(options);
    console.log(`Welcome email sent successfully to ${user.email}: ${info.messageId}`);
    return { success: true, data: { messageId: info.messageId } };
  } catch (error) {
    console.error(`Error sending welcome email to ${user.email}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, message: `Failed to send welcome email: ${errorMessage}` };
  }
}

export async function sendSupplierWelcomeEmail(user: User) {
  if (!smtpConfig.host || !smtpConfig.port || !smtpConfig.user || !smtpConfig.pass) {
    console.error('SMTP configuration is incomplete. Cannot send welcome email.');
    return { success: false, message: 'SMTP configuration is incomplete on the server.' };
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

  const emailHtml = render(SupplierWelcomeEmail({ user }));

  const options = {
    from: `"The WineSpace Team" <${smtpConfig.user}>`,
    to: user.email,
    subject: `Welcome to WineSpace - Your Supplier Account is Active!`,
    html: emailHtml,
  };

  try {
    const info = await transporter.sendMail(options);
    console.log(`Supplier welcome email sent successfully to ${user.email}: ${info.messageId}`);
    return { success: true, data: { messageId: info.messageId } };
  } catch (error) {
    console.error(`Error sending supplier welcome email to ${user.email}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, message: `Failed to send welcome email: ${errorMessage}` };
  }
}

export async function sendAdminNewUserNotification(user: Omit<User, 'id' | 'password'>) {
  if (!smtpConfig.host || !smtpConfig.port || !smtpConfig.user || !smtpConfig.pass) {
    console.error('SMTP configuration is incomplete. Cannot send admin notification.');
    return;
  }
  
  const transporter = nodemailer.createTransport({
    host: smtpConfig.host,
    port: smtpConfig.port,
    secure: smtpConfig.port === 465,
    auth: { user: smtpConfig.user, pass: smtpConfig.pass },
  });

  const emailHtml = render(AdminNewUserNotificationEmail({ user }));

  const options = {
    from: `"WineSpace System" <${smtpConfig.user}>`,
    to: 'info@winespace.co.za',
    subject: `New User Registration: ${user.company}`,
    html: emailHtml,
  };

  try {
    await transporter.sendMail(options);
    console.log(`Admin notification sent for new user: ${user.email}`);
  } catch (error) {
    console.error(`Error sending admin notification for ${user.email}:`, error);
  }
}

export async function sendBookingRequestEmail(to: string, booking: Booking) {
  if (!smtpConfig.host || !smtpConfig.port || !smtpConfig.user || !smtpConfig.pass) {
    console.error('SMTP configuration is incomplete. Cannot send booking request email.');
    return { success: false, message: 'SMTP configuration is incomplete on the server.' };
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

  const emailHtml = render(BookingRequestNotificationEmail({ booking }));

  const options = {
    from: `"WineSpace Bookings" <${smtpConfig.user}>`,
    to: to,
    subject: `New Booking Request from ${booking.producerCompany}`,
    html: emailHtml,
    replyTo: booking.producerEmail,
  };

  try {
    const info = await transporter.sendMail(options);
    console.log(`Booking request email sent successfully to ${to}: ${info.messageId}`);
    return { success: true, data: { messageId: info.messageId } };
  } catch (error) {
    console.error(`Error sending booking request email to ${to}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, message: `Failed to send booking request email: ${errorMessage}` };
  }
}

export async function sendBookingStatusUpdateEmail(booking: Booking, status: 'confirmed' | 'rejected') {
    if (!smtpConfig.host || !smtpConfig.port || !smtpConfig.user || !smtpConfig.pass) {
        console.error('SMTP configuration is incomplete. Cannot send booking status update email.');
        return { success: false, message: 'SMTP configuration is incomplete on the server.' };
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

    const emailHtml = render(BookingStatusUpdateEmail({ booking, status }));

    const subject = status === 'confirmed' 
        ? `Booking Confirmed with ${booking.providerCompany}`
        : `Update on your booking request with ${booking.providerCompany}`;

    const options = {
        from: `"WineSpace Bookings" <${smtpConfig.user}>`,
        to: booking.producerEmail,
        subject: subject,
        html: emailHtml,
    };

    try {
        const info = await transporter.sendMail(options);
        console.log(`Booking status update email sent successfully to ${booking.producerEmail}: ${info.messageId}`);
        return { success: true, data: { messageId: info.messageId } };
    } catch (error) {
        console.error(`Error sending booking status update email to ${booking.producerEmail}:`, error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { success: false, message: `Failed to send email: ${errorMessage}` };
    }
}

export async function sendBulkWineEnquiry(
  prevState: { success: boolean; message: string },
  formData: FormData
): Promise<{ success: boolean; message: string }> {
    const cookieStore = cookies();
    const producerEmail = cookieStore.get('userEmail')?.value;
    const producerCompany = cookieStore.get('userCompany')?.value;

    if (!producerEmail || !producerCompany) {
        return { success: false, message: 'Could not find your user information. Please log in again.' };
    }
    
    const listingId = formData.get('listingId') as string;
    if (!listingId) {
        return { success: false, message: 'Listing ID is missing.' };
    }
    
    if (!smtpConfig.host || !smtpConfig.port || !smtpConfig.user || !smtpConfig.pass) {
        console.error('SMTP configuration is incomplete. Cannot send bulk wine enquiry.');
        return { success: false, message: 'Email service is not configured. Please contact support.' };
    }

    try {
        const [listing, enquirer] = await Promise.all([
            getBulkWineListingById(listingId),
            getUserByEmail(producerEmail),
        ]);

        if (!listing || !enquirer) {
            return { success: false, message: 'Could not retrieve listing or your user details.' };
        }

        const transporter = nodemailer.createTransport({
            host: smtpConfig.host,
            port: smtpConfig.port,
            secure: smtpConfig.port === 465,
            auth: { user: smtpConfig.user, pass: smtpConfig.pass },
        });

        // 1. Send internal notification email
        const internalEmailHtml = render(BulkWineEnquiryInternalEmail({ listing, enquirer }));
        const internalMailOptions = {
            from: `"WineSpace Bulk Wine" <${smtpConfig.user}>`,
            to: 'bulkwine@winespace.co.za',
            subject: `New Bulk Wine Enquiry from ${enquirer.company}`,
            html: internalEmailHtml,
            replyTo: enquirer.email,
        };

        // 2. Send confirmation email to the producer
        const confirmationEmailHtml = render(BulkWineEnquiryConfirmationEmail({ listing }));
        const confirmationMailOptions = {
            from: `"WineSpace Bulk Wine" <${smtpConfig.user}>`,
            to: enquirer.email,
            subject: `We've received your bulk wine enquiry`,
            html: confirmationEmailHtml,
        };
        
        // Send both emails
        await Promise.all([
            transporter.sendMail(internalMailOptions),
            transporter.sendMail(confirmationMailOptions),
        ]);
        
        return { success: true, message: "Your enquiry has been sent successfully. We'll be in touch." };

    } catch (error) {
        console.error('Error sending bulk wine enquiry emails:', error);
        return { success: false, message: 'An internal server error occurred while sending the enquiry.' };
    }
}
