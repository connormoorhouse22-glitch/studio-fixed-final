
import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Heading,
  Preview,
  Section,
  Text,
  Link,
} from '@react-email/components';

interface FxQuoteRequestEmailProps {
  producerCompany: string;
  producerEmail: string;
  notes?: string;
  fileNames: string[];
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';

export const FxQuoteRequestEmail: React.FC<Readonly<FxQuoteRequestEmailProps>> = ({
  producerCompany,
  producerEmail,
  notes,
  fileNames,
}) => {
  return (
    <Html>
      <Head />
      <Preview>New Forex Quote Request from {producerCompany}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>New Forex Quote Request</Heading>
          
          <Section style={detailsSection}>
            <Text style={detailText}>A new request for a foreign exchange quote has been submitted through the WineSpace portal.</Text>
            <Hr style={hr} />
            <Text style={detailText}><strong>From:</strong> {producerCompany}</Text>
            <Text style={detailText}><strong>Reply-To Email:</strong> <Link href={`mailto:${producerEmail}`}>{producerEmail}</Link></Text>
          </Section>

          {notes && (
            <Section>
              <Heading as="h2" style={subHeading}>
                Producer's Notes
              </Heading>
              <Text style={notesText}>{notes}</Text>
            </Section>
          )}

          <Section>
            <Heading as="h2" style={subHeading}>
              Attached Invoices
            </Heading>
            <Text style={paragraph}>The following {fileNames.length} invoice(s) are attached to this email for quoting:</Text>
            <ul style={list}>
              {fileNames.map((name) => (
                <li key={name} style={listItem}>{name}</li>
              ))}
            </ul>
          </Section>

          <Hr style={hr} />
          <Text style={footer}>
            This is an automated notification from <Link href={baseUrl} style={footerLink}>WineSpace</Link>.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

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
  padding: '0 20px',
};

const detailsSection = {
  padding: '16px 20px',
};

const detailText = {
  margin: '0 0 10px 0',
  fontSize: '14px',
  lineHeight: '1.5',
};

const paragraph = {
  fontSize: '14px',
  lineHeight: '22px',
  color: '#555',
  padding: '0 20px',
};

const notesText = {
  fontSize: '14px',
  lineHeight: '22px',
  color: '#555',
  padding: '12px 20px',
  borderLeft: '4px solid #eee',
  fontStyle: 'italic' as const,
};

const list = {
    paddingLeft: '40px',
};

const listItem = {
    paddingBottom: '8px',
    fontSize: '14px',
    color: '#555',
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

const footerLink = {
    color: '#8898aa',
    textDecoration: 'underline',
}
