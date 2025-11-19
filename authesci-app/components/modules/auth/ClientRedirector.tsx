'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ClientRedirectorProps {
  redirectUrl: string;
}

export default function ClientRedirector({ redirectUrl }: ClientRedirectorProps) {
  const router = useRouter();

  useEffect(() => {
    if (redirectUrl) {
      window.location.replace(redirectUrl);
    }
  }, [router, redirectUrl]);

  return null; // This component does not render anything
}
