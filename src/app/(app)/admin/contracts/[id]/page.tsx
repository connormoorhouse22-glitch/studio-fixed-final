
'use server';

import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Grape, ArrowLeft } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { getUserByEmail } from '@/lib/userActions';
import type { User } from '@/lib/users';
import { ContractClientWrapper } from './contract-client-wrapper';


const ContractContent = ({ supplier }: { supplier: User | null }) => (
     <div className="prose prose-sm max-w-none text-foreground/80">
        <div className="contract-header" style={{ display: 'none' }} >
             <p className="font-headline text-3xl font-bold">WineSpace SA</p>
             <p>Supplier Service Agreement</p>
        </div>
      <p>This Supplier Service Agreement ("Agreement") is entered into between <strong>{supplier?.company || 'the Supplier'}</strong> ("You", "Supplier") and <strong>WineSpace SA</strong> ("WineSpace", "We", "Us"). This Agreement governs your use of the WineSpace procurement platform ("Platform").</p>

      <h2><strong>1. Service Description</strong></h2>
      <p>The Platform is a digital marketplace designed to connect wine producers with suppliers of goods and services. <strong>WineSpace</strong> provides the infrastructure for this marketplace but does not participate in, nor is it a party to, any transaction between Supplier and a producer.</p>

      <h2><strong>2. Supplier Obligations</strong></h2>
      <p>You agree to provide accurate and up-to-date information regarding your products, pricing, and availability. You are solely responsible for fulfilling any orders placed through the Platform in a timely and professional manner.</p>

      <h2><strong>3. Pricing and Commission</strong></h2>
      <p>In consideration for the use of the Platform, the Supplier agrees to a hybrid pricing model consisting of a monthly retainer fee and a commission on sales. Specifically, the Supplier will be charged a commission of 2.5% (two point five percent) on the total value of all orders that are marked as "Delivered" or otherwise fulfilled through the Platform. The commission fee, alongside the monthly retainer, will be invoiced on a monthly basis.</p>

      <h2><strong>4. Disclaimer of Warranties</strong></h2>
      <p>THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT ANY WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT. WINESPACE DOES NOT WARRANT THAT THE PLATFORM WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.</p>
      <p><strong>WineSpace</strong> makes no representations or warranties about the accuracy, reliability, completeness, or timeliness of the content, services, software, text, graphics, and links on the Platform.</p>

      <h2><strong>5. Limitation of Liability</strong></h2>
      <p>IN NO EVENT SHALL <strong>WINESPACE</strong>, ITS AFFILIATES, OR THEIR RESPECTIVE OFFICERS, DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE FOR ANY DAMAGES WHATSOEVER (INCLUDING, WITHOUT LIMITATION, INCIDENTAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, LOST PROFITS, OR DAMAGES RESULTING FROM LOST DATA OR BUSINESS INTERRUPTION) RESULTING FROM THE USE OR INABILITY TO USE THE PLATFORM, WHETHER BASED ON WARRANTY, CONTRACT, TORT, OR ANY OTHER LEGAL THEORY, AND WHETHER OR NOT WINESPACE IS ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.</p>
      <p>Specifically, <strong>WineSpace</strong> shall not be held liable for:</p>
      <ul>
        <li>Any inaccuracies, errors, or omissions in the information provided on the Platform, including but not limited to product descriptions, pricing, or availability.</li>
        <li>Any failure of performance, error, omission, interruption, defect, delay in operation or transmission, computer virus, or line or system failure.</li>
        <li>Any disputes, losses, or damages arising from transactions or interactions between You and other users of the Platform.</li>
        <li>Any damages or losses incurred as a result of system downtime, maintenance (whether scheduled or unscheduled), or any other interruption in the availability of the Platform.</li>
      </ul>
      <p>The Supplier acknowledges that their use of the Platform is at their own risk.</p>

      <h2><strong>6. Indemnification</strong></h2>
      <p>You agree to defend, indemnify, and hold harmless <strong>WineSpace</strong> and its affiliates, officers, directors, employees, and agents from and against any and all claims, damages, obligations, losses, liabilities, costs, or debt, and expenses (including but not limited to attorney's fees) arising from: (i) your use of and access to the Platform; (ii) your violation of any term of this Agreement; (iii) your violation of any third-party right, including without limitation any copyright, property, or privacy right; or (iv) any claim that one of your submissions caused damage to a third party.</p>
      
      <h2><strong>7. General Provisions</strong></h2>
      <p>This Agreement shall be governed by the laws of the Republic of South Africa. Any changes to this Agreement will be communicated to you via the Platform or email. Continued use of the Platform after such changes constitutes your acceptance of the new terms.</p>

      <h2><strong>8. Agreement</strong></h2>
      <p>By signing below, the parties acknowledge that they have read, understood, and agree to be bound by the terms and conditions of this Supplier Service Agreement.</p>

      <div className="signature-section" style={{ marginTop: '50px', fontSize: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '50px' }}>
          <div style={{ width: '48%' }}>
            <p><strong>For the Supplier ({supplier?.company}):</strong></p>
            <div className="signature-line" style={{ borderBottom: '1px solid #333', height: '20px', marginTop: '40px', marginBottom: '5px' }}></div>
            <p>Signature</p>
            <div style={{ borderBottom: '1px solid #333', height: '20px', marginTop: '20px', marginBottom: '5px' }}></div>
            <p>Name and Title</p>
             <div style={{ borderBottom: '1px solid #333', height: '20px', marginTop: '20px', marginBottom: '5px' }}></div>
            <p>Date</p>
          </div>
          <div style={{ width: '48%' }}>
            <p><strong>For WineSpace SA (Pty) Ltd:</strong></p>
            <div className="signature-line" style={{ borderBottom: '1px solid #333', height: '20px', marginTop: '40px', marginBottom: '5px' }}></div>
            <p>Signature</p>
            <div style={{ borderBottom: '1px solid #333', height: '20px', marginTop: '20px', marginBottom: '5px' }}></div>
            <p>Name and Title</p>
             <div style={{ borderBottom: '1px solid #333', height: '20px', marginTop: '20px', marginBottom: '5px' }}></div>
            <p>Date</p>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ width: '48%' }}>
            <p><strong>Witness 1:</strong></p>
            <div className="signature-line" style={{ borderBottom: '1px solid #333', height: '20px', marginTop: '40px', marginBottom: '5px' }}></div>
            <p>Signature</p>
            <div style={{ borderBottom: '1px solid #333', height: '20px', marginTop: '20px', marginBottom: '5px' }}></div>
            <p>Name</p>
             <div style={{ borderBottom: '1px solid #333', height: '20px', marginTop: '20px', marginBottom: '5px' }}></div>
            <p>Date</p>
          </div>
            <div style={{ width: '48%' }}>
            <p><strong>Witness 2:</strong></p>
            <div className="signature-line" style={{ borderBottom: '1px solid #333', height: '20px', marginTop: '40px', marginBottom: '5px' }}></div>
            <p>Signature</p>
            <div style={{ borderBottom: '1px solid #333', height: '20px', marginTop: '20px', marginBottom: '5px' }}></div>
            <p>Name</p>
             <div style={{ borderBottom: '1px solid #333', height: '20px', marginTop: '20px', marginBottom: '5px' }}></div>
            <p>Date</p>
          </div>
        </div>
      </div>
    </div>
  );


export default async function ContractPage({ params }: { params: { id: string } }) {
  const userEmail = decodeURIComponent(params.id);
  const supplier = await getUserByEmail(userEmail);

  if (!supplier || supplier.role !== 'Supplier') {
    notFound();
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Button variant="outline" size="sm" asChild>
            <Link href="/admin/contracts">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Contracts
            </Link>
        </Button>
      </div>

      <ContractClientWrapper supplier={supplier}>
        <Card>
            <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                <CardTitle>WineSpace SA - Supplier Service Agreement</CardTitle>
                <CardDescription>Version 1.0 - Effective Date: {new Date().toLocaleDateString('en-CA')}</CardDescription>
                </div>
                <Grape className="h-8 w-8 text-primary" />
            </div>
            </CardHeader>
            <CardContent>
                <Separator className="my-4" />
                 <style dangerouslySetInnerHTML={{
                    __html: `
                        .prose h2 { margin-top: 1.5em; margin-bottom: 0.5em; padding-bottom: 0.25em; border-bottom: 1px solid hsl(var(--border)); }
                        .prose ul { list-style-position: outside; padding-left: 1.5em; }
                        .prose li { margin-top: 0.25em; margin-bottom: 0.25em; }
                    `
                 }} />
                <ContractContent supplier={supplier} />
            </CardContent>
        </Card>
      </ContractClientWrapper>
    </div>
  );
}
