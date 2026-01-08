
'use server';

import { revalidatePath } from 'next/cache';

export async function handleProductUpdate() {
  revalidatePath('/products/manage');
}
