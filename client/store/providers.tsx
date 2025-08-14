'use client';

import { useMemo } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';

// We're using the pre-configured store from store.ts
const initializeStore = () => ({ store, persistor });

interface ProvidersProps {
  children: React.ReactNode;
  // This will be populated at build time by Next.js
  initialState?: any;
}

export function Providers({ children, initialState }: ProvidersProps) {
  const { store: reduxStore, persistor } = useMemo(() => initializeStore(), []);

  return (
    <Provider store={reduxStore}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
