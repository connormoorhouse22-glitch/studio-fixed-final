
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { PublicHeader } from '@/components/public-header';
import { Shield } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="home-page-layout">
        <main className="flex min-h-screen flex-col items-center bg-background">
        <PublicHeader />
        <section className="relative w-full h-[50vh]">
            <Image
                src="https://i.imgur.com/B82e1tA.jpeg"
                alt="Vineyard at sunset"
                fill
                className="object-cover"
                priority
                data-ai-hint="vineyard landscape"
            />
        </section>

        <section className="w-full text-center py-12 px-4">
            <h1 className="text-5xl font-bold font-headline mb-4">Welcome to WineSpace</h1>
            <p className="max-w-2xl text-lg text-foreground/80 mx-auto">
                The premier procurement portal for the South African wine industry. Streamline your purchasing, connect with trusted suppliers, and elevate your winemaking.
            </p>
        </section>

        <section className="w-full max-w-4xl px-4 pb-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <CardTitle>For Producers</CardTitle>
                        <CardDescription>Access a curated marketplace of top-tier suppliers for everything from grapes to glass.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full" asChild>
                            <Link href="/login/producer">Producer Portal</Link>
                        </Button>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <CardTitle>For Suppliers</CardTitle>
                        <CardDescription>Showcase your products to a dedicated audience of South African wine producers.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full" asChild>
                            <Link href="/login/supplier">Supplier Portal</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </section>
            <div className="pb-8">
                <Link href="/login/admin" className="text-sm text-muted-foreground hover:text-primary">
                    Admin Portal
                </Link>
            </div>
        <footer className="w-full py-4 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} WineSpace. All rights reserved.
        </footer>
        </main>
    </div>
  );
}
