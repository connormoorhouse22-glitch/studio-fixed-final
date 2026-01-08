
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Grape } from 'lucide-react';

export function PublicHeader() {
    return (
        <header className="w-full px-8 py-4 flex justify-between items-center self-start">
            <div className="flex items-center gap-2">
                <Link href="/" className="flex items-center gap-3">
                    <div className="rounded-lg bg-white p-2 text-primary">
                        <Grape className="h-6 w-6" />
                    </div>
                    <h1 className="text-2xl font-bold text-primary">WineSpace SA</h1>
                </Link>
            </div>
            <nav className="flex items-center gap-4">
            <Button variant="ghost" asChild>
                <Link href="/about">About</Link>
            </Button>
            <Button variant="ghost" asChild>
                <Link href="/contact">Contact</Link>
            </Button>
            <Button variant="ghost" asChild>
                <Link href="/login/producer">Producer Login</Link>
            </Button>
            <Button variant="ghost" asChild>
                <Link href="/login/supplier">Supplier Login</Link>
            </Button>
            <Button variant="outline" asChild>
                <Link href="/register">Register</Link>
            </Button>
            </nav>
      </header>
    )
}
