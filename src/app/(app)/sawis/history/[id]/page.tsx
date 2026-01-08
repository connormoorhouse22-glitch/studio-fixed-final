
'use server';

import { notFound } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { getFirestoreInstance } from '@/lib/firebase';
import type { SawisReturn } from '@/lib/sawis-actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import Link from 'next/link';

const wineColumns = ['Unfortified', 'Fortified', 'Sparkling', 'Concentrate', 'Grape Juice', 'Wine Coolers'] as const;
const pricePointColumns = ['<R24', 'R24-<R32', 'R32-<R40', 'R40-<R48', 'R48-<R56', 'R56-<R64', 'R64-<R72', 'R72-<R80', 'R80-<R96', 'R96-<R120', 'R120-<R160', '>R160'] as const;

async function getReturnById(id: string): Promise<SawisReturn | null> {
    try {
        const firestore = getFirestoreInstance();
        const docRef = doc(firestore, 'sawisReturns', id);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as SawisReturn : null;
    } catch (error) {
        console.error(`Error getting return by id ${id}:`, error);
        return null;
    }
}

export default async function SawisReturnDetailsPage({ params }: { params: { id: string } }) {
  const returnData = await getReturnById(params.id);

  if (!returnData) {
    notFound();
  }

  const {
    month,
    createdAt,
    openingBalances,
    transactions,
    closingBalances,
    overleafContainerData,
    overleafPriceData,
    sawis6FilePaths,
  } = returnData;
  
  return (
    <div className="flex flex-col gap-8">
      <div>
        <Button variant="outline" size="sm" asChild>
            <Link href="/sawis/history">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to History
            </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
            <CardTitle className="text-2xl">SAWIS Return Details</CardTitle>
            <CardDescription>
                Showing submission for <strong>{month}</strong>, submitted on {format(new Date(createdAt), 'PPP')}.
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
            <section>
                <h3 className="text-lg font-semibold mb-4">SAWIS 7 - Monthly Summary (Litres)</h3>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Category</TableHead>
                            {wineColumns.map(col => <TableHead key={col} className="text-right">{col}</TableHead>)}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell>Opening Balance</TableCell>
                            {wineColumns.map(col => <TableCell key={col} className="text-right font-mono">{(openingBalances?.[col] || 0).toLocaleString()}</TableCell>)}
                        </TableRow>
                        <TableRow>
                            <TableCell>Closing Balance</TableCell>
                            {wineColumns.map(col => <TableCell key={col} className="text-right font-mono">{(closingBalances?.[col] || 0).toLocaleString()}</TableCell>)}
                        </TableRow>
                    </TableBody>
                 </Table>
            </section>
            
            <Separator />
            
            <section>
                <h3 className="text-lg font-semibold mb-4">SAWIS 5 - Transactions Ledger</h3>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Inv No.</TableHead>
                            <TableHead>Transaction</TableHead>
                             {wineColumns.map(col => <TableHead key={col} className="text-right">{col}</TableHead>)}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactions?.length > 0 ? transactions.map((row: any, index: number) => (
                            <TableRow key={index}>
                                <TableCell>{format(new Date(row.date), 'PPP')}</TableCell>
                                <TableCell>{row.invoiceNo}</TableCell>
                                <TableCell>{row.transactionType}</TableCell>
                                {wineColumns.map(col => <TableCell key={col} className="text-right font-mono">{(row[col] || 0).toLocaleString()}</TableCell>)}
                            </TableRow>
                        )) : (
                             <TableRow>
                                <TableCell colSpan={wineColumns.length + 3} className="text-center h-24">No transactions were recorded for this month.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                 </Table>
            </section>

             <Separator />

             <section>
                <h3 className="text-lg font-semibold mb-4">Overleaf - Domestic Sales by Price Point (Litres)</h3>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Cultivar</TableHead>
                            {pricePointColumns.map(col => <TableHead key={col} className="text-right">{col}</TableHead>)}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Object.entries(overleafPriceData || {}).map(([cultivarCode, priceData]) => {
                             const cultivarName = Object.values(domesticSalesCultivars).flatMap(c => c.items).find(i => i.code === cultivarCode)?.name;
                            return (
                                <TableRow key={cultivarCode}>
                                    <TableCell>{cultivarName || cultivarCode}</TableCell>
                                    {pricePointColumns.map(col => <TableCell key={col} className="text-right font-mono">{((priceData as any)[col] || 0).toLocaleString()}</TableCell>)}
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </section>

            <Separator />
            
            <section>
                <h3 className="text-lg font-semibold mb-4">Overleaf - Domestic Sales by Container (Litres)</h3>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Container</TableHead>
                            <TableHead>Size</TableHead>
                            <TableHead className="text-right">Litres</TableHead>
                        </TableRow>
                    </TableHeader>
                     <TableBody>
                         {Object.entries(overleafContainerData || {}).map(([key, value]) => (
                            <TableRow key={key}>
                                <TableCell>{key.split('_').slice(0,-1).join(' ')}</TableCell>
                                <TableCell>{key.split('_').pop()}</TableCell>
                                <TableCell className="text-right font-mono">{(value as number).toLocaleString()}</TableCell>
                            </TableRow>
                         ))}
                    </TableBody>
                </Table>
            </section>
            
            {sawis6FilePaths && sawis6FilePaths.length > 0 && (
                 <>
                    <Separator />
                    <section>
                        <h3 className="text-lg font-semibold mb-4">Uploaded SAWIS 6 Forms</h3>
                        <div className="flex flex-col gap-2">
                           {sawis6FilePaths.map((path, index) => (
                                <Button key={index} asChild variant="outline" className="justify-start">
                                    <Link href={path} target="_blank" download>
                                        <Download className="mr-2 h-4 w-4" />
                                        {path.split('/').pop()}
                                    </Link>
                                </Button>
                           ))}
                        </div>
                    </section>
                </>
            )}
            
        </CardContent>
      </Card>
    </div>
  );
}
