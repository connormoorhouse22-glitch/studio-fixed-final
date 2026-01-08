

import Image from 'next/image';
import Link from 'next/link';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getProducts } from '@/lib/product-actions';

// Statically define the primary suppliers to ensure order and content
const primarySuppliers = [
    {
      name: 'Label Mountain',
      description: 'High-quality, custom label printing with a focus on innovative materials and finishes.',
      href: '/products/labels/label-mountain',
      image: 'https://picsum.photos/seed/lm/600/400',
      aiHint: 'label printing press',
    },
    {
      name: 'Lebone Paarl Labels',
      description: 'A leading provider of self-adhesive labels, offering solutions for various market sectors.',
      href: '/products/labels/lebone-paarl-labels',
      image: 'https://picsum.photos/seed/lpl/600/400',
      aiHint: 'roll of labels',
    },
    {
      name: 'MCC',
      description: 'Global leader in premium label solutions. Submit your requirements for a custom quote.',
      href: '/products/labels/mcc/requirements',
      image: 'https://picsum.photos/seed/mcc/600/400',
      aiHint: 'modern office building',
    },
     {
      name: 'Rotolabel',
      description: 'Specializing in flexographic and digital printing for pressure-sensitive labels.',
      href: '/products/labels/rotolabel',
      image: 'https://picsum.photos/seed/rl/600/400',
      aiHint: 'printing machinery',
    },
    {
      name: 'SA Litho',
      description: 'Comprehensive label and packaging solutions, from design to final product.',
      href: '/products/labels/sa-litho',
      image: 'https://picsum.photos/seed/sal/600/400',
      aiHint: 'colorful ink',
    },
    {
      name: 'Sign and Seal',
      description: 'Providers of quality seals and labels to ensure product integrity and brand recognition.',
      href: '/products/labels/sign-and-seal',
      image: 'https://picsum.photos/seed/ss/600/400',
      aiHint: 'wax seal stamp',
    },
    {
      name: 'Specsystems',
      description: 'Experts in coding and marking, offering a range of labeling and identification systems.',
      href: '/products/labels/specsystems',
      image: 'https://picsum.photos/seed/spec/600/400',
      aiHint: 'barcode scanner',
    },
    {
        name: 'Stellies Label Co',
        description: 'Boutique label design and printing studio. Submit your requirements for a custom quote.',
        href: '/products/labels/stellies-label-co/requirements',
        image: 'https://picsum.photos/seed/slc/600/400',
        aiHint: 'design studio',
    },
    {
      name: 'Win-Pak Labels',
      description: 'Delivering innovative and sustainable labeling solutions for the wine and beverage industry.',
      href: '/products/labels/win-pak-labels',
      image: 'https://picsum.photos/seed/wp/600/400',
      aiHint: 'eco-friendly packaging',
    },
];


export default async function AllLabelsPage() {
  const products = await getProducts();
  const suppliersWithProducts = new Set(products.filter(p => p.category.toLowerCase() === 'labels').map(p => p.supplier));
  // Add MCC and Stellies Label Co manually as they don't have standard products
  suppliersWithProducts.add('MCC');
  suppliersWithProducts.add('Stellies Label Co');
  
  // Filter the primary list to only show suppliers that have products or are quote-based
  const suppliers = primarySuppliers.filter(s => suppliersWithProducts.has(s.name));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">All Label Suppliers</h2>
        <p className="text-muted-foreground">Browse label catalogues from our trusted partners.</p>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {suppliers.map((supplier) => (
          <Card key={supplier.name} className="flex flex-col">
             <CardHeader className="p-0">
                <Image
                    alt={supplier.name}
                    className="rounded-t-lg object-cover"
                    height={400}
                    src={supplier.image}
                    width={600}
                    data-ai-hint={supplier.aiHint}
                />
            </CardHeader>
            <CardContent className="flex-1 p-4">
                <CardTitle className="text-lg font-semibold !font-body">{supplier.name}</CardTitle>
                <CardDescription className="mt-2 text-sm">{supplier.description}</CardDescription>
            </CardContent>
            <CardContent>
                <Link href={supplier.href}>
                    <Button className="w-full">{supplier.href.includes('requirements') ? 'Request a Quote' : 'View Catalogue'}</Button>
                </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
