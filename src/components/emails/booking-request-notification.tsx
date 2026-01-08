
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
import type { Booking, WorkOrder } from '@/lib/booking-actions';

interface BookingRequestNotificationEmailProps {
  booking: Booking;
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';

export const BookingRequestNotificationEmail: React.FC<Readonly<BookingRequestNotificationEmailProps>> = ({ booking }) => {
  const calendarUrl = `${baseUrl}/bookings/calendar`;

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
      <Preview>New Booking Request from {booking.producerCompany}</Preview>
      <Body style={main}>
        <Container style={container}>
           <Section style={headerSection}>
            <Img src={`${baseUrl}/static/winespace-logo-email.png`} width="180" height="40" alt="WineSpace Logo" style={logo} />
           </Section>
          <Heading style={heading}>New Booking Request</Heading>
          <Text style={paragraph}>
            You have received a new booking request from <strong>{booking.producerCompany}</strong>. Please review the details below and manage the request in your supplier portal.
          </Text>

           <Section style={orderInfoSection}>
            <Row>
              <Column style={orderInfoColumn}>
                <Text style={orderInfoLabel}>REQUESTED DATE</Text>
                <Text style={orderInfoValue}>{formattedDate}</Text>
              </Column>
              <Column style={orderInfoColumn}>
                 <Text style={orderInfoLabel}>SERVICE</Text>
                 <Text style={orderInfoValue}>{booking.workOrders[0].service}</Text>
              </Column>
            </Row>
             <Row style={{ paddingTop: '10px' }}>
                 <Column style={orderInfoColumn}>
                    <Text style={orderInfoLabel}>FROM</Text>
                    <Text style={orderInfoValue}>{booking.producerCompany}</Text>
                    <Link href={`mailto:${booking.producerEmail}`} style={orderInfoLink}>{booking.producerEmail}</Link>
                </Column>
            </Row>
           </Section>


            {booking.workOrders.map((workOrder, index) => (
                <Section key={index}>
                    <Heading as="h2" style={subHeading}>
                    Work Order #{index + 1}
                    </Heading>
                    <table style={table}>
                    <tbody style={tableBody}>
                        <tr style={tableRow}><td style={tableCellKey}>Cultivar</td><td style={tableCellValue}>{workOrder.cultivar}</td></tr>
                        <tr style={tableRow}><td style={tableCellKey}>Vintage</td><td style={tableCellValue}>{workOrder.vintage}</td></tr>
                        <tr style={tableRow}><td style={tableCellKey}>Volume</td><td style={tableCellValue}>{workOrder.volumeLiters.toLocaleString()} Litres</td></tr>
                        {workOrder.filtrationType && (
                            <tr style={tableRow}><td style={tableCellKey}>Filtration</td><td style={tableCellValue}>{workOrder.filtrationType}</td></tr>
                        )}
                        <tr style={tableRow}><td style={tableCellKey}>Bottle Type</td><td style={tableCellValue}>{workOrder.bottleType}</td></tr>
                        <tr style={tableRow}><td style={tableCellKey}>Closure Type</td><td style={tableCellValue}>{workOrder.closureType}</td></tr>
                        {workOrder.specialInstructions && (
                            <tr style={tableRow}><td style={tableCellKey}>Special Instructions</td><td style={tableCellValue}>{workOrder.specialInstructions}</td></tr>
                        )}
                    </tbody>
                    </table>
                </Section>
            ))}
            
             <Section>
                <Heading as="h2" style={subHeading}>
                    Contact Details
                </Heading>
                 <table style={table}>
                    <tbody style={tableBody}>
                        <tr style={tableRow}><td style={tableCellKey}>Contact Person</td><td style={tableCellValue}>{booking.workOrders[0].contactPerson}</td></tr>
                        <tr style={tableRow}><td style={tableCellKey}>Contact Number</td><td style={tableCellValue}>{booking.workOrders[0].contactNumber}</td></tr>
                        <tr style={tableRow}><td style={tableCellKey}>Location</td><td style={tableCellValue}>{booking.workOrders[0].location}</td></tr>
                    </tbody>
                 </table>
            </Section>


          <Section style={buttonContainer}>
            <Button style={button} href={calendarUrl}>
              Manage Your Bookings
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

export default BookingRequestNotificationEmail;

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

const subHeading = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#333',
  padding: '0 20px',
  marginTop: '30px',
};


const paragraph = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#484848',
  padding: '0 20px',
  textAlign: 'center' as const,
  maxWidth: '500px',
  margin: '10px auto',
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
const orderInfoLink = {
    color: '#c52d49',
    fontSize: '14px',
    lineHeight: '1.5',
    textDecoration: 'none',
}


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

const table = {
  width: '100%',
  borderCollapse: 'collapse' as const,
  marginTop: '20px',
  padding: '0 20px',
};

const tableBody = {
   border: '1px solid #e6ebf1',
   borderRadius: '4px',
}

const tableRow = {
    borderBottom: '1px solid #e6ebf1',
}

const tableCellKey = {
  padding: '10px',
  verticalAlign: 'top',
  fontSize: '14px',
  fontWeight: 'bold' as const,
  width: '150px'
};

const tableCellValue = {
  padding: '10px',
  verticalAlign: 'top',
  fontSize: '14px',
  color: '#555',
};
