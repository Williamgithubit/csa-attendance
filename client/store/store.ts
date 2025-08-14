import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { apiSlice } from './api/apiSlice';
import { dashboardApiSlice } from './dashboard/dashboardApiSlice';
import { attendanceApiSlice } from './attendance/attendanceApiSlice';
import authReducer from './auth/authSlice';
import attendanceReducer from './attendance/attendanceSlice';

const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  whitelist: ['auth'], // only auth will be persisted
};

const rootReducer = combineReducers({
  [apiSlice.reducerPath]: apiSlice.reducer,
  [dashboardApiSlice.reducerPath]: dashboardApiSlice.reducer,
  [attendanceApiSlice.reducerPath]: attendanceApiSlice.reducer,
  auth: authReducer,
  attendance: attendanceReducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create the store instance
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    })
    .concat(apiSlice.middleware)
    .concat(dashboardApiSlice.middleware)
    .concat(attendanceApiSlice.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

// Initialize the persistor
const persistor = persistStore(store);

// Export the store and persistor
export { store, persistor };

// Infer the root state type from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;