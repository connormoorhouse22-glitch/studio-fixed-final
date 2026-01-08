export const dynamic = 'force-dynamic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Package, ShoppingCart, Truck } from 'lucide-react';
import Link from 'next/link';
import { WeatherWidget } from '@/components/weather-widget';

export default function ProducerDashboard() {
  const sections = [
    {
      title: 'Browse Products',
      href: '/products',
      icon: <ShoppingCart className="h-8 w-8 text-muted-foreground" />,
      description: 'Find and purchase supplies from our network of trusted suppliers.',
      cta: 'Start Browsing',
    },
    {
      title: 'View Suppliers',
      href: '/suppliers',
      icon: <Truck className="h-8 w-8 text-muted-foreground" />,
      description: 'Explore profiles and product lists from all available suppliers.',
      cta: 'View Suppliers',
    },
    {
      title: 'My Orders',
      href: '/orders',
      icon: <Package className="h-8 w-8 text-muted-foreground" />,
      description: 'Track your current and past procurement orders.',
      cta: 'Check Status',
    },
    {
      title: 'Request a Quote',
      href: '/quotes/request',
      icon: <FileText className="h-8 w-8 text-muted-foreground" />,
      description: 'Need something specific? Submit a request for a quote.',
      cta: 'Create RFQ',
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Procurement Dashboard</h2>
        <p className="text-muted-foreground">Your central hub for procuring winery supplies.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Action Cards */}
        <div className="lg:col-span-2 grid gap-6 sm:grid-cols-1 md:grid-cols-2">
            {sections.map((section) => (
                <Card key={section.title} className="flex flex-col">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <div>
                        <CardTitle className="text-xl font-bold">{section.title}</CardTitle>
                        <CardDescription className="pt-2">{section.description}</CardDescription>
                    </div>
                    {section.icon}
                </CardHeader>
                <CardContent className="flex-grow flex items-end">
                    <Link href={section.href} className='w-full'>
                        <Button className="w-full">{section.cta}</Button>
                    </Link>
                </CardContent>
                </Card>
            ))}
        </div>

        {/* Sidebar Widgets */}
        <div className="lg:col-span-1">
            <WeatherWidget />
        </div>
      </div>
    </div>
  );
}