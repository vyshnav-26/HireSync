'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { ROUTES } from '@/lib/constants';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedUserTypes?: ('candidate' | 'recruiter')[];
}

export function ProtectedRoute({ children, allowedUserTypes }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(ROUTES.LOGIN);
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (!isLoading && isAuthenticated && allowedUserTypes && user) {
      if (!allowedUserTypes.includes(user.userType)) {
        router.push(ROUTES.HOME);
      }
    }
  }, [isAuthenticated, isLoading, allowedUserTypes, user, router]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (allowedUserTypes && user && !allowedUserTypes.includes(user.userType)) {
    return null;
  }

  return <>{children}</>;
}
