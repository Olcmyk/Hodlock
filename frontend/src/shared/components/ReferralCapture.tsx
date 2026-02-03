'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

const REFERRAL_STORAGE_KEY = 'hodlock_referrer';

export function ReferralCapture() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref && /^0x[a-fA-F0-9]{40}$/.test(ref)) {
      localStorage.setItem(REFERRAL_STORAGE_KEY, ref);
    }
  }, [searchParams]);

  return null;
}

export function getReferrer(): string {
  if (typeof window === 'undefined') {
    return '0x0000000000000000000000000000000000000000';
  }
  return localStorage.getItem(REFERRAL_STORAGE_KEY) || '0x0000000000000000000000000000000000000000';
}
