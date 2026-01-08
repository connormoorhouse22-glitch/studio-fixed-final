
'use client';

import { SawisReturnForm } from './form';

export const runtime = 'nodejs';

export default function SawisReturnsPage() {

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">SAWIS 5, 6, 7 Monthly Return</h2>
        <p className="text-muted-foreground">
          Complete and submit your monthly SAWIS returns in a single, guided process.
        </p>
      </div>

      <SawisReturnForm />
    </div>
  );
}

    

    