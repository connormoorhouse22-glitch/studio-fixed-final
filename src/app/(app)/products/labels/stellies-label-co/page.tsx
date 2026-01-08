
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// This is a temporary redirect to the requirements page.
export default function StelliesLabelCoPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/products/labels/stellies-label-co/requirements');
  }, [router]);

  return null;
}
