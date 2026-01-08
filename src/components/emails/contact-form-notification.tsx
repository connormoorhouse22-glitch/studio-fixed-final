
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
} from '@react-email/components';

interface ContactFormNotificationEmailProps {
  name: string;
  fromEmail: string;
  subject: string;
  message: string;
}

export const ContactFormNotificationEmail: React.FC<Readonly<ContactFormNotificationEmailProps>> = ({
  name,
  fromEmail,
  subject,
  message,
}) => {
  return (
    <Html>
      <Head />
      <Preview>New Contact Form Submission: {subject}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>New Message from WineSpace Contact Form</Heading>
          
          <Section style={detailsSection}>
            <Text style={detailText}><strong>From:</strong> {name}</Text>
            <Text style={detailText}><strong>Email:</strong> {fromEmail}</Text>
            <Text style={detailText}><strong>Subject:</strong> {subject}</Text>
          </Section>

          <Hr style={hr} />

          <Section>
            <Heading as="h2" style={subHeading}>
              Message Content
            </Heading>
            <Text style={messageText}>{message}</Text>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            You can reply directly to this email to respond to {name} at {fromEmail}.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default ContactFormNotificationEmail;

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

const detailsSection = {
  padding: '16px',
};

const detailText = {
  margin: '0 0 8px 0',
  fontSize: '14px',
  lineHeight: '1.5',
};

const messageText = {
  fontSize: '14px',
  lineHeight: '22px',
  color: '#555',
  padding: '12px',
  border: '1px solid #eaeaea',
  borderRadius: '4px',
  backgroundColor: '#fafafa',
  whiteSpace: 'pre-wrap' as const,
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
