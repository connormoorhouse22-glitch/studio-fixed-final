
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

interface LabelSubmissionNotificationEmailProps {
  frontQuantity: string;
  backQuantity: string;
  notes: string;
  finishes: string;
  fromEmail: string;
  fromCompany: string;
}

export const LabelSubmissionNotificationEmail: React.FC<Readonly<LabelSubmissionNotificationEmailProps>> = ({
  frontQuantity,
  backQuantity,
  notes,
  finishes,
  fromEmail,
  fromCompany,
}) => {
  return (
    <Html>
      <Head />
      <Preview>New Label Production Request from {fromCompany}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>New Label Production Request</Heading>
          <Text style={paragraph}>
            You have received a new request for label production. Please see the details below and the attached artwork file.
          </Text>

          <Section style={detailsSection}>
            <Text style={detailText}>
              <strong>From:</strong> {fromCompany} ({fromEmail})
            </Text>
            <Text style={detailText}>
              <strong>Front Labels Required:</strong> {Number(frontQuantity).toLocaleString('en-US')} labels
            </Text>
            {backQuantity && (
              <Text style={detailText}>
                <strong>Back Labels Required:</strong> {Number(backQuantity).toLocaleString('en-US')} labels
              </Text>
            )}
          </Section>

          {finishes && (
             <Section>
              <Heading as="h2" style={subHeading}>
                Finishes & Embellishments
              </Heading>
              <Text style={notesText}>{finishes}</Text>
            </Section>
          )}

          {notes && (
            <Section>
              <Heading as="h2" style={subHeading}>
                Additional Notes
              </Heading>
              <Text style={notesText}>{notes}</Text>
            </Section>
          )}

          <Hr style={hr} />
          <Text style={paragraph}>
            Please reply to the sender at {fromEmail} to confirm receipt and provide a quote or further instructions.
          </Text>
          <Hr style={hr} />
          <Text style={footer}>
            This is an automated notification from <Link href={process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002'} style={footerLink}>WineSpace</Link>.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default LabelSubmissionNotificationEmail;

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

const subHeading = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#333',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#484848',
};

const detailsSection = {
  backgroundColor: '#fafafa',
  border: '1px solid #eaeaea',
  borderRadius: '4px',
  padding: '16px',
  margin: '20px 0',
};

const detailText = {
  margin: '0 0 8px 0',
  fontSize: '14px',
  lineHeight: '1.5',
};

const notesText = {
  fontSize: '14px',
  lineHeight: '22px',
  color: '#555',
  paddingLeft: '12px',
  borderLeft: '4px solid #eee',
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
};
