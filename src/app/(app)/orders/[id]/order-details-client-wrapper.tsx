
'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Download, ArrowLeft } from 'lucide-react';
import type { Order } from '@/lib/order-actions';

export function OrderDetailsClientWrapper({
  order,
  children,
}: {
  order: Order;
  children: React.ReactNode;
}) {
  const printableRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printWindow = window.open('', '', 'height=800,width=800');
    if (printWindow && printableRef.current) {
      const contentHtml = printableRef.current.innerHTML;
      const headHtml = `
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .printable-container { width: 100%; max-width: 800px; margin: 0 auto; padding: 20px; }
          .print-header { text-align: center; border-bottom: 2px solid #EEE; padding-bottom: 20px; margin-bottom: 30px; }
          .print-header h1 { font-size: 24px; color: #1a1a1a; margin-bottom: 5px; }
          .print-header p { font-size: 14px; color: #666; margin: 0; }
          h3 { font-size: 16px; font-weight: 600; margin-top: 20px; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 1px solid #EEE; }
          p { font-size: 12px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 20px; }
          th, td { border: 1px solid #DDD; padding: 8px; text-align: left; }
          th { background-color: #f9f9f9; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .font-medium { font-weight: 500; }
          .font-bold { font-weight: 700; }
          .text-muted-foreground { color: #666; }
          .no-print { display: none; }
          .grid { display: grid; }
          .gap-6 { gap: 1.5rem; }
          .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
          .mb-2 { margin-bottom: 0.5rem; }
          .font-semibold { font-weight: 600; }
          .my-4 { margin-top: 1rem; margin-bottom: 1rem; }
          .mb-4 { margin-bottom: 1rem; }
          .w-full { width: 100%; }
          .flex { display: flex; }
          .justify-end { justify-content: flex-end; }
          .ml-4 { margin-left: 1rem; }
          .text-lg { font-size: 1.125rem; }
          @page { margin: 1in; }
        </style>
      `;

      printWindow.document.write(`
        <html>
          <head>
            <title>Order #${order.orderNumber}</title>
            ${headHtml}
          </head>
          <body>
            <div class="printable-container">
              <div class="print-header">
                <h1>Order #${order.orderNumber}</h1>
                <p>WineSpace SA Procurement Order</p>
              </div>
              ${contentHtml}
            </div>
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
      <div className="flex items-center justify-between no-print">
         <Link href="/orders">
            <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Orders
            </Button>
        </Link>
        <Button onClick={handlePrint}>
          <Download className="mr-2 h-4 w-4" />
          Print / Download PDF
        </Button>
      </div>
      <div ref={printableRef}>
        {children}
      </div>
    </>
  );
}
