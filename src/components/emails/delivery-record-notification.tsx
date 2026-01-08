
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
import type { DeliveryRecord } from '@/lib/delivery-record-actions';
import type { User } from '@/lib/users';
import { format } from 'date-fns';

interface DeliveryRecordNotificationEmailProps {
  producer: User;
  record: DeliveryRecord;
  recipientEmail: string;
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';

export const DeliveryRecordNotificationEmail: React.FC<Readonly<DeliveryRecordNotificationEmailProps>> = ({
  producer,
  record,
}) => {
  return (
    <Html>
      <Head />
      <Preview>Delivery Record #{record.deliveryRecordNo} from {producer.company}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Delivery Record Created</Heading>
          <Text style={paragraph}>
            This is a confirmation that a new delivery record has been logged by <strong>{producer.company}</strong>.
          </Text>

          <Section style={detailsSection}>
            <Text style={detailText}><strong>Delivery Record #:</strong> {record.deliveryRecordNo}</Text>
            <Text style={detailText}><strong>Consignor:</strong> {record.consignor}</Text>
            <Text style={detailText}><strong>Consignee:</strong> {record.consignee}</Text>
            <Text style={detailText}><strong>Delivery Date:</strong> {format(new Date(record.deliveryDate), 'PPP')}</Text>
            <Hr style={{...hr, margin: '12px 0'}}/>
            <Text style={detailText}><strong>Product:</strong> {record.vintage} {record.productDescription}</Text>
            <Text style={detailText}><strong>Volume:</strong> {record.volumeLitres} Litres</Text>
            <Text style={detailText}><strong>Vehicle Reg:</strong> {record.vehicleRegistration}</Text>
             {record.sawis6No && <Text style={detailText}><strong>SAWIS 6 #:</strong> {record.sawis6No}</Text>}
             {record.wsbRecordNo && <Text style={detailText}><strong>WS/B Record #:</strong> {record.wsbRecordNo}</Text>}
             {record.fromContainer && <Text style={detailText}><strong>From Container:</strong> {record.fromContainer}</Text>}
          </Section>

          <Text style={paragraph}>
            Signature files (if provided) are attached to this email. You can also view them via the links below.
          </Text>

          <Section style={linksSection}>
            {record.consignorSignaturePath && (
                <Text style={detailText}><Link href={`${baseUrl}${record.consignorSignaturePath}`} style={link}>View Consignor Signature</Link></Text>
            )}
             {record.driverSignaturePath && (
                <Text style={detailText}><Link href={`${baseUrl}${record.driverSignaturePath}`} style={link}>View Driver Signature</Link></Text>
            )}
          </Section>
          
          <Hr style={hr} />
          <Text style={footer}>
            This is an automated notification from <Link href={baseUrl} style={footerLink}>WineSpace SA</Link>.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default DeliveryRecordNotificationEmail;

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
  fontSize: '28px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  color: '#333',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#484848',
  padding: '0 20px',
  textAlign: 'center' as const,
};

const detailsSection = {
  backgroundColor: '#fafafa',
  border: '1px solid #eaeaea',
  borderRadius: '4px',
  padding: '16px',
  margin: '20px',
};

const linksSection = {
  textAlign: 'center' as const,
  padding: '0 20px',
};

const detailText = {
  margin: '0 0 8px 0',
  fontSize: '14px',
  lineHeight: '1.5',
};

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

const footerLink = {
  color: '#8898aa',
  textDecoration: 'underline',
};

const link = {
  color: '#c52d49',
};
