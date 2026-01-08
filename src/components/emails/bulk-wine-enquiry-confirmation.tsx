
import * as React from 'react';
import {
  Body,
  Button,
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
import type { BulkWineListing } from '@/lib/bulk-wine-actions';

interface BulkWineEnquiryConfirmationEmailProps {
  listing: BulkWineListing;
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';
const marketUrl = `${baseUrl}/bulk-wine-market`;

export const BulkWineEnquiryConfirmationEmail: React.FC<Readonly<BulkWineEnquiryConfirmationEmailProps>> = ({ listing }) => {
  return (
    <Html>
      <Head />
      <Preview>Your Bulk Wine Enquiry has been received</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Enquiry Received!</Heading>
          <Text style={paragraph}>
            Thank you for your interest. We have received your enquiry regarding the following bulk wine listing and will be in touch shortly.
          </Text>

          <Section style={detailsSection}>
            <Text style={detailText}><strong>Listing:</strong> {listing.vintage} {listing.cultivar}</Text>
            <Text style={detailText}><strong>Producer:</strong> {listing.producer}</Text>
            <Text style={detailText}><strong>Region:</strong> {listing.region}</Text>
            <Text style={detailText}><strong>Litres:</strong> {listing.litres.toLocaleString()} L</Text>
            <Text style={detailText}><strong>Price:</strong> ZAR {listing.pricePerLitre.toFixed(2)} / Litre</Text>
          </Section>

          <Section style={buttonContainer}>
            <Button style={button} href={marketUrl}>
              Return to Bulk Wine Market
            </Button>
          </Section>

          <Text style={paragraph}>
            If you have any urgent questions, you can contact us directly at <Link href="mailto:bulkwine@winespace.co.za" style={link}>bulkwine@winespace.co.za</Link>.
          </Text>

          <Hr style={hr} />
          <Text style={footer}>
            This is an automated notification from <Link href={baseUrl} style={footerLink}>WineSpace SA</Link>.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default BulkWineEnquiryConfirmationEmail;

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

const detailText = {
  margin: '0 0 8px 0',
  fontSize: '14px',
  lineHeight: '1.5',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#c52d49',
  borderRadius: '3px',
  color: '#fff',
  fontSize: '16px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
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
}
