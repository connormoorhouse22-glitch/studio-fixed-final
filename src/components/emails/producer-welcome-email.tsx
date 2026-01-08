
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
import type { User } from '@/lib/users';

interface ProducerWelcomeEmailProps {
  user: User;
}

export const ProducerWelcomeEmail: React.FC<Readonly<ProducerWelcomeEmailProps>> = ({ user }) => {
  const loginUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002'}/login/producer`;

  return (
    <Html>
      <Head />
      <Preview>Welcome to WineSpace SA - Your Account is Approved!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Welcome to WineSpace SA!</Heading>
          <Text style={paragraph}>
            Hi {user.name},
          </Text>
          <Text style={paragraph}>
            We are thrilled to have you join our network. Your account for <strong>{user.company}</strong> has been approved by our administrators, and you can now access the Producer Portal.
          </Text>
          <Text style={paragraph}>
            WineSpace SA is designed to streamline your procurement process, connecting you with South Africa’s leading suppliers for everything from bottles and corks to labels and cartons. You can now browse supplier catalogues, manage your orders, and even build out your final product costs using our Bill of Materials feature.
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={loginUrl}>
              Access Your Producer Portal
            </Button>
          </Section>

          <Text style={paragraph}>
            If you have any questions as you get started, please don't hesitate to reach out to our support team by replying to this email.
          </Text>
          <Text style={paragraph}>
            Best regards,
            <br />
            The WineSpace SA Team
          </Text>

          <Hr style={hr} />
          <Text style={footer}>
            This is an automated notification from <Link href={process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002'} style={footerLink}>WineSpace SA</Link>.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default ProducerWelcomeEmail;

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
}
