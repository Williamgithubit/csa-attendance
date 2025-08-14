'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/types';
import { Loader2 } from 'lucide-react';

// Hook to detect client-side
const useIsClient = () => {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);
  return isClient;
};

export default function ProtectedRoute({
  children,
  requiredRole,
}: {
  children: React.ReactNode;
  requiredRole?: string;
}) {
  const router = useRouter();
  const isClient = useIsClient();
  const { token, user, loading, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  useEffect(() => {
    if (!isClient) return;

    // Skip if we've already done the initial check
    if (initialCheckDone) return;

    console.log('ProtectedRoute - Auth state:', { 
      hasToken: !!token, 
      hasUser: !!user, 
      isAuthenticated, 
      loading,
      path: window.location.pathname 
    });

    // If we're still loading, wait
    if (loading) {
      console.log('Auth loading...');
      return;
    }

    // Mark initial check as done
    setInitialCheckDone(true);

    // If not authenticated, redirect to login
    if (!token) {
      console.log('No token found, redirecting to login');
      router.push('/login');
      setIsAuthorized(false);
      return;
    }

    // If we have a token but user data isn't loaded yet, wait
    if (token && !user) {
      console.log('Token found but user data not loaded yet');
      // We'll let the auth initializer handle this case
      return;
    }

    // Log user data for debugging
    console.log('User data:', user);
    console.log('Required role:', requiredRole);
    console.log('User role:', user?.role);

    // Check role if required
    if (requiredRole) {
      if (user?.role === requiredRole || user?.role === 'super_admin') {
        console.log('User has required role or is super_admin, allowing access');
        setIsAuthorized(true);
      } else {
        console.log(`User role '${user?.role}' does not have permission to access this page, redirecting to unauthorized`);
        router.push('/unauthorized');
        setIsAuthorized(false);
      }
    } else {
      console.log('No role required, allowing access');
      setIsAuthorized(true);
    }
  }, [token, user, loading, requiredRole, router, isClient]);

  // Still checking or waiting for client-side render
  if (!isClient || loading || isAuthorized === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Unauthorized
  if (isAuthorized === false) {
    return null;
  }

  return <>{children}</>;
}
