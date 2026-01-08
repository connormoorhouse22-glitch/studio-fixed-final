
'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Grape } from 'lucide-react';

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn('flex items-center gap-3', className)}>
       <div className="rounded-lg bg-white p-2 text-primary">
        <Grape className="h-6 w-6" />
      </div>
      <span className="text-lg font-semibold tracking-wide group-data-[state=expanded]:opacity-100 group-data-[state=collapsed]:opacity-0 transition-opacity duration-200">
        WineSpace SA
      </span>
    </Link>
  );
}
