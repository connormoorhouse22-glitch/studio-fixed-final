
'use server';

import { getUserByEmail } from './user-actions';
import { cookies } from 'next/headers';
import { createOrderForQuote } from './order-actions';
import { revalidatePath } from 'next/cache';

export interface LabelQuoteResponse {
  success: boolean;
  message: string;
}

export async function submitLabelQuote(
  prevState: LabelQuoteResponse,
  formData: FormData
): Promise<LabelQuoteResponse> {
  const frontQuantity = formData.get('front_quantity') as string;
  const backQuantity = formData.get('back_quantity') as string;
  const notes = formData.get('notes') as string;
  const finishes = formData.get('finishes') as string;
  const artworkFile = formData.get('artwork') as File;
  const supplierName = formData.get('supplier') as string || 'MCC'; // Default to MCC if not provided
  
  const cookieStore = cookies();
  const producerEmail = cookieStore.get('userEmail')?.value;
  const producerCompany = cookieStore.get('userCompany')?.value;

  if (!producerEmail || !producerCompany) {
     return { success: false, message: 'You must be logged in to submit a quote.' };
  }

  if (!frontQuantity || !artworkFile || artworkFile.size === 0) {
    return { success: false, message: 'Please provide a quantity for front labels and an artwork file.' };
  }
   if (artworkFile.size > 10 * 1024 * 1024) { // 10MB limit
    return { success: false, message: 'Artwork file must be less than 10MB.' };
  }


  try {
    const totalQuantity = (parseInt(frontQuantity, 10) || 0) + (parseInt(backQuantity, 10) || 0);
    
    // Save file and get path
    const uploadsDirPath = require('path').join(process.cwd(), 'public/uploads');
    const fs = require('fs').promises;
    await fs.mkdir(uploadsDirPath, { recursive: true });
    const artworkBuffer = Buffer.from(await artworkFile.arrayBuffer());
    const fileName = `${Date.now()}-${artworkFile.name}`;
    const attachmentPath = `/uploads/${fileName}`;
    await fs.writeFile(require('path').join(process.cwd(), `public${attachmentPath}`), artworkBuffer);

    
    const rfqResult = await createOrderForQuote({
        producer: { email: producerEmail, company: producerCompany },
        supplierCompany: supplierName,
        itemName: `Custom Label Quote: ${producerCompany}`,
        quantity: totalQuantity,
        attachmentPath,
    });

    if (rfqResult.success && rfqResult.order) {
        const { sendOrderNotificationEmail } = await import('@/lib/email-actions');
        const supplierUser = await getUserByEmail(supplierName);
        if (supplierUser?.email) {
            await sendOrderNotificationEmail(supplierUser.email, rfqResult.order, { filename: artworkFile.name, content: artworkBuffer });
        }

        revalidatePath('/orders');
        return { success: true, message: `Your quote request has been sent to ${supplierName} and added to your Orders list.` };
    } else {
        return { success: false, message: rfqResult.message || "Failed to create RFQ record." };
    }

  } catch (error) {
    console.error('Error submitting label quote:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, message: errorMessage };
  }
}
