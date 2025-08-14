'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadUserFromStorage, setLoading } from '@/store/auth/authSlice';
import { RootState } from '@/types';

export function AuthInitializer() {
  const dispatch = useDispatch();
  const { token, user, loading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    console.log('AuthInitializer - Initializing auth state...');
    
    // Set initial loading state
    dispatch(setLoading(true));

    try {
      // Load user from localStorage when the app starts
      dispatch(loadUserFromStorage());
      console.log('AuthInitializer - Auth state loaded from localStorage');
    } catch (error) {
      console.error('AuthInitializer - Error loading auth state:', error);
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  // This component doesn't render anything
  return null;
}
