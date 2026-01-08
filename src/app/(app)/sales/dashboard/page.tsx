
'use client';

import { DollarSign, Users, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getOrders, type Order } from '@/lib/order-actions';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import type { Product } from '@/lib/product-actions';
import { getProducts } from '@/lib/product-actions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useEffect, useState } from 'react';

// --- Data Processing Functions ---

// 1. Calculate Sales Over Time
function getSalesOverTime(orders: Order[]) {
    const monthlySales = new Map<string, number>();
    const monthOrder: string[] = [];

    // Initialize last 12 months
    for (let i = 11; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const month = d.toLocaleString('default', { month: 'short' });
        if (!monthlySales.has(month)) {
            monthlySales.set(month, 0);
            monthOrder.push(month);
        }
    }

    orders.forEach(order => {
        if (order.status === 'Delivered') {
            const orderMonth = new Date(order.createdAt).toLocaleString('default', { month: 'short' });
            if (monthlySales.has(orderMonth)) {
                monthlySales.set(orderMonth, monthlySales.get(orderMonth)! + order.totalAmount);
            }
        }
    });

    return monthOrder.map(month => ({
        month,
        revenue: monthlySales.get(month) || 0,
    }));
}

// 2. Calculate Top Customers
function getTopCustomers(orders: Order[]) {
    const customerTotals = new Map<string, { total: number; email: string; avatar: string }>();

    orders.forEach(order => {
        if (order.status === 'Delivered') {
            const current = customerTotals.get(order.producerCompany) || { total: 0, email: order.producerEmail, avatar: `https://picsum.photos/seed/${order.producerCompany}/40` };
            customerTotals.set(order.producerCompany, {
                ...current,
                total: current.total + order.totalAmount,
            });
        }
    });

    return Array.from(customerTotals.entries())
        .map(([company, data]) => ({ company, ...data }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);
}

// 3. Calculate Category Performance
function getCategoryPerformance(orders: Order[], products: Product[]) {
    const categoryTotals = new Map<string, number>();

    orders.forEach(order => {
        if (order.status === 'Delivered') {
            order.items.forEach(item => {
                const product = products.find(p => p.id === item.id);
                if (product) {
                    const category = product.category || 'Uncategorized';
                    const currentTotal = categoryTotals.get(category) || 0;
                    categoryTotals.set(category, currentTotal + item.price * item.quantity);
                }
            });
        }
    });

    return Array.from(categoryTotals.entries())
        .map(([name, revenue]) => ({ name, revenue }))
        .sort((a, b) => b.revenue - a.revenue);
}


// --- Main Page Component ---

export default function SalesDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
        const userRole = localStorage.getItem('userRole');
        const userCompany = localStorage.getItem('userCompany');

        if (userRole === 'Supplier' && userCompany) {
            const [ordersData, productsData] = await Promise.all([
                getOrders({ userRole: 'Supplier', supplierCompany: userCompany }),
                getProducts(userCompany)
            ]);
            setOrders(ordersData);
            setProducts(productsData);
        }
        setIsLoading(false);
    }
    fetchData();
  }, []);


  const totalRevenue = orders
    .filter(order => order.status === 'Delivered')
    .reduce((acc, order) => acc + order.totalAmount, 0);

  const totalSales = orders.length;
  const uniqueProducers = new Set(orders.map(order => order.producerCompany));
  const totalCustomers = uniqueProducers.size;

  const salesOverTimeData = getSalesOverTime(orders);
  const topCustomersData = getTopCustomers(orders);
  const categoryPerformanceData = getCategoryPerformance(orders, products);
  const mostViewedProducts = products.slice(0, 5).map(p => ({ id: p.id, name: p.name, views: Math.floor(Math.random() * 500) + 50 })); // Mock data

  const chartConfig = {
    revenue: { label: "Revenue", color: "hsl(var(--chart-1))" },
  };
  
  if (isLoading) {
    return <div>Loading dashboard...</div>
  }

  return (
    <div className="flex flex-col gap-8">
       <div>
            <h2 className="text-3xl font-bold tracking-tight">Advanced Analytics</h2>
            <p className="text-muted-foreground">Insights into your sales performance and customer behavior.</p>
        </div>

      {/* --- Key Metrics --- */}
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue (Delivered)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">ZAR {totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">Based on completed orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSales}</div>
            <p className="text-xs text-muted-foreground">Total number of orders received</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground">Unique producers who have ordered</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* --- Sales Over Time Chart --- */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Sales Over Time</CardTitle>
            <CardDescription>Revenue from delivered orders over the last 12 months.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <LineChart data={salesOverTimeData} margin={{ left: 12, right: 12, top: 5, bottom: 5 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickFormatter={(value) => `R${Number(value) / 1000}k`} />
                <Tooltip cursor={false} content={<ChartTooltipContent />} />
                <Line dataKey="revenue" type="monotone" stroke="var(--color-revenue)" strokeWidth={2} dot={false} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* --- Top Customers Table --- */}
        <Card>
            <CardHeader>
                <CardTitle>Top Customers</CardTitle>
                <CardDescription>Your most valuable customers by total revenue.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Producer</TableHead>
                            <TableHead className="text-right">Revenue</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                         {topCustomersData.length > 0 ? topCustomersData.map(c => (
                            <TableRow key={c.company}>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={c.avatar} data-ai-hint="company logo" />
                                            <AvatarFallback>{c.company.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">{c.company}</p>
                                            <p className="text-xs text-muted-foreground">{c.email}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right font-mono">
                                    ZAR {c.total.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                                </TableCell>
                            </TableRow>
                         )) : (
                            <TableRow>
                                <TableCell colSpan={2} className="h-24 text-center">No delivered orders yet.</TableCell>
                            </TableRow>
                         )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>

       <div className="grid gap-6 lg:grid-cols-3">
         {/* --- Category Performance --- */}
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Category Performance</CardTitle>
                <CardDescription>Revenue breakdown by product category.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <RechartsBarChart data={categoryPerformanceData} layout="vertical" margin={{ left: 20, right: 20 }}>
                        <CartesianGrid horizontal={false} />
                        <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tickMargin={8} width={100} />
                        <XAxis type="number" hide />
                        <Tooltip cursor={false} content={<ChartTooltipContent />} />
                        <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
                    </RechartsBarChart>
                </ChartContainer>
            </CardContent>
        </Card>
        
        {/* --- Most Viewed Products --- */}
        <Card>
            <CardHeader>
                <CardTitle>Most Viewed Products</CardTitle>
                <CardDescription>Your products getting the most attention.</CardDescription>
            </CardHeader>
            <CardContent>
                <ul className="space-y-4">
                    {mostViewedProducts.map(p => (
                        <li key={p.id} className="flex justify-between items-center text-sm">
                            <span className="font-medium truncate pr-4">{p.name}</span>
                            <span className="font-mono text-muted-foreground">{p.views.toLocaleString()} views</span>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
