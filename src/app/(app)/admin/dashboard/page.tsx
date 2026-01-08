
'use server';

import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { getAuditLogs, type AuditLogEvent } from '@/lib/audit-log-actions';
import { getOrders, type Order } from '@/lib/order-actions';
import { getUsers, type User } from '@/lib/user-actions';
import { DollarSign, Users, Package, Activity, ArrowRight, BookUser, ShoppingBasket, Truck } from 'lucide-react';
import { format, formatDistanceToNow, subDays } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { OverviewChart } from './overview-chart';


type AggregatedData = {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  newUsersLast30Days: number;
  salesData: { date: string; revenue: number; orders: number }[];
};

async function getAggregatedData(): Promise<AggregatedData> {
    const [orders, users, logs] = await Promise.all([
        getOrders({ userRole: 'Admin' }),
        getUsers(),
        getAuditLogs()
    ]);
    
    const totalRevenue = orders.filter(o => o.status === 'Delivered').reduce((sum, o) => sum + o.totalAmount, 0);
    const totalOrders = orders.length;
    const totalUsers = users.length;

    const thirtyDaysAgo = subDays(new Date(), 30);
    const newUsersLast30Days = users.filter(u => u.createdAt && new Date(u.createdAt) > thirtyDaysAgo).length;
    
    const salesMap = new Map<string, { revenue: number, orders: number }>();
    const dateCursor = new Date();
    for (let i = 0; i < 30; i++) {
        const dateStr = format(dateCursor, 'MMM d');
        salesMap.set(dateStr, { revenue: 0, orders: 0 });
        dateCursor.setDate(dateCursor.getDate() - 1);
    }
    
    orders.forEach(o => {
        const dateStr = format(new Date(o.createdAt), 'MMM d');
        if (salesMap.has(dateStr)) {
            const current = salesMap.get(dateStr)!;
            current.orders += 1;
            if (o.status === 'Delivered') {
                current.revenue += o.totalAmount;
            }
        }
    });

    const salesData = Array.from(salesMap.entries()).map(([date, data]) => ({ date, ...data })).reverse();

    return { totalRevenue, totalOrders, totalUsers, newUsersLast30Days, salesData };
}

async function RecentActivity() {
    const logs = await getAuditLogs();
    const recentLogs = logs.slice(0, 5);

     const getIcon = (eventType: string) => {
        if (eventType.includes('ORDER')) return <ShoppingBasket className="h-4 w-4 text-muted-foreground" />;
        if (eventType.includes('USER')) return <BookUser className="h-4 w-4 text-muted-foreground" />;
        if (eventType.includes('BOOKING')) return <Truck className="h-4 w-4 text-muted-foreground" />;
        return <Activity className="h-4 w-4 text-muted-foreground" />;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-8">
                {recentLogs.map((log) => (
                    <div key={log.id} className="flex items-center gap-4">
                        <div className="rounded-full bg-muted p-2">{getIcon(log.event)}</div>
                        <div className="grid gap-1">
                            <p className="text-sm font-medium leading-none">{log.details.summary}</p>
                            <p className="text-sm text-muted-foreground">{formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}</p>
                        </div>
                    </div>
                ))}
            </CardContent>
             <CardFooter>
                 <Button asChild size="sm" className="ml-auto gap-1">
                    <Link href="/admin/audit-log">
                        View All
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    )
}

export default async function AdminDashboard() {
  const { totalRevenue, totalOrders, totalUsers, newUsersLast30Days, salesData } = await getAggregatedData();

  const chartConfig = {
    revenue: { label: "Revenue", color: "hsl(var(--chart-1))" },
    orders: { label: "Orders", color: "hsl(var(--chart-2))" },
  } satisfies import('@/components/ui/chart').ChartConfig;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Platform Pulse</h2>
        <p className="text-muted-foreground">A real-time overview of platform activity and key metrics.</p>
      </div>

       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue (Delivered)</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">ZAR {totalRevenue.toLocaleString('en-US', { notation: 'compact' })}</div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">+{totalOrders.toLocaleString()}</div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalUsers}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">New Users (30 Days)</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">+{newUsersLast30Days}</div>
                </CardContent>
            </Card>
        </div>
        
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
            <Card className="col-span-1 lg:col-span-4">
                <CardHeader>
                    <CardTitle>Overview</CardTitle>
                     <CardDescription>Daily revenue and order count for the last 30 days.</CardDescription>
                </CardHeader>
                 <CardContent className="pl-2">
                    <OverviewChart salesData={salesData} chartConfig={chartConfig} />
                </CardContent>
            </Card>
            <div className="col-span-1 lg:col-span-3">
                <Suspense fallback={<div>Loading recent activity...</div>}>
                    <RecentActivity />
                </Suspense>
            </div>
        </div>
    </div>
  );
}
