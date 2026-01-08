
import * as React from 'react';
import { Body, Container, Head, Hr, Html, Heading, Link, Preview, Section, Text, Img, Row, Column, Font } from '@react-email/components';
import type { SawisReturnEmailProps, Sawis5Row, Sawis7Row, Sawis7OverleafPriceData, Sawis7OverleafContainerData } from '@/lib/email-actions';
import { format } from 'date-fns';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';

const wineColumns = ['Unfortified', 'Fortified', 'Sparkling', 'Concentrate', 'Grape Juice', 'Wine Coolers'] as const;
const pricePointColumns = ['<R24', 'R24-<R32', 'R32-<R40', 'R40-<R48', 'R48-<R56', 'R56-<R64', 'R64-<R72', 'R72-<R80', 'R80-<R96', 'R96-<R120', 'R120-<R160', '>R160'] as const;
const domesticSalesCultivars = [
    {
        category: '1. Still Wine Red',
        items: [
            { name: '1.1 Cabernet Sauvignon', code: '004' }, { name: '1.2 Merlot', code: '017' }, { name: '1.3 Pinotage', code: '021' },
            { name: '1.4 Shiraz', code: '029' }, { name: '1.5 Blends', code: '970' }, { name: '1.6 Other red', code: '997' },
            { name: '1.7 Dry red', code: '971' }, { name: '1.8 Natural sweet', code: '972' }, { name: '1.9 Semi-sweet', code: '973' },
        ]
    },
    {
        category: '2. Still Wine White',
        items: [
            { name: '2.1 Chardonnay', code: '051' }, { name: '2.2 Chenin blanc', code: '030' }, { name: '2.3 Sauvignon blanc', code: '027' },
            { name: '2.4 White Blends', code: '987' }, { name: '2.5 Other white', code: '988' }, { name: '2.6 Dry white', code: '996' },
            { name: '2.7 White Natural sweet', code: '989' }, { name: '2.8 White Semi-sweet', code: '993' },
        ]
    },
    { category: '3. Rosé / Blanc de Noir', items: [ { name: '3.1 Rosé Dry', code: '960' }, { name: '3.2 Rosé Natural Sweet', code: '961' }, { name: '3.3 Rosé Semi-sweet', code: '962' } ] },
    { category: '4. Perlé', items: [ { name: '4.1 White', code: '946' }, { name: '4.2 Red', code: '947' }, { name: '4.3 Rosé', code: '948' } ] },
    { category: '5. Wine Component in other products', items: [ { name: '5.1 Wine component in other products', code: '899' } ] },
    { category: '6. Vonkel / Sparkling', items: [ { name: '6.1 Cap Classique White', code: '950' }, { name: '6.2 Cap Classique Rosé', code: '951' }, { name: '6.3 Cap Classique Red', code: '952' } ] },
    { category: '7. Other Sparkling', items: [ { name: '7.1 White', code: '955' }, { name: '7.2 Rosé', code: '956' }, { name: '7.3 Red', code: '957' } ] },
    { category: '8. Fortified', items: [ { name: '8.1 Fortified', code: '990' } ] }
];

const stillWineSections = [
    { title: "GLAS / GLASS", key: "still_glass", sizes: ['< 750 ml', '750 ml', '1l', '1,5-2l', '4,5l', 'Ander / Other'], keys: ['lt750', '750', '1', '1.5-2', '4.5', 'other']},
    { title: "PLASTIEK / PLASTIC", key: "still_plastic", subHeader: "(< 750ml, 750ml, 1l)", sizes: ['5l', 'Ander / Other'], keys: ['5', 'other'] },
    { title: "TAPVATE / KARTONBOTTEL", key: "still_bagInBox", subHeader: "(750ml, 2l, 3l)", sizes: ['5l', 'Ander / Other'], keys: ['5', 'other'] },
    { title: "PET", key: "still_pet", sizes: ['< 750 ml', '750 ml'], keys: ['lt750', '750'] },
    { title: "FOELIESAKKE / FOIL BAGS", key: "still_foil", sizes: ['2l', '5l', 'Ander / Other'], keys: ['2', '5', 'other'] },
    { title: "KARTONHOUERS / CARTON PACKS", key: "still_carton", subHeader: "(TETRA, COMBI, ELOPAK)", sizes: ['500 ml', '1l', 'Ander / Other'], keys: ['500ml', '1l', 'other'] },
    { title: "BLIKKIES / CANS", key: "still_cans", sizes: ['< 250 ml', '250 ml', '>250 ml'], keys: ['lt250', '250', 'gt250'] },
];

const sparklingWineSections = [
    { title: "GLAS / GLASS", key: "sparkling_glass", sizes: ['Vonkel / Sparkling 375 ml', 'Vonkel / Sparkling 750 ml', 'Ander / Other'], keys: ['375', '750', 'other']},
    { title: "BLIKKIES / CANS", key: "sparkling_cans", sizes: ['< 250 ml', '250 ml', '>250 ml'], keys: ['lt250', '250', 'gt250']},
];


export const SawisReturnNotificationEmail: React.FC<Readonly<SawisReturnEmailProps>> = (props) => {
    const { 
        producer, month, submitterName, submissionDate, sawis5Opening, sawis5Rows, 
        productionTotals, fortificationTotals, additionsTotals, transferInTotals, surplusTotals, allAdditions,
        bulkNonDutyTotals, bulkDutyTotals, packagedNonDutyTotals, packagedDutyTotals, exportTotals, bottlingTotals, transferOutTotals, leesDestroyedTotals, deficiencyTotals, allDisposals,
        closingBalance, overleafPriceData, overleafContainerData 
    } = props;

  return (
    <Html>
      <Head>
        <Font fontFamily="Arial" fallbackFontFamily="sans-serif" />
      </Head>
      <Preview>SAWIS Return for {month} from {producer.company}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <Img src={`${baseUrl}/static/winespace-logo-email.png`} width="180" height="40" alt="WineSpace Logo" style={logo} />
          </Section>
          <Heading style={heading}>SAWIS Monthly Return</Heading>
          <Text style={paragraph}>
            Please find below a summary of the SAWIS monthly return for <strong>{producer.company}</strong> for the month of <strong>{month}</strong>.
            The full return documents are attached as Excel files.
          </Text>
            
          <Section style={detailsSection}>
                <Text style={detailText}><strong>Submitted by:</strong> {submitterName}</Text>
                <Text style={detailText}><strong>Date Submitted:</strong> {submissionDate}</Text>
          </Section>

            <Hr style={hr} />

            {/* SAWIS 5 Summary */}
            <Heading as="h2" style={subHeading}>SAWIS 5 - Monthly Summary (Litres)</Heading>
             <table style={table}>
                <thead>
                    <tr style={{...tableHeadRow, backgroundColor: '#e0e0e0' }}>
                        <th style={{...tableHeadCell, textAlign: 'left', fontWeight: 'bold' }}>PRODUCTIONS AND ADDITIONS</th>
                        {wineColumns.map(col => <th key={col} style={{...tableHeadCell, textAlign: 'right'}}>{col}</th>)}
                    </tr>
                </thead>
                <tbody>
                    <tr style={tableRow}>
                        <td style={tableCell}>Opening Balance</td>
                        {wineColumns.map(col => <td key={col} style={{...tableCell, textAlign: 'right'}}>{(sawis5Opening[col] || 0).toLocaleString()}</td>)}
                    </tr>
                    <tr style={tableRow}><td style={tableCell}>Production</td>{wineColumns.map(col => <td key={col} style={{...tableCell, textAlign: 'right'}}>{(productionTotals[col] || 0).toLocaleString()}</td>)}</tr>
                    <tr style={tableRow}><td style={tableCell}>Fortification</td>{wineColumns.map(col => <td key={col} style={{...tableCell, textAlign: 'right'}}>{(fortificationTotals[col] || 0).toLocaleString()}</td>)}</tr>
                    <tr style={tableRow}><td style={tableCell}>Additions</td>{wineColumns.map(col => <td key={col} style={{...tableCell, textAlign: 'right'}}>{(additionsTotals[col] || 0).toLocaleString()}</td>)}</tr>
                    <tr style={tableRow}><td style={tableCell}>Transfers From</td>{wineColumns.map(col => <td key={col} style={{...tableCell, textAlign: 'right'}}>{(transferInTotals[col] || 0).toLocaleString()}</td>)}</tr>
                    <tr style={tableRow}><td style={tableCell}>Surplus</td>{wineColumns.map(col => <td key={col} style={{...tableCell, textAlign: 'right'}}>{(surplusTotals[col] || 0).toLocaleString()}</td>)}</tr>
                    <tr style={{...tableRow, ...tableFooterRow}}>
                        <td style={{...tableCell, fontWeight: 'bold'}}>Total Productions and Additions</td>
                        {wineColumns.map(col => <td key={col} style={{...tableCell, textAlign: 'right', fontWeight: 'bold'}}>{((sawis5Opening[col] || 0) + (allAdditions[col] || 0)).toLocaleString()}</td>)}
                    </tr>
                </tbody>
             </table>
            
             <table style={{...table, marginTop: '20px'}}>
                <thead>
                    <tr style={{...tableHeadRow, backgroundColor: '#e0e0e0' }}>
                        <th style={{...tableHeadCell, textAlign: 'left', fontWeight: 'bold' }}>DISPOSALS AND UTILIZATIONS</th>
                        {wineColumns.map(col => <th key={col} style={{...tableHeadCell, textAlign: 'right'}}>{col}</th>)}
                    </tr>
                </thead>
                <tbody>
                    <tr style={tableRow}><td style={tableCell}>Bulk - Non duty paid</td>{wineColumns.map(col => <td key={col} style={{...tableCell, textAlign: 'right'}}>{((bulkNonDutyTotals[col] || 0)).toLocaleString()}</td>)}</tr>
                    <tr style={tableRow}><td style={tableCell}>Bulk - Duty paid</td>{wineColumns.map(col => <td key={col} style={{...tableCell, textAlign: 'right'}}>{((bulkDutyTotals[col] || 0)).toLocaleString()}</td>)}</tr>
                    <tr style={tableRow}><td style={tableCell}>Packaged - Non duty paid</td>{wineColumns.map(col => <td key={col} style={{...tableCell, textAlign: 'right'}}>{((packagedNonDutyTotals[col] || 0)).toLocaleString()}</td>)}</tr>
                    <tr style={tableRow}><td style={tableCell}>Packaged - Duty paid</td>{wineColumns.map(col => <td key={col} style={{...tableCell, textAlign: 'right'}}>{((packagedDutyTotals[col] || 0)).toLocaleString()}</td>)}</tr>
                    <tr style={tableRow}><td style={tableCell}>Export</td>{wineColumns.map(col => <td key={col} style={{...tableCell, textAlign: 'right'}}>{((exportTotals[col] || 0)).toLocaleString()}</td>)}</tr>
                    <tr style={tableRow}><td style={tableCell}>Bottling</td>{wineColumns.map(col => <td key={col} style={{...tableCell, textAlign: 'right'}}>{((bottlingTotals[col] || 0)).toLocaleString()}</td>)}</tr>
                    <tr style={tableRow}><td style={tableCell}>Transfers To</td>{wineColumns.map(col => <td key={col} style={{...tableCell, textAlign: 'right'}}>{((transferOutTotals[col] || 0)).toLocaleString()}</td>)}</tr>
                    <tr style={tableRow}><td style={tableCell}>Lees destroyed</td>{wineColumns.map(col => <td key={col} style={{...tableCell, textAlign: 'right'}}>{((leesDestroyedTotals[col] || 0)).toLocaleString()}</td>)}</tr>
                    <tr style={tableRow}><td style={tableCell}>Deficiency</td>{wineColumns.map(col => <td key={col} style={{...tableCell, textAlign: 'right'}}>{((deficiencyTotals[col] || 0)).toLocaleString()}</td>)}</tr>
                    <tr style={{...tableRow, ...tableFooterRow}}>
                        <td style={{...tableCell, fontWeight: 'bold'}}>Total Disposals</td>
                        {wineColumns.map(col => <td key={col} style={{...tableCell, textAlign: 'right', fontWeight: 'bold'}}>{((allDisposals[col] || 0)).toLocaleString()}</td>)}
                    </tr>
                </tbody>
             </table>

             <table style={{...table, marginTop: '20px'}}>
                 <thead>
                    <tr style={{...tableHeadRow, backgroundColor: '#d0d0d0'}}>
                        <th style={{...tableHeadCell, textAlign: 'left', fontWeight: 'bold'}}>Closing Balance</th>
                        {wineColumns.map(col => <th key={col} style={{...tableHeadCell, textAlign: 'right', fontWeight: 'bold'}}>{(closingBalance[col] || 0).toLocaleString()}</th>)}
                    </tr>
                 </thead>
             </table>

            <Hr style={hr} />

            {/* SAWIS 5 Ledger */}
            <Heading as="h2" style={subHeading}>SAWIS 5 - Monthly Ledger</Heading>
             <table style={table}>
                <thead>
                    <tr style={tableHeadRow}>
                        <th style={tableHeadCell}>Date</th>
                        <th style={tableHeadCell}>Inv No.</th>
                        <th style={tableHeadCell}>Transaction</th>
                        <th style={tableHeadCell}>From</th>
                        <th style={tableHeadCell}>To</th>
                        {wineColumns.map(col => <th key={col} style={{...tableHeadCell, textAlign: 'right'}}>{col}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {sawis5Rows.map(row => (
                         <tr key={row.id} style={tableRow}>
                            <td style={tableCell}>{row.date}</td>
                            <td style={tableCell}>{row.invoiceNo}</td>
                            <td style={tableCell}>{row.transactionType}</td>
                            <td style={tableCell}>{row.transferredFrom}</td>
                            <td style={tableCell}>{row.transferredTo}</td>
                            {wineColumns.map(col => <td key={col} style={{...tableCell, textAlign: 'right'}}>{(row[col] || 0).toLocaleString()}</td>)}
                        </tr>
                    ))}
                </tbody>
             </table>
             
              <Hr style={hr} />

             {/* SAWIS 7 Overleaf - Price Points */}
            <Heading as="h2" style={subHeading}>SAWIS 7 Overleaf - Domestic Sales by Price Point (Litres)</Heading>
             <table style={{...table, tableLayout: 'fixed'}}>
                 <thead>
                    <tr style={tableHeadRow}>
                        <th style={{...tableHeadCell, width: '200px'}}>Cultivar</th>
                        {pricePointColumns.map(ppCol => <th key={ppCol} style={{...tableHeadCell, textAlign: 'right', width: '80px'}}>{ppCol}</th>)}
                    </tr>
                </thead>
                 <tbody>
                    {domesticSalesCultivars.map(category => (
                        <React.Fragment key={category.category}>
                            <tr style={tableRow}><td colSpan={13} style={{...tableCell, fontWeight: 'bold', backgroundColor: '#f9f9f9'}}>{category.category}</td></tr>
                            {category.items.map(item => (
                                <tr key={item.code} style={tableRow}>
                                    <td style={tableCell}>{item.name} ({item.code})</td>
                                     {pricePointColumns.map(ppCol => (
                                        <td key={`${item.code}-${ppCol}`} style={{...tableCell, textAlign: 'right'}}>
                                            {(overleafPriceData[item.code]?.[ppCol] || 0).toLocaleString()}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </React.Fragment>
                    ))}
                </tbody>
             </table>

             <Hr style={hr} />
             
            {/* SAWIS 7 Overleaf - Containers */}
            <Heading as="h2" style={subHeading}>SAWIS 7 Overleaf - Domestic Sales by Container (Litres)</Heading>
            <Text style={{...paragraph, textAlign: 'left', fontWeight: 'bold' }}>LITER STILWYN / LITRES STILL WINE</Text>
             <table style={table}>
                <thead>
                    <tr style={tableHeadRow}>
                        <th style={{...tableHeadCell, textAlign: 'left'}}>Container Type</th>
                        <th style={{...tableHeadCell, textAlign: 'right'}}>Total</th>
                        <th style={{...tableHeadCell, textAlign: 'right'}}>&lt; 750 ml</th>
                        <th style={{...tableHeadCell, textAlign: 'right'}}>750 ml</th>
                        <th style={{...tableHeadCell, textAlign: 'right'}}>1l</th>
                        <th style={{...tableHeadCell, textAlign: 'right'}}>1,5-2l</th>
                        <th style={{...tableHeadCell, textAlign: 'right'}}>4,5l</th>
                        <th style={{...tableHeadCell, textAlign: 'right'}}>Other</th>
                    </tr>
                </thead>
                <tbody>
                    {stillWineSections.map(section => {
                         const total = section.keys.reduce((sum, key) => sum + (overleafContainerData[`${section.key}_${key}`] || 0), 0);
                         return (
                            <tr style={tableRow} key={section.key}>
                                <td style={tableCell}>{section.title}</td>
                                <td style={{...tableCell, textAlign: 'right', fontWeight: 'bold'}}>{total.toLocaleString()}</td>
                                {section.sizes.map((size, index) => <td key={size} style={{...tableCell, textAlign: 'right'}}>{(overleafContainerData[`${section.key}_${section.keys[index]}`] || 0).toLocaleString()}</td>)}
                            </tr>
                        )
                    })}
                </tbody>
             </table>
            <Text style={{...paragraph, textAlign: 'left', fontWeight: 'bold', marginTop: '20px' }}>LITER VONKEL / LITRES SPARKLING</Text>
             <table style={table}>
                <thead>
                    <tr style={tableHeadRow}>
                        <th style={{...tableHeadCell, textAlign: 'left'}}>Container Type</th>
                        <th style={{...tableHeadCell, textAlign: 'right'}}>Total</th>
                        <th style={{...tableHeadCell, textAlign: 'right'}}>375 ml</th>
                        <th style={{...tableHeadCell, textAlign: 'right'}}>750 ml</th>
                        <th style={{...tableHeadCell, textAlign: 'right'}}>Other</th>
                    </tr>
                </thead>
                 <tbody>
                    {sparklingWineSections.map(section => {
                        const total = section.keys.reduce((sum, key) => sum + (overleafContainerData[`${section.key}_${key}`] || 0), 0);
                        return (
                            <tr style={tableRow} key={section.key}>
                                <td style={tableCell}>{section.title}</td>
                                <td style={{...tableCell, textAlign: 'right', fontWeight: 'bold'}}>{total.toLocaleString()}</td>
                                {section.keys.map(key => <td key={key} style={{...tableCell, textAlign: 'right'}}>{(overleafContainerData[`${section.key}_${key}`] || 0).toLocaleString()}</td>)}
                            </tr>
                        )
                    })}
                 </tbody>
             </table>
             <Text style={{...paragraph, textAlign: 'left', fontWeight: 'bold', marginTop: '20px' }}>TOTAAL GEFORTIFISEERD / TOTAL FORTIFIED: {(overleafContainerData['fortified_total'] || 0).toLocaleString()} Litres</Text>


          <Hr style={hr} />
          <Text style={footer}>
            This email was generated and sent by the WineSpace platform on behalf of {producer.company}.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default SawisReturnNotificationEmail;

// Styles
const main = { backgroundColor: '#f6f9fc', fontFamily: 'Arial, sans-serif' };
const container = { backgroundColor: '#ffffff', margin: '0 auto', padding: '20px 0 48px', marginBottom: '64px', border: '1px solid #ddd' };
const headerSection = { padding: '24px', borderBottom: '1px solid #e6ebf1' };
const logo = { margin: '0 auto' };
const heading = { fontSize: '24px', fontWeight: 'bold', textAlign: 'center' as const, color: '#333', padding: '0 20px' };
const subHeading = { fontSize: '18px', fontWeight: 'bold', color: '#333', margin: '30px 0 10px' };
const paragraph = { fontSize: '16px', lineHeight: '24px', color: '#484848', padding: '0 20px', textAlign: 'center' as const };
const detailsSection = { backgroundColor: '#fafafa', border: '1px solid #eaeaea', borderRadius: '4px', padding: '16px', margin: '20px' };
const detailText = { margin: '0 0 8px 0', fontSize: '14px', lineHeight: '1.5' };
const hr = { borderColor: '#e6ebf1', margin: '20px 0' };
const footer = { color: '#8898aa', fontSize: '12px', lineHeight: '16px', textAlign: 'center' as const };

const table = {
  width: '100%',
  borderCollapse: 'collapse' as const,
};

const tableHeadRow = {
  backgroundColor: '#f2f2f2',
};

const tableHeadCell = {
  padding: '8px',
  border: '1px solid #ddd',
  fontSize: '12px',
  fontWeight: 'bold',
  color: '#333',
};

const tableRow = {
  borderBottom: '1px solid #ddd',
};

const tableCell = {
  padding: '8px',
  border: '1px solid #ddd',
  fontSize: '14px',
};

const tableFooterRow = {
  backgroundColor: '#f9f9f9',
};
