'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ServicesPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the new booking page
    router.replace('/book');
  }, [router]);
  
  return null;
}
