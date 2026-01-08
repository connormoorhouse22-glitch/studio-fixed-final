
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, BookDown, Wand2, Package, Trash2, Eye } from 'lucide-react';
import { addMultipleProducts } from '@/lib/product-actions';
import { scrapeCatalog, type ScrapedProduct } from '@/ai/flows/catalog-importer-flow';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Image from 'next/image';
import axios from 'axios';
import type { User } from '@/lib/users';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { generateNavLinks, type NavLink } from '@/lib/navigation-service';

type SubCategoryMap = {
    [supplier: string]: string[];
};

// Correctly builds the sub-category map for all supplier types, handling suppliers in multiple categories
function getSubCategories(navLinks: NavLink[]): SubCategoryMap {
  const subCategoryMap: SubCategoryMap = {};

  const processSupplier = (supplierName: string, categoryLabel: string) => {
    if (!subCategoryMap[supplierName]) {
      subCategoryMap[supplierName] = [];
    }
    // Add the category if it's not a generic 'all' and not already present
    if (categoryLabel && !categoryLabel.toLowerCase().startsWith('all ') && !subCategoryMap[supplierName].includes(categoryLabel)) {
      subCategoryMap[supplierName].push(categoryLabel);
    }
  };

  const traverseLinks = (items: NavLink[], parentCategory?: string) => {
    if (!items) return;

    items.forEach(item => {
      // For Dry Goods, we look for suppliers under categories like 'Bottles', 'Corks', etc.
      if (parentCategory === 'Dry Goods' && item.subItems) {
        item.subItems.forEach(supplierItem => {
          if (supplierItem.subItems) { // This is a supplier with sub-categories
            supplierItem.subItems.forEach(subCat => {
              if (subCat.label === 'All Bottles') return;
              processSupplier(supplierItem.label, subCat.label); // e.g., Ardagh Glass, Bordeaux
            });
          } else { // This is a supplier directly under the category
            processSupplier(supplierItem.label, item.label);
          }
        });
      }
      // For Wine Additions, the suppliers are the top-level items under the main menu
      else if (parentCategory === 'Wine Additions' && item.subItems) {
        item.subItems.forEach(subItem => {
          processSupplier(item.label, subItem.label); // Supplier, Sub-Category (e.g., "Yeast")
        });
      }
      
      // Recurse for deeper menus if needed, passing down the main menu label
      if (item.subItems) {
        const currentParentLabel = ['Dry Goods', 'Wine Additions'].includes(item.label) ? item.label : parentCategory;
        traverseLinks(item.subItems, currentParentLabel);
      }
    });
  };
  
  const productMenus = navLinks.filter(l => l.label === 'Dry Goods' || l.label === 'Wine Additions');
  traverseLinks(productMenus);
  
  return subCategoryMap;
}

const allSuppliers = [
    "Ardagh Glass",
    "ACS",
    "Bottle Traders",
    "Guala Closures",
    "RR Wine Tech",
    "RX South Africa",
    "Label Mountain",
    "Lebone Paarl Labels",
    "MCC",
    "Rotolabel",
    "SA Litho",
    "Sign and Seal",
    "Specsystems",
    "Stellies Label Co",
    "Win-Pak Labels",
    "Enartis",
    "Laffort",
    "Protea Chemicals",
    "Amorim",
    "Cork Supply SA",
    "Diam Corks",
];

export default function CatalogImporterPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [url, setUrl] = useState('');
    const [scrapedProducts, setScrapedProducts] = useState<ScrapedProduct[]>([]);
    const { toast } = useToast();

    const [selectedSupplier, setSelectedSupplier] = useState<string>('');
    const [selectedSubCategory, setSelectedSubCategory] = useState<string>('');
    const [subCategories, setSubCategories] = useState<string[]>([]);
    const [subCategoryMap, setSubCategoryMap] = useState<SubCategoryMap>({});

    const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());

     useEffect(() => {
        async function fetchAndBuildSubCategories() {
            const links = await generateNavLinks();
            const producerNav = links.filter(l => l.role === 'Producer' || l.role === 'Admin' || !l.role);
            const generatedMap = getSubCategories(producerNav);
            setSubCategoryMap(generatedMap);
        }
        fetchAndBuildSubCategories();
    }, []);

    const handleSupplierChange = (supplier: string) => {
        setSelectedSupplier(supplier);
        setSelectedSubCategory('');
        setSubCategories(subCategoryMap[supplier] || []);
    };


    const handleScrape = async () => {
        if (!url.trim()) {
            toast({
                variant: 'destructive',
                title: 'No URL Provided',
                description: 'Please enter the URL of the supplier\'s product page.',
            });
            return;
        }
        if (!selectedSupplier) {
             toast({
                variant: 'destructive',
                title: 'No Supplier Selected',
                description: 'Please select a supplier to associate with these products.',
            });
            return;
        }
        setIsLoading(true);
        setScrapedProducts([]);
        setSelectedProducts(new Set());
        try {
            const response = await axios.get(`/api/scrape?url=${encodeURIComponent(url)}`);
            const htmlContent = response.data.html;

            const result = await scrapeCatalog({ htmlContent, subCategory: selectedSubCategory || undefined });
            
            if (result.products && result.products.length > 0) {
                 const productsWithDetails = result.products.map(p => ({
                    ...p,
                    supplier: selectedSupplier,
                    category: selectedSubCategory || p.category, 
                 }));
                 setScrapedProducts(productsWithDetails);
                 toast({
                    title: 'Scraping Successful',
                    description: `Found ${productsWithDetails.length} products. Please review before importing.`,
                });
            } else {
                 toast({
                    variant: 'destructive',
                    title: 'No Products Found',
                    description: 'The AI could not find any products at the provided URL. Please check the page.',
                });
            }
        } catch (error) {
             toast({
                variant: 'destructive',
                title: 'Scraping Failed',
                description: 'Could not fetch or process the URL. The site may be blocking automated access.',
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleImport = async () => {
        const productsToImport = scrapedProducts.filter(p => selectedProducts.has(p.name));
        
        if (productsToImport.length === 0) {
             toast({
                variant: 'destructive',
                title: 'No Products Selected',
                description: 'Please select one or more products to import.',
            });
            return;
        }
        
        setIsImporting(true);
        try {
            const result = await addMultipleProducts(productsToImport);
            if (result.success) {
                toast({
                    title: 'Import Successful',
                    description: `Successfully imported ${result.importedCount} products for ${selectedSupplier}.`,
                });
                setScrapedProducts([]);
                setSelectedProducts(new Set());
                setUrl('');
            } else {
                throw new Error(result.message || 'An unknown error occurred.');
            }
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Import Failed',
                description: error instanceof Error ? error.message : 'Could not import the products.',
            });
        } finally {
            setIsImporting(false);
        }
    }

    const handleSelectProduct = (productName: string, isSelected: boolean) => {
        const newSelectedProducts = new Set(selectedProducts);
        if (isSelected) {
            newSelectedProducts.add(productName);
        } else {
            newSelectedProducts.delete(productName);
        }
        setSelectedProducts(newSelectedProducts);
    }
    
    const handleSelectAll = (isAllSelected: boolean) => {
        if (isAllSelected) {
            const allProductNames = new Set(scrapedProducts.map(p => p.name));
            setSelectedProducts(allProductNames);
        } else {
            setSelectedProducts(new Set());
        }
    }

    const allSelected = scrapedProducts.length > 0 && selectedProducts.size === scrapedProducts.length;

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Catalog Importer</h2>
                    <p className="text-muted-foreground">
                        Extract and import products from a supplier's product page.
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Step 1: Scrape Products from URL</CardTitle>
                    <CardDescription>
                       Select a supplier, an optional sub-category, and paste the URL of their product page.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                        <Select onValueChange={handleSupplierChange} value={selectedSupplier}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a Supplier..." />
                            </SelectTrigger>
                            <SelectContent>
                                {allSuppliers.sort().map(s => (
                                    <SelectItem key={s} value={s}>
                                        {s}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select onValueChange={setSelectedSubCategory} value={selectedSubCategory} disabled={!selectedSupplier || subCategories.length === 0}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Sub-category (Optional)..." />
                            </SelectTrigger>
                            <SelectContent>
                                {subCategories.sort().map(s => (
                                    <SelectItem key={s} value={s}>
                                        {s}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Input
                            id="url"
                            placeholder="https://supplier.com/products"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="md:col-span-2"
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleScrape} disabled={isLoading} className="whitespace-nowrap">
                        {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Wand2 className="mr-2 h-4 w-4" />
                        )}
                        Extract Products
                    </Button>
                </CardFooter>
            </Card>

             {scrapedProducts.length > 0 && (
                 <Card>
                    <CardHeader>
                        <CardTitle>Step 2: Review and Import Products</CardTitle>
                        <CardDescription>
                            Select the products you wish to import to the <strong>{selectedSupplier}</strong> catalog.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">
                                         <Checkbox
                                            checked={allSelected}
                                            onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                                            aria-label="Select all"
                                        />
                                    </TableHead>
                                    <TableHead className="w-[80px]">Image</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-right">Price</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {scrapedProducts.map((product, index) => (
                                    <TableRow key={`${product.name}-${index}`} data-state={selectedProducts.has(product.name) && "selected"}>
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedProducts.has(product.name)}
                                                onCheckedChange={(checked) => handleSelectProduct(product.name, checked as boolean)}
                                                aria-label={`Select ${product.name}`}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {product.imageUrl && (
                                                <Image 
                                                    src={product.imageUrl} 
                                                    alt={product.name} 
                                                    width={64} 
                                                    height={64} 
                                                    className="rounded-md object-cover"
                                                    onError={(e) => e.currentTarget.style.display = 'none'}
                                                />
                                            )}
                                        </TableCell>
                                        <TableCell className="font-medium">{product.name}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{product.description}</TableCell>
                                        <TableCell className="text-right font-mono">
                                            {product.price ? `ZAR ${product.price.toFixed(2)}` : 'N/A'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                    <CardFooter className="justify-end gap-2">
                        <Button variant="outline" onClick={() => { setScrapedProducts([]); setSelectedProducts(new Set()); }}>
                            <Trash2 className="mr-2 h-4 w-4" /> Clear Results
                        </Button>
                        <Button onClick={handleImport} disabled={isImporting || selectedProducts.size === 0}>
                             {isImporting ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                             ) : (
                                <BookDown className="mr-2 h-4 w-4" />
                             )}
                            Import {selectedProducts.size > 0 ? selectedProducts.size : ''} Product(s)
                        </Button>
                    </CardFooter>
                 </Card>
            )}

            {isLoading && (
                 <Card className="flex flex-col items-center justify-center py-20">
                    <CardHeader className="text-center">
                        <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
                        <CardTitle>AI is Analyzing...</CardTitle>
                        <CardDescription>
                         This may take a moment. Please wait.
                        </CardDescription>
                    </CardHeader>
                </Card>
            )}

             {!isLoading && scrapedProducts.length === 0 && (
                 <Card className="flex flex-col items-center justify-center py-20 border-dashed">
                    <CardHeader className="text-center">
                        <div className="mx-auto bg-secondary rounded-full p-3 w-fit mb-4">
                            <Eye className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <CardTitle>Awaiting Extraction</CardTitle>
                        <CardDescription>
                         Product data extracted from the URL will appear here for your review.
                        </CardDescription>
                    </CardHeader>
                </Card>
            )}
        </div>
    )
}
