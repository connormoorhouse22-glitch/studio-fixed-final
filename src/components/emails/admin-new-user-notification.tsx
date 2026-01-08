
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

interface AdminNewUserNotificationEmailProps {
  user: Omit<User, 'id' | 'password'>;
}

export const AdminNewUserNotificationEmail: React.FC<Readonly<AdminNewUserNotificationEmailProps>> = ({ user }) => {
  const usersUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002'}/users`;

  return (
    <Html>
      <Head />
      <Preview>New User Registration: {user.company}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>New User Registration Pending Approval</Heading>
          <Text style={paragraph}>
            A new user has registered on the WineSpace platform and is awaiting your approval.
          </Text>

          <Section style={detailsSection}>
            <Text style={detailText}><strong>Name:</strong> {user.name}</Text>
            <Text style={detailText}><strong>Company:</strong> {user.company}</Text>
            <Text style={detailText}><strong>Email:</strong> <a href={`mailto:${user.email}`} style={link}>{user.email}</a></Text>
            <Text style={detailText}><strong>Role:</strong> {user.role}</Text>
          </Section>

          <Section style={buttonContainer}>
            <Button style={button} href={usersUrl}>
              Approve User
            </Button>
          </Section>

          <Text style={paragraph}>
            Please visit the User Management page in your admin dashboard to review and approve this new account.
          </Text>

          <Hr style={hr} />
          <Text style={footer}>
            This is an automated notification from WineSpace SA.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default AdminNewUserNotificationEmail;

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

const link = {
  color: '#c52d49',
}
