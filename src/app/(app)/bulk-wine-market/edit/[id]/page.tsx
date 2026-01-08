
'use server';

import { notFound } from 'next/navigation';
import { getBulkWineListingById } from '@/lib/bulk-wine-actions';
import { BulkWineListingForm } from '../../form';

export default async function EditBulkWineListingPage({ params }: { params: { id: string } }) {
  const listing = await getBulkWineListingById(params.id);

  if (!listing) {
    notFound();
  }

  return <BulkWineListingForm listing={listing} />;
}
