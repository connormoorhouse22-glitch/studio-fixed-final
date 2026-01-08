
'use client';

import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface LiveClockProps {
  position?: 'fixed' | 'relative';
}

export function LiveClock({ position = 'fixed' }: LiveClockProps) {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    // This effect runs only on the client, after the component has mounted.
    setTime(new Date());

    const timerId = setInterval(() => {
      setTime(new Date());
    }, 1000);

    // Cleanup the interval when the component is unmounted.
    return () => {
      clearInterval(timerId);
    };
  }, []); // The empty dependency array is crucial.

  const clockClasses = cn(
    'rounded-md border bg-background/80 px-3 py-1.5 text-sm font-medium text-muted-foreground backdrop-blur-sm',
    position === 'fixed' && 'fixed bottom-4 right-4 z-50',
    position === 'relative' && 'relative inline-block'
  );

  // On the server, and on the very first client render, 'time' will be null.
  // We render a placeholder to prevent hydration mismatch and layout shift.
  if (!time) {
    return (
        <div className={cn(position === 'fixed' ? 'fixed bottom-4 right-4 z-50' : 'relative inline-block')}>
            <Skeleton className="h-8 w-[150px] rounded-md" />
        </div>
    );
  }

  // Once the effect has run on the client, we render the actual clock.
  return (
    <div className={clockClasses}>
      {format(time, 'dd MMM yyyy, HH:mm:ss')}
    </div>
  );
}
