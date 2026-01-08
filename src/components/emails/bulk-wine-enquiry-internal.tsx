
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
import type { BulkWineListing } from '@/lib/bulk-wine-actions';
import type { User } from '@/lib/users';

interface BulkWineEnquiryInternalEmailProps {
  listing: BulkWineListing;
  enquirer: User;
}

export const BulkWineEnquiryInternalEmail: React.FC<Readonly<BulkWineEnquiryInternalEmailProps>> = ({
  listing,
  enquirer,
}) => {
  return (
    <Html>
      <Head />
      <Preview>New Bulk Wine Enquiry from {enquirer.company}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>New Bulk Wine Enquiry</Heading>
          
          <Section style={section}>
            <Heading as="h2" style={subHeading}>Enquirer Details</Heading>
            <Text style={detailText}><strong>Company:</strong> {enquirer.company}</Text>
            <Text style={detailText}><strong>Name:</strong> {enquirer.name}</Text>
            <Text style={detailText}><strong>Email:</strong> <Link href={`mailto:${enquirer.email}`}>{enquirer.email}</Link></Text>
            <Text style={detailText}><strong>Phone:</strong> {enquirer.contactNumber || 'Not provided'}</Text>
          </Section>

          <Hr style={hr} />

          <Section style={section}>
            <Heading as="h2" style={subHeading}>Listing Details</Heading>
            <Text style={detailText}><strong>Listing ID:</strong> {listing.id}</Text>
            <Text style={detailText}><strong>Wine:</strong> {listing.vintage} {listing.cultivar}</Text>
            <Text style={detailText}><strong>Producer:</strong> {listing.producer}</Text>
            <Text style={detailText}><strong>Litres:</strong> {listing.litres.toLocaleString()} L</Text>
            <Text style={detailText}><strong>Price:</strong> ZAR {listing.pricePerLitre.toFixed(2)} / Litre</Text>
            <Text style={detailText}><strong>Region:</strong> {listing.region}</Text>
            <Text style={detailText}><strong>IPW:</strong> {listing.ipw} | <strong>WIETA:</strong> {listing.wieta}</Text>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            This is an automated notification from the WineSpace Bulk Wine Market. Please follow up with the enquirer.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default BulkWineEnquiryInternalEmail;

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

const section = {
  padding: '0 20px',
};

const detailText = {
  margin: '0 0 10px 0',
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
