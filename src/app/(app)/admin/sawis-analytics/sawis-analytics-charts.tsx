
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line, ResponsiveContainer } from 'recharts';
import type { MonthlyTotal } from './page';

interface SawisAnalyticsChartsProps {
    monthlyTotals: MonthlyTotal[];
}

export function SawisAnalyticsCharts({ monthlyTotals }: SawisAnalyticsChartsProps) {

    const chartConfig = {
        Unfortified: { label: "Unfortified", color: "hsl(var(--chart-1))" },
        Fortified: { label: "Fortified", color: "hsl(var(--chart-2))" },
        Sparkling: { label: "Sparkling", color: "hsl(var(--chart-3))" },
    };
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Stock Trends (Last 12 Months)</CardTitle>
                <CardDescription>Total volume of key wine types over time.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-[400px] w-full">
                    <ResponsiveContainer>
                    <LineChart data={monthlyTotals}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                        />
                        <YAxis
                            tickFormatter={(value) => `${Number(value) / 1000}k L`}
                        />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Line type="monotone" dataKey="Unfortified" stroke="var(--color-Unfortified)" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="Fortified" stroke="var(--color-Fortified)" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="Sparkling" stroke="var(--color-Sparkling)" strokeWidth={2} dot={false} />
                    </LineChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}

