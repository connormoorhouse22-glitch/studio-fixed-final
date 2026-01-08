
'use server';

import { QrCodeRequestForm } from './form';

export default async function RequestQrCodesPage() {

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Request QR Codes for EU E-Labels</h2>
                <p className="text-muted-foreground">
                   Complete the form for each wine requiring a QR code. All fields are required for compliance.
                </p>
            </div>

            <QrCodeRequestForm />
        </div>
    );
}
