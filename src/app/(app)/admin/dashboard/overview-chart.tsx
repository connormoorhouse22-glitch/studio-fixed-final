
'use client';

import { Area, AreaChart, CartesianGrid, XAxis, Tooltip, Legend } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';

interface OverviewChartProps {
    salesData: {
        date: string;
        revenue: number;
        orders: number;
    }[];
    chartConfig: ChartConfig;
}

export function OverviewChart({ salesData, chartConfig }: OverviewChartProps) {
    return (
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
            <AreaChart
                accessibilityLayer
                data={salesData}
                margin={{
                    left: 12,
                    right: 12,
                    top: 10,
                }}
            >
                <CartesianGrid vertical={false} />
                <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value.slice(0, 3)}
                />
                 <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                />
                <defs>
                    <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.1} />
                    </linearGradient>
                     <linearGradient id="fillOrders" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-orders)" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="var(--color-orders)" stopOpacity={0.1} />
                    </linearGradient>
                </defs>
                <Area
                    dataKey="revenue"
                    type="natural"
                    fill="url(#fillRevenue)"
                    stroke="var(--color-revenue)"
                    stackId="a"
                />
                <Area
                    dataKey="orders"
                    type="natural"
                    fill="url(#fillOrders)"
                    stroke="var(--color-orders)"
                    stackId="b"
                />
                <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
        </ChartContainer>
    );
}
