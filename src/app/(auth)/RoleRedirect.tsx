'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function RoleRedirect() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'authenticated') {
      const userRole = session.user?.role;

      if (userRole === 'mitra' && pathname !== '/dashboard') {
        router.push('/dashboard');
      }
    }
  }, [status, session, router, pathname]);

  return null;
}