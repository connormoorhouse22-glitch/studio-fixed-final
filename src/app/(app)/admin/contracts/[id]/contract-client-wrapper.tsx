
'use client';

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import type { User } from '@/lib/users';

export function ContractClientWrapper({
  supplier,
  children,
}: {
  supplier: User;
  children: React.ReactNode;
}) {
  const contractRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printWindow = window.open('', '', 'height=800,width=800');
    if (printWindow && contractRef.current) {
      const contractHtml = contractRef.current.innerHTML;
      printWindow.document.write(`
        <html>
          <head>
            <title>WineSpace SA - Supplier Service Agreement</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
              .contract-container { width: 100%; margin: 0; padding: 20px; box-shadow: none; border: none; }
              .contract-header { text-align: center; border-bottom: 2px solid #EEE; padding-bottom: 20px; margin-bottom: 30px; }
              .contract-header h1 { font-size: 24px; color: #1a1a1a; margin-bottom: 5px; }
              .contract-header p { font-size: 14px; color: #666; margin: 0; }
              h2 { font-size: 18px; margin-top: 30px; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 1px solid #EEE; }
              p, li { font-size: 12px; text-align: justify; }
              ul { padding-left: 20px; }
              .signature-section { margin-top: 50px; }
              .signature-block { display: inline-block; width: 45%; margin-right: 5%; vertical-align: top; }
              .signature-line { border-bottom: 1px solid #333; height: 20px; margin-top: 40px; margin-bottom: 5px; }
              .no-print { display: none; }
              .print-logo { display: block !important; margin: 0 auto 10px; height: 50px; }
              @page { margin: 1in; }
            </style>
          </head>
          <body>
            ${contractHtml}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  return (
    <>
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Supplier Agreement</h2>
          <p className="text-muted-foreground">For: <strong>{supplier?.company}</strong></p>
        </div>
        <Button onClick={handlePrint}>
          <Download className="mr-2 h-4 w-4" />
          Download as PDF
        </Button>
      </div>

      <div ref={contractRef}>
        {children}
      </div>
    </>
  );
}
