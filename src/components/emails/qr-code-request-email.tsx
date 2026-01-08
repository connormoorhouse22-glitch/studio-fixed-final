
import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Heading,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import type { QrCodeRequest } from '@/app/(app)/qr-codes/request/actions';
import type { User } from '@/lib/users';

interface QrCodeRequestEmailProps {
  producer: User;
  requests: QrCodeRequest[];
  orderNumber: string;
}

export const QrCodeRequestEmail: React.FC<Readonly<QrCodeRequestEmailProps>> = ({
  producer,
  requests,
  orderNumber,
}) => {
  return (
    <Html>
      <Head />
      <Preview>New QR Code Request ({orderNumber}) from {producer.company}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>New QR Code Request</Heading>
          
          <Section style={detailsSection}>
            <Text style={detailText}><strong>Order #:</strong> {orderNumber}</Text>
            <Hr style={hr} />
            <Text style={detailText}><strong>From:</strong> {producer.company}</Text>
            <Text style={detailText}><strong>Contact:</strong> {producer.name}</Text>
            <Text style={detailText}><strong>Email:</strong> <a href={`mailto:${producer.email}`}>{producer.email}</a></Text>
            <Text style={detailText}><strong>Phone:</strong> {producer.contactNumber}</Text>
          </Section>

          <Hr style={hr} />

          {requests.map((req, index) => (
             <Section key={req.id} style={requestItemSection}>
                <Heading as="h2" style={subHeading}>
                 Request #{index + 1}: {req.wineName}
                </Heading>
                <table style={table}>
                    <tbody>
                        {req.wineRange && <tr><td style={tableCellKey}>Wine Range</td><td style={tableCellValue}>{req.wineRange}</td></tr>}
                        <tr><td style={tableCellKey}>Vintage</td><td style={tableCellValue}>{req.vintage}</td></tr>
                        <tr><td style={tableCellKey}>Wine of Origin</td><td style={tableCellValue}>{req.wineOfOrigin}</td></tr>
                        <tr><td style={tableCellKey}>Seal Type</td><td style={tableCellValue}>{req.sealType}</td></tr>
                        <tr><td style={tableCellKey}>WIETA</td><td style={tableCellValue}>{req.wieta}</td></tr>
                        <tr><td style={tableCellKey}>WWF</td><td style={tableCellValue}>{req.wwf}</td></tr>
                    </tbody>
                </table>
                {(req.ingredients && req.ingredients.length > 0) || req.otherIngredient ? (
                    <>
                        <h4 style={listHeading}>Selected Ingredients:</h4>
                        <ul style={list}>
                            {req.ingredients?.map(ing => <li key={ing} style={listItem}>{ing}</li>)}
                            {req.otherIngredient && <li style={listItem}><strong>Other:</strong> {req.otherIngredient}</li>}
                        </ul>
                    </>
                ) : null}
                <Text style={attachmentText}>The WSR2A analysis form for this wine is attached to this email. A bottle shot may also be attached if provided by the user.</Text>
            </Section>
          ))}

          <Hr style={hr} />

          <Text style={footer}>
            This is an automated notification from the WineSpace platform.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default QrCodeRequestEmail;

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  border: '1px solid #f0f0f0',
  borderRadius: '4px',
};

const heading = {
  fontSize: '24px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  color: '#333',
};

const subHeading = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#333',
};

const listHeading = {
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#333',
  marginTop: '16px',
};

const detailsSection = {
  padding: '0 20px',
};

const requestItemSection = {
    padding: '0 20px 20px',
    borderBottom: '1px solid #e6ebf1',
}

const detailText = {
  margin: '0 0 10px 0',
  fontSize: '14px',
  lineHeight: '1.5',
};

const attachmentText = {
  fontSize: '12px',
  color: '#666',
  fontStyle: 'italic' as const,
  marginTop: '10px',
}

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  textAlign: 'center' as const,
};

const table = {
  width: '100%',
  marginTop: '10px',
};
const tableCellKey = {
  padding: '4px 0',
  verticalAlign: 'top',
  fontSize: '14px',
  fontWeight: 'bold' as const,
  width: '150px'
};
const tableCellValue = {
  padding: '4px 0',
  verticalAlign: 'top',
  fontSize: '14px',
  color: '#555',
};

const list = {
    paddingLeft: '20px',
    margin: '10px 0',
};

const listItem = {
    paddingBottom: '6px',
    fontSize: '14px',
    color: '#555',
}
