'use server';

import { collection, doc, getDocs, addDoc, query, where, orderBy, limit, deleteDoc } from 'firebase/firestore';
import { getFirestoreInstance } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';
import { getUserByEmail } from '@/lib/userActions';
import { sendSawisReturnEmail } from '@/lib/email-actions';
import XlsxPopulate from 'xlsx-populate';
import type { Sawis5Row, Sawis7Row, Sawis7OverleafPriceData, Sawis7OverleafContainerData } from '@/app/(app)/sawis/returns/form';
import { cookies } from 'next/headers';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { saveSawisReturn, type SawisReturnActionResponse } from '@/lib/sawis-actions';
import { calculateTotalsByTransactionType, domesticSalesCultivars } from '@/lib/sawis-helpers';
import path from 'path';


const wineColumns = ['Unfortified', 'Fortified', 'Sparkling', 'Concentrate', 'Grape Juice', 'Wine Coolers'] as const;
const pricePointColumns = ['<R24', 'R24-<R32', 'R32-<R40', 'R40-<R48', 'R48-<R56', 'R56-<R64', 'R64-<R72', 'R72-<R80', 'R80-<R96', 'R96-<R120', 'R120-<R160', '>R160'] as const;

export async function submitSawisReturn(
    prevState: SawisReturnActionResponse,
    formData: FormData
): Promise<SawisReturnActionResponse> {

    const cookieStore = cookies();
    const producerEmail = cookieStore.get('userEmail')?.value;

    if (!producerEmail) {
        return { success: false, message: 'You must be logged in to submit a return.' };
    }

    const producer = await getUserByEmail(producerEmail);
    if (!producer) {
        return { success: false, message: 'Could not find your user details.' };
    }

    try {
        const sawis6Files = formData.getAll('sawis6Files') as File[];
        const sawis5Rows = JSON.parse(formData.get('sawis5Rows') as string) as Sawis5Row[];
        const sawis5Opening = JSON.parse(formData.get('sawis5Opening') as string) as Sawis7Row;
        const sawis7OverleafPrice = JSON.parse(formData.get('sawis7OverleafPrice') as string) as Sawis7OverleafPriceData;
        const sawis7OverleafContainer = JSON.parse(formData.get('sawis7OverleafContainer') as string) as Sawis7OverleafContainerData;
        const recipientEmail = formData.get('recipientEmail') as string;
        const month = formData.get('month') as string;
        const submitterName = formData.get('submitterName') as string;
        const submissionDate = formData.get('submissionDate') as string;
        const signatureFile = formData.get('signature') as File | null;

        if (!recipientEmail || !month || !submitterName || !submissionDate) {
            return { success: false, message: 'Recipient email, month of return, submitter name, and submission date are required.' };
        }
        
        const returnDate = new Date(month + '-02');
        const formattedMonth = returnDate.toLocaleString('default', { month: 'long', year: 'numeric' });
        const firstDayOfMonth = startOfMonth(returnDate);
        const lastDayOfMonth = endOfMonth(returnDate);

        const attachments = [];
        const sawis6FilePaths: string[] = [];

        for (const file of sawis6Files) {
            if (file.size > 0) {
                const buffer = Buffer.from(await file.arrayBuffer());
                attachments.push({ filename: file.name, content: buffer });
            }
        }
        
        let signatureBuffer: Buffer | null = null;
        if (signatureFile && signatureFile.size > 0) {
            signatureBuffer = Buffer.from(await signatureFile.arrayBuffer());
        }

        const productionTotals = calculateTotalsByTransactionType(sawis5Rows, ['Production']);
        const fortificationTotals = calculateTotalsByTransactionType(sawis5Rows, ['Fortification']);
        const additionsTotals = calculateTotalsByTransactionType(sawis5Rows, ['Additions']);
        const transferInTotals = calculateTotalsByTransactionType(sawis5Rows, ['Transfer In']);
        const surplusTotals = calculateTotalsByTransactionType(sawis5Rows, ['Surplus']);

        const bulkNonDutyTotals = calculateTotalsByTransactionType(sawis5Rows, ['Bulk - Non duty paid']);
        const bulkDutyTotals = calculateTotalsByTransactionType(sawis5Rows, ['Bulk - Duty paid']);
        const packagedNonDutyTotals = calculateTotalsByTransactionType(sawis5Rows, ['Packaged - Non duty paid']);
        const packagedDutyTotals = calculateTotalsByTransactionType(sawis5Rows, ['Packaged - Duty paid']);
        const exportTotals = calculateTotalsByTransactionType(sawis5Rows, ['Export']);
        const bottlingTotals = calculateTotalsByTransactionType(sawis5Rows, ['Bottling']);
        const transferOutTotals = calculateTotalsByTransactionType(sawis5Rows, ['Transfer Out']);
        const leesDestroyedTotals = calculateTotalsByTransactionType(sawis5Rows, ['Lees destroyed']);
        const deficiencyTotals = calculateTotalsByTransactionType(sawis5Rows, ['Deficiency']);

        const allAdditions = wineColumns.reduce((acc, col) => {
            acc[col] = (productionTotals[col] || 0) + (fortificationTotals[col] || 0) + (additionsTotals[col] || 0) + (transferInTotals[col] || 0) + (surplusTotals[col] || 0);
            return acc;
        }, {} as Sawis7Row);

        const allDisposals = wineColumns.reduce((acc, col) => {
            acc[col] = (bulkNonDutyTotals[col] || 0) + (bulkDutyTotals[col] || 0) + (packagedNonDutyTotals[col] || 0) + (packagedDutyTotals[col] || 0) + (exportTotals[col] || 0) + (bottlingTotals[col] || 0) + (transferOutTotals[col] || 0) + (leesDestroyedTotals[col] || 0) + (deficiencyTotals[col] || 0);
            return acc;
        }, {} as Sawis7Row);
        
        const closingBalance = wineColumns.reduce((acc, col) => {
            acc[col] = (sawis5Opening[col] || 0) + (allAdditions[col] || 0) - (allDisposals[col] || 0);
            return acc;
        }, {} as Sawis7Row);
        
        // --- POPULATE SAWIS 5 ---
        const sawis5Path = path.join(process.cwd(), 'public', 'SAWIS_5.xlsx');
        const sawis5Workbook = await XlsxPopulate.fromFileAsync(sawis5Path);
        const sawis5aSheet = sawis5Workbook.sheet("SAWIS 5a");
        const sawis5LedgerSheet = sawis5Workbook.sheet("SAWIS 5");
        
        sawis5aSheet.cell("A1").value(`PRODUCER: ${producer.company}`);
        sawis5aSheet.cell("C1").value(`MONTH: ${formattedMonth}`);
        
        // Opening balance date in A7
        sawis5aSheet.cell("A7").value(format(firstDayOfMonth, 'dd/MM/yyyy'));
        // Opening balances in row 7
        sawis5aSheet.cell("B7").value(sawis5Opening['Unfortified'] || 0);
        sawis5aSheet.cell("C7").value(sawis5Opening['Fortified'] || 0);
        sawis5aSheet.cell("D7").value(sawis5Opening['Sparkling'] || 0);
        sawis5aSheet.cell("E7").value(sawis5Opening['Concentrate'] || 0);
        sawis5aSheet.cell("F7").value(sawis5Opening['Grape Juice'] || 0);
        sawis5aSheet.cell("G7").value(sawis5Opening['Wine Coolers'] || 0);
        
        // Populate "Transfers To" totals
        sawis5aSheet.cell("I13").value(transferOutTotals['Unfortified'] || 0);
        sawis5aSheet.cell("J13").value(transferOutTotals['Fortified'] || 0);
        sawis5aSheet.cell("K13").value(transferOutTotals['Sparkling'] || 0);
        sawis5aSheet.cell("L13").value(transferOutTotals['Concentrate'] || 0);
        sawis5aSheet.cell("M13").value(transferOutTotals['Grape Juice'] || 0);
        sawis5aSheet.cell("N13").value(transferOutTotals['Wine Coolers'] || 0);

        // Closing balance date in H27
        sawis5aSheet.cell("H27").value(format(lastDayOfMonth, 'dd/MM/yyyy'));
        // Closing balances in row 27
        sawis5aSheet.cell("I27").value(closingBalance['Unfortified'] || 0);
        sawis5aSheet.cell("J27").value(closingBalance['Fortified'] || 0);
        sawis5aSheet.cell("K27").value(closingBalance['Sparkling'] || 0);
        sawis5aSheet.cell("L27").value(closingBalance['Concentrate'] || 0);
        sawis5aSheet.cell("M27").value(closingBalance['Grape Juice'] || 0);
        sawis5aSheet.cell("N27").value(closingBalance['Wine Coolers'] || 0);
        
        if (sawis5Rows.length > 0) {
            sawis5LedgerSheet.cell("A2").value(sawis5Rows.map(row => [
                format(new Date(row.date), 'yyyy-MM-dd'), row.invoiceNo, row.transactionType, row.transferredFrom || '', row.transferredTo || '',
                ...wineColumns.map(col => Number(row[col]) || 0)
            ]));
        }

        // --- POPULATE SAWIS 7 ---
        const sawis7Path = path.join(process.cwd(), 'public', 'SAWIS_7.xlsx');
        const sawis7Workbook = await XlsxPopulate.fromFileAsync(sawis7Path);
        const sawis7Sheet = sawis7Workbook.sheet(0);
        
        sawis7Sheet.cell("A3").value(`Producer: ${producer.company}`);
        sawis7Sheet.cell("C3").value(`Month: ${formattedMonth}`);
        
        let currentPriceRow = 9;
        domesticSalesCultivars.forEach(category => {
            category.items.forEach(item => {
                const row = sawis7Sheet.row(currentPriceRow);
                if (sawis7OverleafPrice[item.code]) {
                    pricePointColumns.forEach((ppCol, colIndex) => {
                        row.cell(3 + colIndex).value(sawis7OverleafPrice[item.code]?.[ppCol] || 0);
                    });
                }
                currentPriceRow++;
            });
        });
        
        let currentContainerRow = 42;
        for(const [key, value] of Object.entries(sawis7OverleafContainer)) {
             sawis7Sheet.cell(`C${currentContainerRow}`).value(value || 0);
             currentContainerRow++;
        }

        const sawis5Buffer = await sawis5Workbook.outputAsync() as Buffer;
        attachments.push({ filename: `SAWIS_5_${formattedMonth.replace(' ','_')}.xlsx`, content: sawis5Buffer });
        
        const sawis7Buffer = await sawis7Workbook.outputAsync() as Buffer;
        attachments.push({ filename: `SAWIS_7_${formattedMonth.replace(' ','_')}.xlsx`, content: sawis7Buffer });


        await sendSawisReturnEmail({
            producer, recipientEmail, month: formattedMonth, attachments, submitterName, submissionDate,
            sawis5Opening, sawis5Rows, productionTotals, fortificationTotals, additionsTotals,
            transferInTotals, surplusTotals, allAdditions, bulkNonDutyTotals, bulkDutyTotals,
            packagedNonDutyTotals, packagedDutyTotals, exportTotals, bottlingTotals, transferOutTotals,
            leesDestroyedTotals, deficiencyTotals, allDisposals, closingBalance,
            overleafPriceData: sawis7OverleafPrice, overleafContainerData: sawis7OverleafContainer
        });
        
        await saveSawisReturn(producerEmail, formattedMonth, {
            openingBalances: sawis5Opening,
            transactions: sawis5Rows,
            closingBalances: closingBalance,
            overleafPriceData: sawis7OverleafPrice,
            overleafContainerData: sawis7OverleafContainer,
            sawis6FilePaths: sawis6FilePaths,
        });

        return { success: true, message: `Successfully submitted your SAWIS return for ${formattedMonth} to ${recipientEmail}.` };
    } catch (error) {
        console.error('Error submitting SAWIS return:', error);
        return { success: false, message: error instanceof Error ? error.message : 'An internal server error occurred.' };
    }
}

    
