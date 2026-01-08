
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
import type { Order } from '@/lib/order-actions';
import { format } from 'date-fns';
import type { Product } from '@/lib/product-actions';

// The OrderItem now includes optional product details
type EnrichedOrderItem = Order['items'][0] & Partial<Pick<Product, 'category' | 'unitsPerPallet' | 'subCategory'>>;

interface SupplierOrderNotificationEmailProps {
  order: Omit<Order, 'items'> & { items: EnrichedOrderItem[] };
}

// Helper to render packaging unit info
const renderPackagingInfo = (item: EnrichedOrderItem) => {
    if (!item.quantity) return null;

    const category = item.category?.toLowerCase() || '';
    const subCategory = item.subCategory?.toLowerCase() || '';
    const isBottle = category.includes('bottle') || category.includes('bordeaux') || category.includes('burgundy') || category.includes('flute') || category.includes('hock') || subCategory.includes('bottle') || subCategory.includes('bordeaux') || subCategory.includes('burgundy');
    const isScrewcap = category.includes('screwcap');
    const isCork = category.includes('cork');
    
    let info = null;

    if (isBottle && item.unitsPerPallet && item.unitsPerPallet > 0) {
        const pallets = item.quantity / item.unitsPerPallet;
        info = `${pallets} pallet${pallets > 1 ? 's' : ''}`;
    } else if (isScrewcap || isCork) {
        const boxes = item.quantity / 1000;
        info = `${boxes} box${boxes > 1 ? 'es' : ''}`;
    }

    if (info) {
        return (
            <div style={{ fontSize: '12px', color: '#666', paddingTop: '4px' }}>
                ({info})
            </div>
        );
    }
    return null;
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';

export const SupplierOrderNotificationEmail: React.FC<Readonly<SupplierOrderNotificationEmailProps>> = ({ order }) => {
  const orderUrl = `${baseUrl}/orders/${order.id}`;
  const isQuoteRequest = order.status === 'Quote Request';
  const title = isQuoteRequest ? 'New Quote Request' : 'New Order Notification';
  const previewText = isQuoteRequest ? `You have a new quote request from ${order.producerCompany}` : `You have a new order from ${order.producerCompany} on WineSpace.`;
  const mainParagraph = isQuoteRequest 
    ? `You have received a new quote request from <strong>${order.producerCompany}</strong>. Please review the details below and provide a quote via your supplier portal.`
    : `You have received a new order from <strong>${order.producerCompany}</strong>. Please review the details below and update the order status in your supplier portal.`;
  const buttonText = isQuoteRequest ? 'View Quote Request' : 'View Full Order & Print PDF';


  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
           <Section style={headerSection}>
            <Img src={`${baseUrl}/static/winespace-logo-email.png`} width="180" height="40" alt="WineSpace Logo" style={logo} />
           </Section>
          <Heading style={heading}>{title}</Heading>
          <Text style={paragraph} dangerouslySetInnerHTML={{ __html: mainParagraph }} />

           <Section style={orderInfoSection}>
            <Row>
              <Column style={orderInfoColumn}>
                <Text style={orderInfoLabel}>ORDER #</Text>
                <Text style={orderInfoValue}>{order.orderNumber}</Text>
              </Column>
              <Column style={orderInfoColumn}>
                <Text style={orderInfoLabel}>DATE</Text>
                <Text style={orderInfoValue}>{format(new Date(order.createdAt), 'dd MMM yyyy')}</Text>
              </Column>
            </Row>
            <Row>
                 <Column style={orderInfoColumn}>
                    <Text style={orderInfoLabel}>CUSTOMER</Text>
                    <Text style={orderInfoValue}>{order.producerCompany}</Text>
                    <Link href={`mailto:${order.producerEmail}`} style={orderInfoLink}>{order.producerEmail}</Link>
                </Column>
                {!isQuoteRequest && (
                    <Column style={orderInfoColumn}>
                        <Text style={orderInfoLabel}>ORDER TOTAL</Text>
                        <Text style={{...orderInfoValue, color: '#c52d49' }}>ZAR {order.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                    </Column>
                )}
            </Row>
            {order.attachment && (
                 <Row>
                    <Column style={{...orderInfoColumn, paddingTop: '10px'}}>
                        <Text style={orderInfoLabel}>ATTACHMENT</Text>
                        <Text style={orderInfoValue}>Artwork/dieline file is attached to this email.</Text>
                    </Column>
                </Row>
            )}
           </Section>


          <Section>
            <Heading as="h2" style={subHeading}>
              {isQuoteRequest ? 'Requested Item' : 'Order Summary'}
            </Heading>
            <table style={table}>
              <thead style={tableHead}>
                <tr>
                  <th style={tableHeadCell}>ITEM</th>
                  <th style={tableHeadCell} align="center">QTY (UNITS)</th>
                  {!isQuoteRequest && <th style={tableHeadCell} align="right">UNIT PRICE</th>}
                  {!isQuoteRequest && <th style={tableHeadCell} align="right">TOTAL</th>}
                </tr>
              </thead>
              <tbody style={tableBody}>
                {order.items.map((item) => (
                  <tr key={item.id} style={tableRow}>
                    <td style={tableCell}>{item.name}</td>
                    <td style={{...tableCell, textAlign: 'center'}}>
                        {item.quantity.toLocaleString('en-US')}
                        {renderPackagingInfo(item)}
                    </td>
                    {!isQuoteRequest && <td style={{...tableCell, textAlign: 'right'}}>ZAR {item.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>}
                    {!isQuoteRequest && <td style={{...tableCell, textAlign: 'right'}}><strong>ZAR {(item.price * item.quantity).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></td>}
                  </tr>
                ))}
              </tbody>
                 {!isQuoteRequest && (
                    <tfoot style={tableFooter}>
                        <tr>
                            <td colSpan={3} style={{ ...tableCell, textAlign: 'right', fontWeight: 'bold', paddingTop: '20px' }}>ORDER TOTAL</td>
                            <td style={{ ...tableCell, textAlign: 'right', fontWeight: 'bold', color: '#c52d49', paddingTop: '20px', fontSize: '18px' }}>ZAR {order.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        </tr>
                    </tfoot>
                )}
            </table>
          </Section>

          <Section style={buttonContainer}>
            <Button style={button} href={orderUrl}>
              {buttonText}
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

export default SupplierOrderNotificationEmail;

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

const tableHead = {
  borderBottom: '2px solid #e6ebf1',
};

const tableBody = {
   borderBottom: '1px solid #e6ebf1',
}

const tableFooter = {
    borderTop: '2px solid #e6ebf1',
}

const tableHeadCell = {
  padding: '12px',
  textAlign: 'left' as const,
  fontWeight: 'bold' as const,
  color: '#8898aa',
  textTransform: 'uppercase' as const,
  fontSize: '10px',
  letterSpacing: '0.5px',
};

const tableRow = {
    borderBottom: '1px solid #e6ebf1',
}

const tableCell = {
  padding: '12px',
  verticalAlign: 'top',
  fontSize: '14px',
};

    
