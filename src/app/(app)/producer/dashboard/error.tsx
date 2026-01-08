
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex items-center justify-center h-full">
        <Card className="max-w-lg text-center">
            <CardHeader>
                 <div className="mx-auto bg-destructive/10 p-3 rounded-full w-fit">
                    <AlertTriangle className="h-8 w-8 text-destructive" />
                </div>
                <CardTitle className="mt-4">Something Went Wrong</CardTitle>
                <CardDescription>
                   We encountered an unexpected error while trying to load this page.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                    {error.message || "An unknown error occurred."}
                </p>
                <Button
                    onClick={
                    // Attempt to recover by re-rendering the segment
                    () => reset()
                    }
                >
                    Try Again
                </Button>
            </CardContent>
        </Card>
    </div>
  );
}
