'use client';

import { Bar, BarChart, CartesianGrid, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

const salesData = [
  { month: 'Jan', sales: 186, revenue: 80 },
  { month: 'Feb', sales: 305, revenue: 200 },
  { month: 'Mar', sales: 237, revenue: 120 },
  { month: 'Apr', sales: 73, revenue: 190 },
  { month: 'May', sales: 209, revenue: 130 },
  { month: 'Jun', sales: 214, revenue: 140 },
];

const activityData = [
  { category: 'Sign-ups', value: 275 },
  { category: 'Logins', value: 450 },
  { category: 'Orders', value: 200 },
  { category: 'Support Tickets', value: 120 },
  { category: 'Profile Updates', value: 75 },
];

const chartConfig = {
  sales: {
    label: 'Sales',
    color: 'hsl(var(--chart-1))',
  },
  revenue: {
    label: 'Revenue',
    color: 'hsl(var(--chart-2))',
  },
};

export default function AnalyticsPage() {
  return (
    <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Sales and Revenue Overview</CardTitle>
          <CardDescription>January - June 2024</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <LineChart data={salesData} margin={{ left: 12, right: 12 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis />
              <Tooltip cursor={false} content={<ChartTooltipContent />} />
              <Line dataKey="sales" type="monotone" stroke="var(--color-sales)" strokeWidth={2} dot={false} />
              <Line dataKey="revenue" type="monotone" stroke="var(--color-revenue)" strokeWidth={2} dot={false} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Monthly Sales Performance</CardTitle>
          <CardDescription>A bar chart showing total sales per month.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart data={salesData}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis />
              <Tooltip cursor={false} content={<ChartTooltipContent />} />
              <Bar dataKey="sales" fill="var(--color-sales)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>User Activity Distribution</CardTitle>
          <CardDescription>A pie chart showing the breakdown of user activities.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <ChartContainer config={{}} className="h-[350px] w-full max-w-lg">
            <PieChart>
              <Tooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={activityData}
                dataKey="value"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={150}
                fill="hsl(var(--primary))"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {activityData.map((_entry, index) => (
                  <Bar key={`cell-${index}`} fill={`hsl(var(--chart-${(index % 5) + 1}))`} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
