'use client';

import { useEffect } from 'react';

export function MSWComponent() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('@/mocks/browser').then(({ worker }) => {
        worker.start({ onUnhandledRequest: 'bypass' });
      });
    }
  }, []);

  return null;
}
