
'use server';

import { cookies } from 'next/headers';
import { sendQrCodeRequestEmail } from '@/lib/email-actions';
import { getUserByEmail } from '@/lib/userActions';
import type { User } from '@/lib/users';
import { createOrderForQuote } from '@/lib/order-actions';

export type QrCodeRequest = {
    id: string;
    wineName?: string;
    wineRange?: string;
    vintage?: string;
    wineOfOrigin?: string;
    sealType?: 'Black & White Seal' | 'IPW';
    wieta?: 'Yes' | 'No';
    wwf?: 'Yes' | 'No';
    wsr2aForm?: File;
    bottleShotPath?: string;
    ingredients?: string[];
    otherIngredient?: string;
};

export interface QrCodeActionResponse {
  success: boolean;
  message: string;
}

export async function submitQrCodeRequest(
    prevState: QrCodeActionResponse,
    formData: FormData
): Promise<QrCodeActionResponse> {
    const cookieStore = cookies();
    const producerEmail = cookieStore.get('userEmail')?.value;

    if (!producerEmail) {
        return { success: false, message: 'You must be logged in to submit a request.' };
    }

    const producer = await getUserByEmail(producerEmail);
    if (!producer) {
        return { success: false, message: 'Could not find your user details.' };
    }

    const requestsString = formData.get('requests') as string;
    if (!requestsString) {
        return { success: false, message: 'No request data found.' };
    }
    
    const orderNumber = `QR-${Date.now()}`;

    const parsedRequests: QrCodeRequest[] = JSON.parse(requestsString);
    const populatedRequests: QrCodeRequest[] = [];
    const emailAttachments: { filename: string; content: Buffer }[] = [];
    const allOrderIds: string[] = [];

    for (let i = 0; i < parsedRequests.length; i++) {
        const wineName = formData.get(`wineName-${i}`) as string;
        const wineRange = formData.get(`wineRange-${i}`) as string;
        const vintage = formData.get(`vintage-${i}`) as string;
        const wineOfOrigin = formData.get(`wineOfOrigin-${i}`) as string;
        const sealType = formData.get(`sealType-${i}`) as QrCodeRequest['sealType'];
        const wieta = formData.get(`wieta-${i}`) as QrCodeRequest['wieta'];
        const wwf = formData.get(`wwf-${i}`) as QrCodeRequest['wwf'];
        const wsr2aForm = formData.get(`wsr2aForm-${i}`) as File;
        const bottleShotFile = formData.get(`bottleShot-${i}`) as File | null;
        const otherIngredient = formData.get(`otherIngredient-${i}`) as string;


        // Collect ingredients for this request form
        const ingredients: string[] = [];
        for (const [key, value] of formData.entries()) {
            if (key.startsWith(`ingredients-${i}-`) && value === 'on') {
                const ingredientName = key.substring(`ingredients-${i}-`.length).replace(/-/g, ' ');
                if (ingredientName !== 'other') {
                    ingredients.push(ingredientName);
                }
            }
        }
        
        if (!wineName || !vintage || !wineOfOrigin || !sealType || !wieta || !wwf || !wsr2aForm || wsr2aForm.size === 0) {
            return { success: false, message: `Please complete all required fields for Request #${i + 1}.` };
        }

        const populatedRequest: QrCodeRequest = { 
            id: parsedRequests[i].id, wineName, wineRange, vintage, wineOfOrigin, sealType, wieta, wwf, ingredients 
        };

        const uploadsDirPath = require('path').join(process.cwd(), 'public/uploads');
        const fs = require('fs').promises;
        await fs.mkdir(uploadsDirPath, { recursive: true });

        // Handle WSR2A form attachment (required)
        try {
            const wsr2aBuffer = Buffer.from(await wsr2aForm.arrayBuffer());
            const wsr2aFileName = `${orderNumber}-WSR2A-${wineName.replace(/ /g, '_')}-${wsr2aForm.name}`;
            const wsr2aPath = `/uploads/${wsr2aFileName}`;
            await fs.writeFile(require('path').join(process.cwd(), `public${wsr2aPath}`), wsr2aBuffer);
            emailAttachments.push({ filename: wsr2aFileName, content: wsr2aBuffer });

            // Create order with attachment
            const orderResult = await createOrderForQuote({
                producer: producer,
                supplierCompany: 'WineSpace',
                itemName: `QR Code Request: ${wineName}`,
                quantity: 1,
                attachmentPath: wsr2aPath,
            });

            if (orderResult.orderId) {
                allOrderIds.push(orderResult.orderId);
            }

        } catch (error) {
            console.error('Error saving WSR2A form file:', error);
            return { success: false, message: 'Failed to save WSR2A attachment file.' };
        }

        // Handle Bottle Shot attachment (optional)
        if (bottleShotFile && bottleShotFile.size > 0) {
            try {
                const bottleShotBuffer = Buffer.from(await bottleShotFile.arrayBuffer());
                const bottleShotFileName = `${orderNumber}-BottleShot-${wineName.replace(/ /g, '_')}-${bottleShotFile.name}`;
                const bottleShotPath = `/uploads/${bottleShotFileName}`;
                await fs.writeFile(require('path').join(process.cwd(), `public${bottleShotPath}`), bottleShotBuffer);
                
                populatedRequest.bottleShotPath = bottleShotPath; // Store path for internal use if needed
                emailAttachments.push({ filename: bottleShotFileName, content: bottleShotBuffer });

            } catch (error) {
                console.error('Error saving bottle shot file:', error);
                // Non-critical error, so we just log it and continue
            }
        }
        
        if (otherIngredient) {
            populatedRequest.otherIngredient = otherIngredient;
        }

        populatedRequests.push(populatedRequest);
    }

    if (populatedRequests.length === 0) {
         return { success: false, message: 'No valid requests to submit.' };
    }

    try {
        await sendQrCodeRequestEmail({
            producer: producer,
            requests: populatedRequests,
            attachments: emailAttachments,
            orderNumber: orderNumber,
        });

        return { success: true, message: `Successfully submitted ${populatedRequests.length} QR code request(s).` };

    } catch (error) {
        console.error("Error submitting QR code request:", error);
        return { success: false, message: "An internal server error occurred while sending the request." };
    }
}
