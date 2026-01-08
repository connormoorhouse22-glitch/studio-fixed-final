import type { Sawis5Row, Sawis7Row } from '@/app/(app)/sawis/returns/form';

const wineColumns = ['Unfortified', 'Fortified', 'Sparkling', 'Concentrate', 'Grape Juice', 'Wine Coolers'] as const;

export const calculateTotalsByTransactionType = (rows: Sawis5Row[], types: string[]): Sawis7Row => {
    const totals: Sawis7Row = {};
    for (const col of wineColumns) {
        totals[col] = rows
            .filter(row => types.includes(row.transactionType))
            .reduce((sum, row) => sum + (Number(row[col]) || 0), 0);
    }
    return totals;
};

export const domesticSalesCultivars = [
    {
        category: '1. Still Wine Red',
        items: [
            { name: '1.1 Cabernet Sauvignon', code: '004' },
            { name: '1.2 Merlot', code: '017' },
            { name: '1.3 Pinotage', code: '021' },
            { name: '1.4 Shiraz', code: '029' },
            { name: '1.5 Blends', code: '970' },
            { name: '1.6 Other red', code: '997' },
            { name: '1.7 Dry red', code: '971' },
            { name: '1.8 Natural sweet', code: '972' },
            { name: '1.9 Semi-sweet', code: '973' },
        ]
    },
    {
        category: '2. Still Wine White',
        items: [
            { name: '2.1 Chardonnay', code: '051' },
            { name: '2.2 Chenin blanc', code: '030' },
            { name: '2.3 Sauvignon blanc', code: '027' },
            { name: '2.4 White Blends', code: '987' },
            { name: '2.5 Other white', code: '988' },
            { name: '2.6 Dry white', code: '996' },
            { name: '2.7 White Natural sweet', code: '989' },
            { name: '2.8 White Semi-sweet', code: '993' },
        ]
    },
    {
        category: '3. Rosé / Blanc de Noir',
        items: [
            { name: '3.1 Rosé Dry', code: '960' },
            { name: '3.2 Rosé Natural Sweet', code: '961' },
            { name: '3.3 Rosé Semi-sweet', code: '962' },
        ]
    },
    {
        category: '4. Perlé',
        items: [
            { name: '4.1 White', code: '946' },
            { name: '4.2 Red', code: '947' },
            { name: '4.3 Rosé', code: '948' },
        ]
    },
    {
        category: '5. Wine Component in other products',
        items: [
            { name: '5.1 Wine component in other products', code: '899' },
        ]
    },
    {
        category: '6. Vonkel / Sparkling',
        items: [
            { name: '6.1 Cap Classique White', code: '950' },
            { name: '6.2 Cap Classique Rosé', code: '951' },
            { name: '6.3 Cap Classique Red', code: '952' },
        ]
    },
    {
        category: '7. Other Sparkling',
        items: [
            { name: '7.1 White', code: '955' },
            { name: '7.2 Rosé', code: '956' },
            { name: '7.3 Red', code: '957' },
        ]
    },
    {
        category: '8. Fortified',
        items: [
            { name: '8.1 Fortified', code: '990' },
        ]
    }
];
