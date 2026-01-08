
'use server';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getAllSawisReturns, type SawisReturn } from '@/lib/sawis-actions';
import { Wine, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parse } from 'date-fns';
import { SawisAnalyticsCharts } from './sawis-analytics-charts';

const wineColumns = ['Unfortified', 'Fortified', 'Sparkling', 'Concentrate', 'Grape Juice', 'Wine Coolers'] as const;
type WineColumn = typeof wineColumns[number];

export type MonthlyTotal = {
    month: string;
    Unfortified: number;
    Fortified: number;
    Sparkling: number;
    Concentrate: number;
    'Grape Juice': number;
    'Wine Coolers': number;
};

// --- Data Processing Functions ---
function processMonthlyData(allReturns: SawisReturn[]): { 
    monthlyTotals: MonthlyTotal[], 
    latestMonthData: MonthlyTotal | null,
    previousMonthData: MonthlyTotal | null 
} {
    const totalsByMonth = new Map<string, { [key in WineColumn]: number }>();

    allReturns.forEach(r => {
        // Robustly parse the month string (e.g., "July 2024") into a Date object.
        const parsedDate = parse(r.month, 'MMMM yyyy', new Date());
        if (isNaN(parsedDate.getTime())) {
            // If parsing fails, skip this record to avoid crashing.
            console.warn(`Skipping invalid month format: ${r.month}`);
            return;
        }

        // Normalize month string to YYYY-MM for sorting and uniqueness
        const monthKey = format(parsedDate, 'yyyy-MM');

        if (!totalsByMonth.has(monthKey)) {
            totalsByMonth.set(monthKey, { Unfortified: 0, Fortified: 0, Sparkling: 0, Concentrate: 0, 'Grape Juice': 0, 'Wine Coolers': 0 });
        }
        const currentMonthTotals = totalsByMonth.get(monthKey)!;

        for (const col of wineColumns) {
            const balance = r.closingBalances[col as keyof typeof r.closingBalances];
            if (typeof balance === 'number') {
                currentMonthTotals[col] += balance;
            }
        }
    });

    const sortedMonthKeys = Array.from(totalsByMonth.keys()).sort().reverse();
    const latestMonthKey = sortedMonthKeys[0] || null;
    const previousMonthKey = sortedMonthKeys[1] || null;
    
    // Create a stable date for formatting to avoid timezone issues.
    const getSafeDateFromKey = (key: string) => parse(key, 'yyyy-MM', new Date());

    const monthlyTotals: MonthlyTotal[] = sortedMonthKeys.slice(0, 12).reverse().map(key => {
        const date = getSafeDateFromKey(key);
        return {
            month: format(date, 'MMM yy'),
            ...(totalsByMonth.get(key) as Omit<MonthlyTotal, 'month'>),
        };
    });

    return {
        monthlyTotals,
        latestMonthData: latestMonthKey ? { month: latestMonthKey, ...(totalsByMonth.get(latestMonthKey) as Omit<MonthlyTotal, 'month'>) } : null,
        previousMonthData: previousMonthKey ? { month: previousMonthKey, ...(totalsByMonth.get(previousMonthKey) as Omit<MonthlyTotal, 'month'>) } : null,
    };
}


function calculatePercentageChange(current: number, previous: number): number {
    if (previous === 0) {
        return current > 0 ? 100 : 0;
    }
    return ((current - previous) / previous) * 100;
}

// --- Component ---

export default async function SawisAnalyticsPage() {
    const allReturns = await getAllSawisReturns();
    const { monthlyTotals, latestMonthData, previousMonthData } = processMonthlyData(allReturns);

    const latestMonthName = latestMonthData 
        ? format(parse(latestMonthData.month, 'yyyy-MM', new Date()), 'MMMM yyyy') 
        : 'N/A';

    return (
        <div className="flex flex-col gap-8">
             <div>
                <h2 className="text-3xl font-bold tracking-tight">SAWIS Analytics</h2>
                <p className="text-muted-foreground">
                   An aggregated view of closing stock balances across all producers.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Total Closing Stock Balances</CardTitle>
                    <CardDescription>
                       Latest available data from {latestMonthName}.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wineColumns.map(col => {
                        const latestValue = latestMonthData?.[col] || 0;
                        const previousValue = previousMonthData?.[col] || 0;
                        const change = calculatePercentageChange(latestValue, previousValue);
                        const isIncrease = change > 0;
                        const isDecrease = change < 0;
                        const ChangeIcon = isIncrease ? TrendingUp : isDecrease ? TrendingDown : Minus;

                        return (
                             <Card key={col}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">{col}</CardTitle>
                                    <Wine className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{latestValue.toLocaleString()} L</div>
                                     <p className={cn("text-xs flex items-center", isIncrease ? "text-green-600" : isDecrease ? "text-destructive" : "text-muted-foreground")}>
                                       <ChangeIcon className="mr-1 h-3 w-3" />
                                       {change.toFixed(1)}% from last month
                                    </p>
                                </CardContent>
                            </Card>
                        )
                    })}
                </CardContent>
            </Card>

            <SawisAnalyticsCharts monthlyTotals={monthlyTotals} />
        </div>
    );
}
