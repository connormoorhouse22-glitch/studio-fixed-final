
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
  Img,
  Row,
  Column,
} from '@react-email/components';
import type { Booking } from '@/lib/booking-actions';

interface BookingStatusUpdateEmailProps {
  booking: Booking;
  status: 'confirmed' | 'rejected';
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';

export const BookingStatusUpdateEmail: React.FC<Readonly<BookingStatusUpdateEmailProps>> = ({ booking, status }) => {
  const isConfirmed = status === 'confirmed';
  const providerCalendarUrl = `${baseUrl}/services/book/${encodeURIComponent(booking.providerCompany)}?service=${encodeURIComponent(booking.workOrders[0].service)}`;

  const previewText = isConfirmed
    ? `Your booking with ${booking.providerCompany} is confirmed!`
    : `An update on your booking request with ${booking.providerCompany}`;

  const headingText = isConfirmed ? 'Booking Confirmed!' : 'Booking Request Update';
  
  const mainParagraph = isConfirmed
    ? `Good news! Your booking request for <strong>${booking.workOrders[0].service}</strong> with <strong>${booking.providerCompany}</strong> has been confirmed for the date below.`
    : `Unfortunately, <strong>${booking.providerCompany}</strong> was unable to accept your booking request for <strong>${booking.workOrders[0].service}</strong> on the requested date.`;

  const closingText = isConfirmed
    ? `You can view your booking details on the provider's calendar page. If you have any questions, please contact ${booking.providerCompany} directly.`
    : `We apologize for any inconvenience. Please feel free to visit their calendar to select another available date.`;

  // Add 1 day to the booking date to counteract timezone issues
  const adjustedDate = new Date(booking.date);
  adjustedDate.setDate(adjustedDate.getDate() + 1);
  const formattedDate = adjustedDate.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
           <Section style={headerSection}>
            <Img src={`${baseUrl}/static/winespace-logo-email.png`} width="180" height="40" alt="WineSpace Logo" style={logo} />
           </Section>
          <Heading style={heading}>{headingText}</Heading>
          <Text style={paragraph} dangerouslySetInnerHTML={{ __html: mainParagraph }} />

           <Section style={orderInfoSection}>
            <Row>
              <Column style={orderInfoColumn}>
                <Text style={orderInfoLabel}>PROVIDER</Text>
                <Text style={orderInfoValue}>{booking.providerCompany}</Text>
              </Column>
              <Column style={orderInfoColumn}>
                 <Text style={orderInfoLabel}>DATE</Text>
                 <Text style={orderInfoValue}>{formattedDate}</Text>
              </Column>
            </Row>
           </Section>

            <Text style={paragraph}>{closingText}</Text>
            
          <Section style={buttonContainer}>
            <Button style={button} href={providerCalendarUrl}>
              View {booking.providerCompany}'s Calendar
            </Button>
          </Section>
          
          <Hr style={hr} />
          <Text style={footer}>
            This is an automated notification from <Link href={baseUrl} style={footerLink}>WineSpace</Link>.
          </Text>
           <Text style={footer}>WineSpace SA (Pty) Ltd. | Stellenbosch, South Africa</Text>
        </Container>
      </Body>
    </Html>
  );
};

export default BookingStatusUpdateEmail;

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
};

const headerSection = {
    padding: '24px',
    borderBottom: '1px solid #e6ebf1',
}

const logo = {
    margin: '0 auto',
};

const heading = {
  fontSize: '24px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  color: '#333',
  padding: '0 20px',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#484848',
  padding: '0 20px',
  textAlign: 'center' as const,
  maxWidth: '500px',
  margin: '20px auto',
};

const orderInfoSection = {
  backgroundColor: '#fafafa',
  padding: '20px',
  margin: '20px 0',
};

const orderInfoColumn = {
    padding: '0 10px',
    width: '50%',
}

const orderInfoLabel = {
  margin: '0 0 4px 0',
  fontSize: '10px',
  fontWeight: 'bold' as const,
  lineHeight: '1.5',
  color: '#8898aa',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
};
const orderInfoValue = {
  margin: '0',
  fontSize: '14px',
  lineHeight: '1.5',
  fontWeight: '500' as const,
};

const buttonContainer = {
  textAlign: 'center' as const,
  marginTop: '32px',
};

const button = {
  backgroundColor: '#c52d49',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold' as const,
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 28px',
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
