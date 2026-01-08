'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { PlusCircle, Trash2, Loader2, Send } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { getLatestSawisReturn, type SawisReturn } from '@/lib/sawis-actions';
import { submitSawisReturn, type SawisReturnActionResponse } from './actions';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { domesticSalesCultivars } from '@/lib/sawis-helpers';


interface SawisReturnResponse {
  success: boolean;
  message: string;
}

const wineColumns = ['Unfortified', 'Fortified', 'Sparkling', 'Concentrate', 'Grape Juice', 'Wine Coolers'] as const;
const pricePointColumns = ['<R24', 'R24-<R32', 'R32-<R40', 'R40-<R48', 'R48-<R56', 'R56-<R64', 'R64-<R72', 'R72-<R80', 'R80-<R96', 'R96-<R120', 'R120-<R160', '>R160'] as const;

const stillWineSections = [
    { title: "GLAS / GLASS", key: "still_glass", sizes: ['< 750 ml', '750 ml', '1l', '1,5-2l', '4,5l', 'Ander / Other'], keys: ['lt750', '750', '1', '1.5-2', '4.5', 'other']},
    { title: "PLASTIEK / PLASTIC", key: "still_plastic", subHeader: "(< 750ml, 750ml, 1l)", sizes: ['5l', 'Ander / Other'], keys: ['5', 'other'] },
    { title: "TAPVATE / KARTONBOTTEL", key: "still_bagInBox", subHeader: "(750ml, 2l, 3l)", sizes: ['5l', 'Ander / Other'], keys: ['5', 'other'] },
    { title: "PET", key: "still_pet", sizes: ['< 750 ml', '750 ml'], keys: ['lt750', '750'] },
    { title: "FOELIESAKKE / FOIL BAGS", key: "still_foil", sizes: ['2l', '5l', 'Ander / Other'], keys: ['2', '5', 'other'] },
    { title: "KARTONHOUERS / CARTON PACKS", key: "still_carton", subHeader: "(TETRA, COMBI, ELOPAK)", sizes: ['500 ml', '1l', 'Ander / Other'], keys: ['500ml', '1l', 'other'] },
    { title: "BLIKKIES / CANS", key: "still_cans", sizes: ['< 250 ml', '250 ml', '>250 ml'], keys: ['lt250', '250', 'gt250'] },
];

const sparklingWineSections = [
    { title: "GLAS / GLASS", key: "sparkling_glass", sizes: ['Vonkel / Sparkling 375 ml', 'Vonkel / Sparkling 750 ml', 'Ander / Other'], keys: ['375', '750', 'other']},
    { title: "BLIKKIES / CANS", key: "sparkling_cans", sizes: ['< 250 ml', '250 ml', '>250 ml'], keys: ['lt250', '250', 'gt250']},
];


export type WineColumn = typeof wineColumns[number];
export type PricePointColumn = typeof pricePointColumns[number];


export type Sawis5Row = { 
    id: string; 
    date: string; 
    invoiceNo: string; 
    transactionType: string;
    transferredFrom?: string;
    transferredTo?: string;
} & { [K in WineColumn]?: number };

export type Sawis7Row = { [K in WineColumn]?: number };
export type Sawis7OverleafPriceData = { [key: string]: { [key: string]: number | undefined } };
export type Sawis7OverleafContainerData = { [key: string]: number | undefined };


function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" size="lg" disabled={pending} className="w-full">
            {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : <><Send className="mr-2 h-4 w-4" /> Submit Return</>}
        </Button>
    )
}

function Sawis7OverleafContainerForm({ overleafData, onOverleafChange }: { overleafData: Sawis7OverleafContainerData, onOverleafChange: (key: string, value: string) => void }) {
    
    const calculateTotal = (baseKey: string, sizeKeys: string[]) => {
        return sizeKeys.reduce((sum, sizeKey) => {
            const fullKey = `${baseKey}_${sizeKey}`;
            return sum + (Number(overleafData[fullKey]) || 0);
        }, 0);
    };
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>SAWIS 7 Overleaf - Domestic Packaged Wine Sales</CardTitle>
                <CardDescription>Enter the total litres sold for each container type and size category. The "Total" field will update automatically.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                 <div>
                    <h3 className="text-lg font-semibold mb-4">LITER STILWYN / LITRES STILL WINE</h3>
                    {stillWineSections.map(section => {
                         const total = calculateTotal(section.key, section.keys);
                        return (
                        <div key={section.key} className="mb-6 p-4 border rounded-md">
                            <h4 className="font-medium">{section.title} <span className="text-muted-foreground text-sm">{section.subHeader}</span></h4>
                             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                                <div className="space-y-1">
                                    <Label htmlFor={`${section.key}_total`}>TOTAAL / TOTAL</Label>
                                    <Input id={`${section.key}_total`} type="number" value={total} readOnly className="font-bold bg-muted" />
                                </div>
                                {section.sizes.map((size, index) => {
                                    const fieldKey = `${section.key}_${section.keys[index]}`;
                                    return (
                                    <div key={size} className="space-y-1">
                                        <Label htmlFor={fieldKey}>{size}</Label>
                                        <Input id={fieldKey} type="number" placeholder="Litres" value={overleafData[fieldKey] || ''} onChange={(e) => onOverleafChange(fieldKey, e.target.value)} />
                                    </div>
                                    )
                                })}
                             </div>
                        </div>
                    )})}
                </div>

                <div>
                    <h3 className="text-lg font-semibold mb-4">LITER VONKEL / LITRES SPARKLING</h3>
                    {sparklingWineSections.map(section => {
                        const total = calculateTotal(section.key, section.keys);
                        return (
                        <div key={section.key} className="mb-6 p-4 border rounded-md">
                            <h4 className="font-medium">{section.title}</h4>
                             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                                 <div className="space-y-1">
                                    <Label htmlFor={`${section.key}_total`}>TOTAAL / TOTAL</Label>
                                    <Input id={`${section.key}_total`} type="number" value={total} readOnly className="font-bold bg-muted" />
                                </div>
                                {section.sizes.map((size, index) => {
                                     const fieldKey = `${section.key}_${section.keys[index]}`;
                                    return (
                                    <div key={size} className="space-y-1">
                                        <Label htmlFor={fieldKey}>{size}</Label>
                                        <Input id={fieldKey} type="number" placeholder="Litres" value={overleafData[fieldKey] || ''} onChange={(e) => onOverleafChange(fieldKey, e.target.value)} />
                                    </div>
                                    )
                                })}
                             </div>
                        </div>
                    )})}
                </div>

                 <div>
                    <h3 className="text-lg font-semibold mb-4">TOTAAL GEFORTIFISEERD / TOTAL FORTIFIED</h3>
                    <div className="mb-6 p-4 border rounded-md">
                        <div className="space-y-1">
                            <Label htmlFor="fortified_total">Total Litres Sold</Label>
                            <Input id="fortified_total" type="number" placeholder="Litres" value={overleafData['fortified_total'] || ''} onChange={(e) => onOverleafChange('fortified_total', e.target.value)} />
                        </div>
                    </div>
                </div>

            </CardContent>
        </Card>
    )
}

function Sawis7OverleafPriceForm({ overleafData, onOverleafChange }: { overleafData: Sawis7OverleafPriceData, onOverleafChange: (cultivarCode: string, priceCol: PricePointColumn, value: string) => void }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>SAWIS 7 Overleaf - Domestic Sales by Price Point</CardTitle>
                <CardDescription>Enter the total litres sold for each cultivar within the specified price points (per 750ml equivalent).</CardDescription>
            </CardHeader>
            <CardContent>
                <Accordion type="multiple" className="w-full">
                    {domesticSalesCultivars.map(category => (
                        <AccordionItem value={category.category} key={category.category}>
                            <AccordionTrigger>{category.category}</AccordionTrigger>
                            <AccordionContent>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="min-w-[250px]">Cultivar</TableHead>
                                                {pricePointColumns.map(ppCol => <TableHead key={ppCol} className="text-right min-w-[120px]">{ppCol}</TableHead>)}
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {category.items.map(item => (
                                                <TableRow key={item.code}>
                                                    <TableCell className="font-medium">{item.name} <span className="text-muted-foreground">{item.code}</span></TableCell>
                                                    {pricePointColumns.map(ppCol => (
                                                        <TableCell key={`${item.code}-${ppCol}`}>
                                                            <Input 
                                                                type="number" 
                                                                placeholder="Litres" 
                                                                className="text-right"
                                                                value={overleafData[item.code]?.[ppCol] || ''}
                                                                onChange={(e) => onOverleafChange(item.code, ppCol, e.target.value)}
                                                            />
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </CardContent>
        </Card>
    );
}

const initialState: SawisReturnActionResponse = { success: false, message: '' };

export function SawisReturnForm() {
    const { toast } = useToast();
    const router = useRouter();
    const formRef = useRef<HTMLFormElement>(null);
    const [state, setState] = useState(initialState);
    
    // Form State
    const [month, setMonth] = useState<string>(format(new Date(), 'yyyy-MM'));
    const [recipientEmail, setRecipientEmail] = useState('');
    const [sawis6Files, setSawis6Files] = useState<File[]>([]);
    const [sawis5Rows, setSawis5Rows] = useState<Sawis5Row[]>([]);
    const [sawis5Opening, setSawis5Opening] = useState<Sawis7Row>({});
    const [sawis7OverleafContainer, setSawis7OverleafContainer] = useState<Sawis7OverleafContainerData>({});
    const [sawis7OverleafPrice, setSawis7OverleafPrice] = useState<Sawis7OverleafPriceData>({});
    const [isLoadingOpening, setIsLoadingOpening] = useState(true);
    
    const [submitterName, setSubmitterName] = useState('');
    const [submissionDate, setSubmissionDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [signatureFile, setSignatureFile] = useState<File | null>(null);

    const handleFormAction = async (formData: FormData) => {
      const result = await submitSawisReturn(state, formData);
      setState(result);
    }

    useEffect(() => {
        const email = localStorage.getItem('userEmail');
        if (email) {
            getLatestSawisReturn(email).then(lastReturn => {
                if (lastReturn) {
                    setSawis5Opening(lastReturn.closingBalances);
                }
                setIsLoadingOpening(false);
            });
        } else {
            setIsLoadingOpening(false);
        }
    }, []);

    useEffect(() => {
        if (state.message) {
            if (state.success) {
                toast({ title: 'Success!', description: state.message });
                router.push('/producer/dashboard');
            } else {
                toast({ variant: 'destructive', title: 'Submission Failed', description: state.message });
            }
        }
    }, [state, toast, router]);
    

    const calculateTotalsByTransactionType = (rows: Sawis5Row[], types: string[]) => {
        const totals: Sawis7Row = {};
        for (const col of wineColumns) {
            totals[col] = rows
                .filter(row => types.includes(row.transactionType))
                .reduce((sum, row) => sum + (Number(row[col]) || 0), 0);
        }
        return totals;
    };

    const calculatedTotals = useMemo(() => {
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
        
        return {
            productionTotals, fortificationTotals, additionsTotals, transferInTotals, surplusTotals,
            allAdditions,
            bulkNonDutyTotals, bulkDutyTotals, packagedNonDutyTotals, packagedDutyTotals, exportTotals, bottlingTotals, transferOutTotals, leesDestroyedTotals, deficiencyTotals,
            allDisposals,
            closingBalance
        };
    }, [sawis5Rows, sawis5Opening]);


    const addSawis5Row = () => {
        const newRow: Sawis5Row = {
            id: `row-${Date.now()}`,
            date: format(new Date(), 'yyyy-MM-dd'),
            invoiceNo: '',
            transactionType: 'Production'
        };
        wineColumns.forEach(col => newRow[col] = 0);
        setSawis5Rows([...sawis5Rows, newRow]);
    };

    const removeSawis5Row = (id: string) => {
        setSawis5Rows(sawis5Rows.filter(row => row.id !== id));
    };

    const handleSawis5Change = (id: string, field: keyof Sawis5Row, value: any) => {
        setSawis5Rows(sawis5Rows.map(row => row.id === id ? { ...row, [field]: value } : row));
    };

    const handleOpeningChange = (col: WineColumn, value: string) => {
        setSawis5Opening(prev => ({ ...prev, [col]: parseFloat(value) || 0 }));
    };
    
    const handleOverleafContainerChange = (key: string, value: string) => {
        setSawis7OverleafContainer(prev => ({ ...prev, [key]: parseFloat(value) || undefined }));
    };

    const handleOverleafPriceChange = (cultivarCode: string, priceCol: PricePointColumn, value: string) => {
        setSawis7OverleafPrice(prev => ({
            ...prev,
            [cultivarCode]: {
                ...prev[cultivarCode],
                [priceCol]: parseFloat(value) || undefined,
            }
        }));
    };

    return (
        <form ref={formRef} action={handleFormAction} className="space-y-8">
             {/* Hidden inputs to pass complex state to the Server Action */}
            <input type="hidden" name="sawis5Rows" value={JSON.stringify(sawis5Rows)} />
            <input type="hidden" name="sawis5Opening" value={JSON.stringify(sawis5Opening)} />
            <input type="hidden" name="sawis7OverleafContainer" value={JSON.stringify(sawis7OverleafContainer)} />
            <input type="hidden" name="sawis7OverleafPrice" value={JSON.stringify(sawis7OverleafPrice)} />

            <Card>
                <CardHeader>
                    <CardTitle>Return Details</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="month">Month of Return</Label>
                        <Input id="month" name="month" type="month" value={month} onChange={e => setMonth(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="recipientEmail">Recipient Email</Label>
                        <Input id="recipientEmail" name="recipientEmail" type="email" value={recipientEmail} onChange={e => setRecipientEmail(e.target.value)} placeholder="e.g., accounts@yourwinery.com" required />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="sawis6Files">Upload SAWIS 6 Forms (Optional)</Label>
                        <Input id="sawis6Files" name="sawis6Files" type="file" multiple onChange={e => setSawis6Files(Array.from(e.target.files || []))} />
                        <p className="text-xs text-muted-foreground">Select all SAWIS 6 forms applicable to this month's return. They will be attached to the submission email.</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                 <CardHeader>
                    <CardTitle>SAWIS 5 - Opening Balances</CardTitle>
                    <CardDescription>Enter your opening balances for each wine category in litres. These values are automatically carried over from the previous month's return if available.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoadingOpening ? <Skeleton className="h-24 w-full" /> : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {wineColumns.map(col => (
                                <div key={col} className="space-y-2">
                                    <Label htmlFor={`opening-${col}`}>{col}</Label>
                                    <Input id={`opening-${col}`} type="number" value={sawis5Opening[col] || ''} onChange={e => handleOpeningChange(col, e.target.value)} />
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                 <CardHeader>
                    <CardTitle>SAWIS 5 - Transactions for the Month</CardTitle>
                    <CardDescription>Add a row for each transaction (production, sale, transfer, etc.).</CardDescription>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="min-w-[180px]">Date</TableHead>
                                <TableHead className="min-w-[200px]">SAWIS 6 / Inv No.</TableHead>
                                <TableHead className="min-w-[250px]">Transaction Type</TableHead>
                                <TableHead className="min-w-[200px]">From</TableHead>
                                <TableHead className="min-w-[200px]">To</TableHead>
                                {wineColumns.map(col => <TableHead key={col} className="text-right min-w-[150px]">{col}</TableHead>)}
                                <TableHead><span className="sr-only">Delete</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sawis5Rows.map(row => (
                                <TableRow key={row.id}>
                                    <TableCell><Input type="date" value={row.date} onChange={e => handleSawis5Change(row.id, 'date', e.target.value)} /></TableCell>
                                    <TableCell><Input value={row.invoiceNo} onChange={e => handleSawis5Change(row.id, 'invoiceNo', e.target.value)} /></TableCell>
                                    <TableCell>
                                        <Select value={row.transactionType} onValueChange={v => handleSawis5Change(row.id, 'transactionType', v)}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Production">Production</SelectItem>
                                                <SelectItem value="Fortification">Fortification</SelectItem>
                                                <SelectItem value="Additions">Additions</SelectItem>
                                                <SelectItem value="Transfer In">Transfer In</SelectItem>
                                                <SelectItem value="Surplus">Surplus</SelectItem>
                                                <SelectItem value="Bulk - Non duty paid">Bulk - Non duty paid</SelectItem>
                                                <SelectItem value="Bulk - Duty paid">Bulk - Duty paid</SelectItem>
                                                <SelectItem value="Packaged - Non duty paid">Packaged - Non duty paid</SelectItem>
                                                <SelectItem value="Packaged - Duty paid">Packaged - Duty paid</SelectItem>
                                                <SelectItem value="Export">Export</SelectItem>
                                                <SelectItem value="Bottling">Bottling</SelectItem>
                                                <SelectItem value="Transfer Out">Transfer Out</SelectItem>
                                                <SelectItem value="Lees destroyed">Lees destroyed</SelectItem>
                                                <SelectItem value="Deficiency">Deficiency</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell><Input value={row.transferredFrom || ''} onChange={e => handleSawis5Change(row.id, 'transferredFrom', e.target.value)} /></TableCell>
                                    <TableCell><Input value={row.transferredTo || ''} onChange={e => handleSawis5Change(row.id, 'transferredTo', e.target.value)} /></TableCell>
                                    {wineColumns.map(col => <TableCell key={col}><Input type="number" className="text-right" value={row[col] || ''} onChange={e => handleSawis5Change(row.id, col, e.target.value)} /></TableCell>)}
                                    <TableCell><Button variant="ghost" size="icon" onClick={() => removeSawis5Row(row.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
                <CardFooter>
                    <Button type="button" variant="outline" onClick={addSawis5Row}><PlusCircle className="mr-2 h-4 w-4" /> Add Transaction</Button>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>SAWIS 5 - Monthly Summary</CardTitle>
                    <CardDescription>This summary is calculated automatically from your transactions and will be included in the final report.</CardDescription>
                </CardHeader>
                <CardContent className="overflow-x-auto space-y-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="font-bold text-foreground">PRODUCTIONS AND ADDITIONS</TableHead>
                                {wineColumns.map(col => <TableHead key={col} className="text-right">{col}</TableHead>)}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow><TableCell>Opening Balance</TableCell>{wineColumns.map(col => <TableCell key={col} className="text-right">{(sawis5Opening[col] || 0).toLocaleString()}</TableCell>)}</TableRow>
                            <TableRow><TableCell>Production</TableCell>{wineColumns.map(col => <TableCell key={col} className="text-right">{(calculatedTotals.productionTotals[col] || 0).toLocaleString()}</TableCell>)}</TableRow>
                            <TableRow><TableCell>Fortification</TableCell>{wineColumns.map(col => <TableCell key={col} className="text-right">{(calculatedTotals.fortificationTotals[col] || 0).toLocaleString()}</TableCell>)}</TableRow>
                            <TableRow><TableCell>Additions</TableCell>{wineColumns.map(col => <TableCell key={col} className="text-right">{(calculatedTotals.additionsTotals[col] || 0).toLocaleString()}</TableCell>)}</TableRow>
                            <TableRow><TableCell>Transfers From</TableCell>{wineColumns.map(col => <TableCell key={col} className="text-right">{(calculatedTotals.transferInTotals[col] || 0).toLocaleString()}</TableCell>)}</TableRow>
                            <TableRow><TableCell>Surplus</TableCell>{wineColumns.map(col => <TableCell key={col} className="text-right">{(calculatedTotals.surplusTotals[col] || 0).toLocaleString()}</TableCell>)}</TableRow>
                            <TableRow className="font-bold bg-muted/50"><TableCell>Total Productions and Additions</TableCell>{wineColumns.map(col => <TableCell key={col} className="text-right">{((sawis5Opening[col] || 0) + (calculatedTotals.allAdditions[col] || 0)).toLocaleString()}</TableCell>)}</TableRow>
                        </TableBody>
                    </Table>

                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="font-bold text-foreground">DISPOSALS AND UTILIZATIONS</TableHead>
                                {wineColumns.map(col => <TableHead key={col} className="text-right">{col}</TableHead>)}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                           <TableRow><TableCell>Bulk - Non duty paid</TableCell>{wineColumns.map(col => <TableCell key={col} className="text-right">{((calculatedTotals.bulkNonDutyTotals[col] || 0)).toLocaleString()}</TableCell>)}</TableRow>
                            <TableRow><TableCell>Bulk - Duty paid</TableCell>{wineColumns.map(col => <TableCell key={col} className="text-right">{((calculatedTotals.bulkDutyTotals[col] || 0)).toLocaleString()}</TableCell>)}</TableRow>
                            <TableRow><TableCell>Packaged - Non duty paid</TableCell>{wineColumns.map(col => <TableCell key={col} className="text-right">{((calculatedTotals.packagedNonDutyTotals[col] || 0)).toLocaleString()}</TableCell>)}</TableRow>
                            <TableRow><TableCell>Packaged - Duty paid</TableCell>{wineColumns.map(col => <TableCell key={col} className="text-right">{((calculatedTotals.packagedDutyTotals[col] || 0)).toLocaleString()}</TableCell>)}</TableRow>
                            <TableRow><TableCell>Export</TableCell>{wineColumns.map(col => <TableCell key={col} className="text-right">{((calculatedTotals.exportTotals[col] || 0)).toLocaleString()}</TableCell>)}</TableRow>
                            <TableRow><TableCell>Bottling</TableCell>{wineColumns.map(col => <TableCell key={col} className="text-right">{((calculatedTotals.bottlingTotals[col] || 0)).toLocaleString()}</TableCell>)}</TableRow>
                            <TableRow><TableCell>Transfers To</TableCell>{wineColumns.map(col => <TableCell key={col} className="text-right">{((calculatedTotals.transferOutTotals[col] || 0)).toLocaleString()}</TableCell>)}</TableRow>
                            <TableRow><TableCell>Lees destroyed</TableCell>{wineColumns.map(col => <TableCell key={col} className="text-right">{((calculatedTotals.leesDestroyedTotals[col] || 0)).toLocaleString()}</TableCell>)}</TableRow>
                            <TableRow><TableCell>Deficiency</TableCell>{wineColumns.map(col => <TableCell key={col} className="text-right">{((calculatedTotals.deficiencyTotals[col] || 0)).toLocaleString()}</TableCell>)}</TableRow>
                            <TableRow className="font-bold bg-muted/50"><TableCell>Total Disposals</TableCell>{wineColumns.map(col => <TableCell key={col} className="text-right">{((calculatedTotals.allDisposals[col] || 0)).toLocaleString()}</TableCell>)}</TableRow>
                             <TableRow className="border-t-2 border-primary">
                                <TableCell className="text-lg font-bold">Closing Balance</TableCell>
                                {wineColumns.map(col => <TableCell key={col} className="text-right text-lg font-bold">{(calculatedTotals.closingBalance[col] || 0).toLocaleString()}</TableCell>)}
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            
            <Sawis7OverleafPriceForm overleafData={sawis7OverleafPrice} onOverleafChange={handleOverleafPriceChange} />
            <Sawis7OverleafContainerForm overleafData={sawis7OverleafContainer} onOverleafChange={handleOverleafContainerChange} />

            <Card>
                <CardHeader>
                    <CardTitle>Declaration</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="submitterName">Name of Person Submitting</Label>
                        <Input id="submitterName" name="submitterName" required value={submitterName} onChange={e => setSubmitterName(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="submissionDate">Date of Submission</Label>
                        <Input id="submissionDate" name="submissionDate" type="date" value={submissionDate} onChange={e => setSubmissionDate(e.target.value)} required />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="signature">Signature</Label>
                        <Input id="signature" name="signature" type="file" accept="image/*" onChange={e => setSignatureFile(e.target.files?.[0] || null)} />
                    </div>
                </CardContent>
            </Card>

            <SubmitButton />
        </form>
    );
}
